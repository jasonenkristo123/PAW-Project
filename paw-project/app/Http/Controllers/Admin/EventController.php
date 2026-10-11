<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\EventRequest;
use App\Models\Booking;
use App\Models\Category;
use App\Models\Event;
use App\Models\Venue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->renderPage($request);
    }

    public function create(Request $request): Response
    {
        return $this->renderPage($request, 'create');
    }

    public function store(EventRequest $request): RedirectResponse
    {
        Event::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Event created successfully.']);

        return to_route('admin.events.index');
    }

    public function show(Request $request, Event $event): Response
    {
        $event->load(['category', 'venue'])
            ->loadCount('bookings');

        $event->setAttribute('sold_tickets', (int) $event->bookings()
            ->whereIn('status', [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED])
            ->sum('ticket_quantity'));

        return $this->renderPage($request, 'show', $event);
    }

    public function edit(Request $request, Event $event): Response
    {
        $event->load(['category', 'venue']);

        return $this->renderPage($request, 'edit', $event);
    }

    public function update(EventRequest $request, Event $event): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($event, $validated): void {
            $record = Event::query()->lockForUpdate()->findOrFail($event->id);
            $reserved = $record->bookings()
                ->whereIn('status', [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED])
                ->sum('ticket_quantity');

            if ($validated['quota'] < $reserved) {
                throw ValidationException::withMessages([
                    'quota' => 'Ticket quota cannot be lower than the number of reserved tickets.',
                ]);
            }

            $record->update($validated);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Event updated successfully.']);

        return to_route('admin.events.index');
    }

    public function destroy(Event $event): RedirectResponse
    {
        if ($event->bookings()->exists()) {
            throw ValidationException::withMessages([
                'event' => 'This event has active or historical bookings and cannot be deleted. Change its status to cancelled instead.',
            ]);
        }

        try {
            $event->deleteOrFail();
        } catch (QueryException $exception) {
            throw ValidationException::withMessages([
                'event' => 'Cannot delete this event because related records exist.',
            ]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Event deleted successfully.']);

        return to_route('admin.events.index');
    }

    private function renderPage(Request $request, ?string $mode = null, ?Event $event = null): Response
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')],
            'status' => ['nullable', Rule::in([
                Event::STATUS_DRAFT,
                Event::STATUS_PUBLISHED,
                Event::STATUS_CANCELLED,
                Event::STATUS_COMPLETED,
            ])],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $search = $request->string('search')->trim()->toString();
        $categoryId = $request->string('category_id')->toString();
        $status = $request->string('status')->toString();

        $events = Event::query()
            ->with(['category:id,name', 'venue:id,name,capacity'])
            ->withSum([
                'bookings as sold_tickets' => fn ($query) => $query
                    ->whereIn('status', [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED]),
            ], 'ticket_quantity')
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('title', 'like', '%'.$search.'%')
                        ->orWhere('description', 'like', '%'.$search.'%');
                });
            })
            ->when($categoryId !== '', fn (Builder $query) => $query->where('category_id', $categoryId))
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->orderByDesc('date')
            ->orderBy('time')
            ->paginate(6)
            ->withQueryString();

        $events->withPath(route('admin.events.index'));

        // Transform sold_tickets null to 0
        $events->through(function ($item) {
            $item->setAttribute('sold_tickets', (int) ($item->getAttribute('sold_tickets') ?? 0));

            return $item;
        });

        return Inertia::render('admin/events', [
            'events' => $events,
            'categories' => Category::query()->select('id', 'name', 'status')->orderBy('name')->get(),
            'venues' => Venue::query()->select('id', 'name', 'capacity')->where(function (Builder $query) use ($event): void {
                $query->where('status', Venue::STATUS_ACTIVE);
                if ($event !== null) {
                    $query->orWhereKey($event->venue_id);
                }
            })->orderBy('name')->get(),
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
                'status' => $status,
            ],
            'stats' => [
                'events' => Event::count(),
                'categories' => Category::count(),
                'venues' => Venue::count(),
                'bookings' => Booking::count(),
                'published' => Event::where('status', Event::STATUS_PUBLISHED)->count(),
                'draft' => Event::where('status', Event::STATUS_DRAFT)->count(),
            ],
            'dialog' => $mode === null ? null : ['mode' => $mode, 'event' => $event],
        ]);
    }
}
