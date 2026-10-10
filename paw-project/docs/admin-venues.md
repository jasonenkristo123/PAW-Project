# Admin venue management

Run `php artisan migrate` to apply the event tables and the existing additive user role migration. `users.role` defaults to `user`; only the exact `admin` role is permitted into this workspace. Registration and public profile updates cannot mass-assign a role.

Promote an existing teammate's account from a trusted local terminal:

```sh
php artisan tinker
```

```php
$user = App\Models\User::where('email', 'your-admin@example.com')->firstOrFail();
$user->role = App\Models\User::ROLE_ADMIN;
$user->save();
```

Sign in with that account, then open `/admin/venues`. The admin link opens the booking dashboard at `/admin` and appears only for administrators. Venues remains a separate management page. Guest requests redirect to login, and every authenticated non-admin request receives HTTP 403, including create/update/delete requests.

## Backend

- `EnsureUserIsAdmin` is registered as the `admin` middleware alias in `bootstrap/app.php`.
- `routes/web.php` registers the standard `admin.venues.*` resource routes behind `auth` and `admin`.
- `Admin/VenueController` handles the list, create, detail, edit, update, and delete operations. Successful writes redirect to the canonical list with an Inertia toast.
- `Admin/VenueRequest` authorizes admin writes and validates name, address, positive integer capacity, and `active`/`inactive` status. Capacity cannot be reduced below the largest quota of the venue's existing events.
- Venue deletion returns a validation error when events are attached. The database foreign key remains the final protection if an event is attached concurrently. Mark the venue unavailable instead.
- Listing supports name/address search, availability filtering, six records per page, consistent alphabetical ordering, event counts, and real platform totals. Pagination retains filters.

## Frontend

The page lives in `resources/js/pages/admin/venues.jsx`, using `resources/js/layouts/admin-layout.jsx`. It includes a responsive sidebar, database-backed overview cards, search/filter controls, pagination, accessible dialogs, inline validation, and confirmation before deletion. Available/unavailable map to the existing `active`/`inactive` database values.

Create, detail, and edit resource URLs render the same table with the appropriate dialog, so they can be bookmarked and opened directly. The detail dialog includes up to five recent events. Other management sections are shown as upcoming sections; this change implements venue management.

Wayfinder generates the client route helpers:

```sh
php artisan wayfinder:generate --with-form
npm run build
```

The Vite build also invokes Wayfinder automatically.

## Verification

```sh
php artisan test --compact tests/Feature/Admin/VenueTest.php
vendor/bin/phpstan analyse --memory-limit=512M
vendor/bin/pint --test
npm run check
npm run build
```

The tests check all seven resource endpoints against guests and ordinary users, plus CRUD, validation, search/filtering, pagination, relationship counts, restricted deletion, capacity compatibility, direct dialog URLs, unknown roles, and missing records. The project's default test connection uses in-memory SQLite and requires PDO SQLite.
