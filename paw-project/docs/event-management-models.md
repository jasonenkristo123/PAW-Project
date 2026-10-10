# Event management database handoff

The five models follow the supplied ERD: `User`, `Category`, `Venue`, `Event`, and `Booking`. Existing Laravel authentication fields and tables are retained. The users migration adds fields to the existing table, so teammates with an existing database can apply it without rebuilding their database.

## Setup

After pulling these files and configuring the database in `.env`, run:

```sh
php artisan migrate
```

The five new migrations run in dependency order and have corresponding `down()` methods. IDs and foreign keys use Laravel's unsigned big integer convention. Rolling back these migrations removes the new event tables and user profile columns, including their data.

## Relationships

| Model      | Relationships                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `User`     | `bookings()` has many bookings                                                                   |
| `Category` | `events()` has many events                                                                       |
| `Venue`    | `events()` has many events                                                                       |
| `Event`    | `category()` belongs to a category; `venue()` belongs to a venue; `bookings()` has many bookings |
| `Booking`  | `user()` belongs to a user; `event()` belongs to an event                                        |

Examples for controllers:

```php
use App\Models\Booking;
use App\Models\Event;

$events = Event::with(['category', 'venue'])
    ->where('status', Event::STATUS_PUBLISHED)
    ->orderBy('date')
    ->orderBy('time')
    ->paginate(12);

$bookings = $request->user()->bookings()
    ->with(['event.category', 'event.venue'])
    ->latest('booking_date')
    ->paginate(10);

$booking = Booking::with(['user', 'event.category', 'event.venue'])
    ->where('booking_code', $code)
    ->firstOrFail();
// Authorize access to this booking before returning it.
```

## Defaults and data types

The ERD does not specify status values or nullability. These initial choices are available as model constants; roles and statuses remain `varchar` columns so your team can extend the workflow.

| Field                                                                     | Behavior                                                                                     |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `users.phone_number`                                                      | Optional string, up to 30 characters; existing registration does not collect it              |
| `users.role`                                                              | Defaults to `user`; constants `ROLE_USER` and `ROLE_ADMIN`                                   |
| Category / venue status                                                   | Defaults to `active`; constants `STATUS_ACTIVE` and `STATUS_INACTIVE`                        |
| Event status                                                              | Defaults to `draft`; constants for `draft`, `published`, `cancelled`, `completed`            |
| Booking status                                                            | Defaults to `pending`; constants for `pending`, `confirmed`, `cancelled`                     |
| `categories.description`, `events.whats_included`, `events.what_to_bring` | Optional text                                                                                |
| `events.date`                                                             | Immutable Carbon date in PHP; `YYYY-MM-DD` when serialized                                   |
| `events.time`                                                             | SQL time; use `HH:MM:SS` as a string, interpreted in the application's chosen event timezone |
| `events.price`, `bookings.total_price`                                    | `decimal(12, 2)` in the database; decimal strings such as `"150000.35"` in PHP and JSON      |
| Capacity, quota, ticket quantity                                          | Integers; capacity and quota are required; booking quantity defaults to `1`                  |
| `bookings.booking_code`                                                   | Unique string; Eloquent generates `BK-` plus a ULID when omitted                             |
| `bookings.booking_date`                                                   | Defaults to the creation time; immutable Carbon datetime in PHP                              |

Roles are deliberately excluded from `User` mass assignment. An authorized admin operation can explicitly assign `$user->role = User::ROLE_ADMIN` and save. Public registration and profile updates should never take a role from request input. The existing Fortify registration/profile handlers do not collect or validate phone numbers yet; add that field to their validated payloads when the UI supports it.

Foreign keys reject missing parents and restrict deletion of a category or venue used by events, and a user or event used by bookings. Deactivate categories/venues and cancel events/bookings to preserve history. The current account deletion controller must handle users with bookings before that feature goes live (for example, reject deletion with a clear validation message or implement an agreed anonymization policy).

Indexes support event filtering by status/date, category/venue lookup, booking history by user/date, and booking totals by event/status.

## Controller responsibilities

Use validated, explicitly selected data for `create()` / `update()`. The models establish persistence and relationships; the controllers or a booking service should enforce:

- Admin authorization for managing categories, venues, events, and user roles; ownership checks for booking reads/updates.
- Supported status values, legal status transitions, nonnegative prices, positive capacity and ticket quantity, and event quota within venue capacity. SQLite does not enforce unsigned integer semantics, so request validation is necessary even in local development.
- Event publication, active category/venue, booking deadlines, and available ticket checks. Treat quota as the event's total ticket limit and explicitly define which booking statuses reserve tickets.
- Booking ownership from the authenticated user, and price/quantity calculations on the server. Booking status, total price, reference, and date should come from trusted application logic.
- A database transaction with an event row lock (`lockForUpdate()` on a database that supports it) around availability checks and booking creation. Every booking/cancellation path must follow the same locking strategy to prevent overselling.

For a fixed ticket price, exact decimal arithmetic is available through the already-installed `brick/math` dependency:

```php
use Brick\Math\BigDecimal;

$totalPrice = (string) BigDecimal::of($event->price)
    ->multipliedBy($validated['ticket_quantity'])
    ->toScale(2);

// Perform this write inside the booking transaction, after authorization
// and availability checks, using the event loaded under the row lock.
$booking = $request->user()->bookings()->create([
    'event_id' => $event->id,
    'ticket_quantity' => $validated['ticket_quantity'],
    'total_price' => $totalPrice,
]);
```

`total_price` is the historical price at booking time and is not recalculated when an event's price changes. Query-builder / bulk inserts bypass Eloquent's generated booking references; supply a unique `booking_code` explicitly for those writes.

## Test data and checks

Factories create the required related records automatically:

```php
use App\Models\Booking;
use App\Models\Category;
use App\Models\Event;
use App\Models\User;
use App\Models\Venue;

$event = Event::factory()
    ->for(Category::factory())
    ->for(Venue::factory()->state(['capacity' => 100]))
    ->create(['status' => Event::STATUS_PUBLISHED, 'quota' => 50]);

$booking = Booking::factory()
    ->for(User::factory())
    ->for($event)
    ->create(['ticket_quantity' => 2]);
// The booking factory calculates total_price from the related event and quantity.
```

Run checks using a PHP installation with the PDO SQLite extension enabled (the test database is isolated in memory):

```sh
php artisan test --compact tests/Feature/EventManagement
php artisan test --compact
vendor/bin/phpstan analyse --no-progress
```

The database tests cover both sides of each relationship, exact money/date serialization, generated and imported booking references, unique codes, foreign key enforcement, protected deletion, database defaults, and rolling back/reapplying the new migrations while keeping existing users.

Framework references: [Laravel migrations](https://laravel.com/framework/docs/13.x/migrations), [Eloquent relationships](https://laravel.com/framework/docs/13.x/eloquent-relationships), and [attribute casting](https://laravel.com/framework/docs/13.x/eloquent-mutators).
