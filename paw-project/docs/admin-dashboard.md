# Admin dashboard

The Admin link opens `/admin`, with platform totals and a booking management table. `/admin/bookings` opens the same table. Venue management remains at `/admin/venues`; the sidebar has separate links and highlights the current section.

The dashboard uses actual database records. Customer-side demo reservations remain in the session and do not appear here. An empty database shows zero counts and an empty state instead of invented totals.

## Booking actions

- Search by booking code, customer name/email, or event title; combine event and status filters.
- Paginate five bookings per page, ordered by booking date and ID descending.
- Inspect a booking in an accessible side drawer at `/admin/bookings/{id}`.
- Update its status to pending, confirmed, or cancelled. Restoring a cancelled reservation checks event capacity inside a transaction that locks the event and booking. Totals, ticket quantities, customers, and events cannot be changed through this action.
- Delete a booking after confirmation in the UI. This permanently removes the booking record and preserves its customer and event.
- Export the filtered records as CSV, including records beyond the current page. Customer text that might be interpreted as a spreadsheet formula is escaped.

Status changes update reservation records only; payment collection and refunds are not implemented. All routes require authentication and the exact `admin` role on the server.

Implementation: `app/Http/Controllers/Admin/DashboardController.php`, `resources/js/pages/admin/dashboard.jsx`, and `resources/js/layouts/admin-layout.jsx`. No schema changes are needed.

`tests/Feature/Admin/DashboardTest.php` covers access restrictions, counts, pagination, composed filters, drawer data, status validation and capacity, deletion, and filtered CSV export.
