<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VenueRequest;
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

class VenueController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->renderPage($request);
    }

    public function create(Request $request): Response
    {
        return $this->renderPage($request, 'create');
    }

    public function store(VenueRequest $request): RedirectResponse
    {
        Venue::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Venue created successfully.']);

        return to_route('admin.venues.index');
    }

    public function show(Request $request, Venue $venue): Response
    {
        $venue->loadCount('events')->load(['events' => fn ($query) => $query
            ->select(['id', 'venue_id', 'title', 'date', 'time', 'quota', 'status'])
            ->orderByDesc('date')->limit(5)]);

        return $this->renderPage($request, 'show', $venue);
    }

    public function edit(Request $request, Venue $venue): Response
    {
        return $this->renderPage($request, 'edit', $venue->loadCount('events'));
    }

    public function update(VenueRequest $request, Venue $venue): RedirectResponse
    {
        $venue->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Venue updated successfully.']);

        return to_route('admin.venues.index');
    }

    public function destroy(Venue $venue): RedirectResponse
    {
        if ($venue->events()->exists()) {
            $this->rejectDeletion();
        }

        try {
            $venue->deleteOrFail();
        } catch (QueryException $exception) {
            // A new event may have been attached between the check and delete.
            if (Event::where('venue_id', $venue->id)->exists()) {
                $this->rejectDeletion();
            }

            throw $exception;
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Venue deleted successfully.']);

        return to_route('admin.venues.index');
    }

    private function rejectDeletion(): never
    {
        throw ValidationException::withMessages([
            'venue' => 'This venue has events and cannot be deleted. Mark it unavailable instead.',
        ]);
    }

    private function renderPage(Request $request, ?string $mode = null, ?Venue $venue = null): Response
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in([Venue::STATUS_ACTIVE, Venue::STATUS_INACTIVE])],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->toString();

        $venues = Venue::query()->withCount('events')
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('name', 'like', '%'.$search.'%')
                        ->orWhere('address', 'like', '%'.$search.'%');
                });
            })
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->orderBy('name')->orderBy('id')
            ->paginate(6)->withQueryString();

        // Use the canonical index URL for pagination, including on modal routes.
        $venues->withPath(route('admin.venues.index'));

        return Inertia::render('admin/venues/index', [
            'venues' => $venues,
            'filters' => ['search' => $search, 'status' => $status],
            'stats' => [
                'events' => Event::count(),
                'categories' => Category::count(),
                'venues' => Venue::count(),
                'bookings' => Booking::count(),
                'available' => Venue::where('status', Venue::STATUS_ACTIVE)->count(),
                'unavailable' => Venue::where('status', Venue::STATUS_INACTIVE)->count(),
            ],
            'dialog' => $mode === null ? null : ['mode' => $mode, 'venue' => $venue],
        ]);
    }
}
