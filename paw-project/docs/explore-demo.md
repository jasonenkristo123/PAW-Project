# Signed-in event experience

Login redirects to `/events` (or a previously requested protected URL). The shared responsive navbar has Events, My Bookings, and an Admin link for users with `role = admin`. The admin endpoints also enforce that role on the server.

## Pages

- `/events`: searchable, filterable, paginated event cards.
- `/events/{id}`: details, seat availability, and a booking form with up to four tickets per booking.
- `/my-bookings`: booking filters, cancellation, and a printable demo pass.

`app/Support/DemoEventCatalog.php` owns the sample catalog. Dates are relative to today so the preview remains useful. Local photos in `public/images/events/` were downloaded from Unsplash; the UI works without an external image request.

`ExploreController` stores sample bookings in the authenticated session. A new session starts with confirmed, pending, cancelled, and completed examples. Reservations and cancellations update availability in that session. Prices and seat limits are checked server-side; paid sample bookings include a Rp5,000 service fee and free events have no fee. No money is collected, and no database events or bookings are created. Logging out clears the sample bookings.

For production, replace the catalog and session helpers with `Event` and `Booking` queries scoped to the authenticated user. Reserve capacity in a database transaction, add payment processing before confirmation, and generate real tickets only after confirmation. The current demo pass explicitly says it is not valid for venue entry.

## Validation

`tests/Feature/ExploreTest.php` covers authentication, catalog rendering, server-controlled totals, free events, capacity, validation, cancellation, and shared roles. Login redirect assertions also cover the new destination.
