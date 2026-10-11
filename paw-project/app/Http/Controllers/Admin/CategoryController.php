<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Booking;
use App\Models\Category;
use App\Models\Event;
use App\Models\Venue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->renderPage($request);
    }

    public function create(Request $request): Response
    {
        return $this->renderPage($request, 'create');
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        Category::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category created successfully.']);

        return to_route('admin.categories.index');
    }

    public function show(Request $request, Category $category): Response
    {
        $category->loadCount('events')->load(['events' => fn ($query) => $query
            ->with('venue:id,name')
            ->select(['id', 'category_id', 'venue_id', 'title', 'date', 'time', 'quota', 'status'])
            ->orderByDesc('date')->limit(6)]);

        return $this->renderPage($request, 'show', $category);
    }

    public function edit(Request $request, Category $category): Response
    {
        return $this->renderPage($request, 'edit', $category->loadCount('events'));
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category updated successfully.']);

        return to_route('admin.categories.index');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->events()->exists()) {
            $this->rejectDeletion();
        }

        try {
            $category->deleteOrFail();
        } catch (QueryException $exception) {
            if (Event::where('category_id', $category->id)->exists()) {
                $this->rejectDeletion();
            }

            throw $exception;
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category deleted successfully.']);

        return to_route('admin.categories.index');
    }

    private function rejectDeletion(): never
    {
        throw ValidationException::withMessages([
            'category' => 'This category has assigned events and cannot be deleted. Mark it inactive instead.',
        ]);
    }

    private function renderPage(Request $request, ?string $mode = null, ?Category $category = null): Response
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in([Category::STATUS_ACTIVE, Category::STATUS_INACTIVE])],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->toString();

        $categories = Category::query()->withCount('events')
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('name', 'like', '%'.$search.'%')
                        ->orWhere('description', 'like', '%'.$search.'%');
                });
            })
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->orderBy('id')
            ->paginate(6)->withQueryString();

        $categories->withPath(route('admin.categories.index'));

        return Inertia::render('admin/categories', [
            'categories' => $categories,
            'filters' => ['search' => $search, 'status' => $status],
            'stats' => [
                'events' => Event::count(),
                'categories' => Category::count(),
                'venues' => Venue::count(),
                'bookings' => Booking::count(),
                'active' => Category::where('status', Category::STATUS_ACTIVE)->count(),
                'inactive' => Category::where('status', Category::STATUS_INACTIVE)->count(),
            ],
            'dialog' => $mode === null ? null : ['mode' => $mode, 'category' => $category],
        ]);
    }
}
