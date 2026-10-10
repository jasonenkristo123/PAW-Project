import { Head, Link, router, useForm } from '@inertiajs/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
    CalendarDays,
    CheckCheck,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    MapPin,
    ReceiptText,
    Search,
    Shapes,
    Ticket,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';
import {
    BookingStatus,
    eventDate,
    money,
    primaryButton,
} from '@/components/event-ui';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes/admin';
import { destroy, exportMethod, show, update } from '@/routes/admin/bookings';
import { index as venuesIndex } from '@/routes/admin/venues';

const number = new Intl.NumberFormat('en-US');
const statuses = [
    { value: '', label: 'All', count: 'bookings' },
    { value: 'pending', label: 'Pending', count: 'pending' },
    { value: 'confirmed', label: 'Confirmed', count: 'confirmed' },
    { value: 'cancelled', label: 'Cancelled', count: 'cancelled' },
];
const metrics = [
    {
        key: 'events',
        label: 'Total Events',
        caption: 'Across your platform',
        icon: CalendarDays,
    },
    {
        key: 'categories',
        label: 'Categories',
        caption: 'Organize your experiences',
        icon: Shapes,
    },
    {
        key: 'venues',
        label: 'Venues Registered',
        caption: 'Locations for your events',
        icon: MapPin,
    },
    {
        key: 'bookings',
        label: 'Total Bookings',
        caption: 'All customer reservations',
        icon: ReceiptText,
    },
];

function bookedAt(value) {
    return (
        new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Jakarta',
        }).format(new Date(value)) + ' WIB'
    );
}

function DeleteBooking({ booking, filters, onClose }) {
    const form = useForm({});
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !form.processing) onClose();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete this booking?</DialogTitle>
                    <DialogDescription>
                        Permanently remove {booking.booking_code} for{' '}
                        {booking.user.name}? This cannot be undone. Cancellation
                        keeps the booking history.
                    </DialogDescription>
                </DialogHeader>
                <InputError message={form.errors.booking} />
                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={form.processing}
                        onClick={onClose}
                    >
                        Keep booking
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={form.processing}
                        onClick={() =>
                            form.delete(
                                destroy.url(booking.id, { query: filters }),
                                { preserveScroll: true, onSuccess: onClose },
                            )
                        }
                    >
                        {form.processing ? 'Deleting…' : 'Delete booking'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function BookingDrawer({ booking, filters, onClose }) {
    const form = useForm({ status: booking.status });
    const [deleting, setDeleting] = useState(false);
    const sectionClass =
        'rounded-xl border border-agendain-border-card bg-agendain-surface-soft p-4';
    return (
        <>
            <DialogPrimitive.Root
                open
                onOpenChange={(open) => {
                    if (!open && !form.processing && !deleting) onClose();
                }}
            >
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px]" />
                    <DialogPrimitive.Content
                        aria-describedby="booking-drawer-description"
                        onEscapeKeyDown={(event) => {
                            if (form.processing) event.preventDefault();
                        }}
                        onInteractOutside={(event) => {
                            if (form.processing) event.preventDefault();
                        }}
                        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[410px] flex-col border-l border-agendain-border-card bg-white text-agendain-text shadow-2xl outline-none"
                    >
                        <div className="flex items-center justify-between border-b border-agendain-border-header bg-agendain-surface-soft px-5 py-5">
                            <DialogPrimitive.Title className="text-base font-semibold">
                                Booking details
                            </DialogPrimitive.Title>
                            <button
                                aria-label="Close booking details"
                                disabled={form.processing}
                                onClick={onClose}
                                className="rounded-lg p-2 text-agendain-text-muted hover:bg-agendain-badge"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <DialogPrimitive.Description
                            id="booking-drawer-description"
                            className="sr-only"
                        >
                            Inspect the customer and event, update booking
                            status, or delete this booking.
                        </DialogPrimitive.Description>
                        <div className="space-y-4 overflow-y-auto p-5">
                            <div className={sectionClass}>
                                <p className="mb-3 text-[10px] font-semibold tracking-wide text-agendain-text-muted uppercase">
                                    Customer information
                                </p>
                                <div className="flex items-start gap-3">
                                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-agendain-badge text-xs font-semibold text-agendain-purple">
                                        {booking.user.name
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold">
                                            {booking.user.name}
                                        </p>
                                        <p className="mt-1 text-xs break-all text-agendain-text-muted">
                                            {booking.user.email}
                                        </p>
                                        <p className="mt-1 text-xs text-agendain-purple">
                                            {booking.user.phone_number ||
                                                'No phone number provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className={sectionClass}>
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <p className="text-[10px] font-semibold tracking-wide text-agendain-text-muted uppercase">
                                        Event information
                                    </p>
                                    <span className="rounded-full bg-agendain-badge px-2 py-1 text-[9px] text-agendain-purple">
                                        {booking.event.category.name}
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold">
                                    {booking.event.title}
                                </h3>
                                <p className="mt-3 flex items-center gap-2 text-xs">
                                    <CalendarDays
                                        size={14}
                                        className="text-agendain-purple"
                                    />
                                    {eventDate(booking.event.date, true)}
                                </p>
                                <p className="mt-1 pl-6 text-[11px] text-agendain-text-muted">
                                    {booking.event.time.slice(0, 5)} WIB
                                </p>
                                <p className="mt-3 flex items-center gap-2 text-xs">
                                    <MapPin
                                        size={14}
                                        className="text-agendain-purple"
                                    />
                                    {booking.event.venue.name}
                                </p>
                                <p className="mt-1 pl-6 text-[11px] leading-relaxed text-agendain-text-muted">
                                    {booking.event.venue.address}
                                </p>
                            </div>
                            <div className={sectionClass}>
                                <p className="mb-3 text-[10px] font-semibold tracking-wide text-agendain-text-muted uppercase">
                                    Booking information
                                </p>
                                <dl className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="col-span-2">
                                        <dt className="text-[10px] text-agendain-text-muted">
                                            Booking reference
                                        </dt>
                                        <dd className="mt-1 font-mono font-semibold break-all text-agendain-purple">
                                            {booking.booking_code}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-[10px] text-agendain-text-muted">
                                            Tickets
                                        </dt>
                                        <dd className="mt-1 font-semibold">
                                            {booking.ticket_quantity} ticket(s)
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-[10px] text-agendain-text-muted">
                                            Total amount
                                        </dt>
                                        <dd className="mt-1 font-semibold">
                                            {money(booking.total_price)}
                                        </dd>
                                    </div>
                                    <div className="col-span-2 border-t border-agendain-border-card pt-3">
                                        <dt className="text-[10px] text-agendain-text-muted">
                                            Booked at
                                        </dt>
                                        <dd className="mt-1">
                                            {bookedAt(booking.booking_date)}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                            <form
                                className={sectionClass}
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    form.patch(
                                        update.url(booking.id, {
                                            query: filters,
                                        }),
                                        { preserveScroll: true },
                                    );
                                }}
                            >
                                <p className="mb-3 text-[10px] font-semibold tracking-wide text-agendain-text-muted uppercase">
                                    Booking status
                                </p>
                                <div className="mb-4 flex items-center justify-between text-xs">
                                    <span className="text-agendain-text-muted">
                                        Current status
                                    </span>
                                    <BookingStatus status={booking.status} />
                                </div>
                                <Label
                                    htmlFor="booking-status"
                                    className="text-xs"
                                >
                                    Update status
                                </Label>
                                <select
                                    id="booking-status"
                                    value={form.data.status}
                                    disabled={form.processing}
                                    onChange={(event) =>
                                        form.setData(
                                            'status',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 h-10 w-full rounded-lg border border-agendain-border-input bg-white px-3 text-xs focus:ring-2 focus:ring-agendain-purple/25"
                                >
                                    {statuses
                                        .filter((status) => status.value)
                                        .map((status) => (
                                            <option
                                                key={status.value}
                                                value={status.value}
                                            >
                                                {status.label}
                                            </option>
                                        ))}
                                </select>
                                <InputError
                                    message={form.errors.status}
                                    className="mt-2"
                                />
                                <Button
                                    type="submit"
                                    disabled={
                                        form.processing ||
                                        form.data.status === booking.status
                                    }
                                    className={`mt-3 w-full ${primaryButton}`}
                                >
                                    {form.processing
                                        ? 'Saving…'
                                        : 'Save status'}
                                </Button>
                                <p className="mt-2 text-[10px] leading-relaxed text-agendain-text-muted">
                                    This updates the reservation record. Payment
                                    and refund processing are separate.
                                </p>
                            </form>
                            <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
                                <p className="text-[10px] font-semibold tracking-wide text-red-600 uppercase">
                                    Danger zone
                                </p>
                                <p className="mt-2 text-[11px] leading-relaxed text-agendain-text-muted">
                                    Deletion permanently removes this booking.
                                    Cancel it to retain its history.
                                </p>
                                <Button
                                    variant="destructive"
                                    className="mt-3 w-full"
                                    disabled={form.processing}
                                    onClick={() => setDeleting(true)}
                                >
                                    <Trash2 size={14} /> Delete booking
                                </Button>
                            </div>
                        </div>
                    </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
            {deleting && (
                <DeleteBooking
                    booking={booking}
                    filters={filters}
                    onClose={() => setDeleting(false)}
                />
            )}
        </>
    );
}

export default function Dashboard({
    bookings,
    stats,
    filters,
    events,
    selectedBooking,
}) {
    const [search, setSearch] = useState(filters.search);
    function filter(changes) {
        router.get(
            dashboard.url(),
            { ...filters, search, ...changes },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }
    function closeDrawer() {
        router.get(
            dashboard.url({ query: filters }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }
    const start = Math.max(
        1,
        Math.min(bookings.current_page - 2, bookings.last_page - 4),
    );
    const pages = Array.from(
        { length: Math.min(5, bookings.last_page) },
        (_, offset) => start + offset,
    );

    return (
        <>
            <Head title="Admin Dashboard" />
            <section
                id="overview"
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-agendain-border-card bg-white px-6 py-5"
            >
                <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-wider text-agendain-purple">
                        AGENDAIN · PLATFORM MANAGEMENT
                    </p>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Admin Management Dashboard
                    </h1>
                    <p className="mt-1 text-xs text-agendain-text-muted">
                        Your platform at a glance, with every reservation in
                        view.
                    </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-agendain-badge px-3 py-1.5 text-[11px] text-agendain-text-muted">
                    <CheckCheck size={14} className="text-emerald-700" /> Admin
                    access verified
                </span>
            </section>
            <section
                aria-label="Platform statistics"
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
                {metrics.map(({ key, label, caption, icon: Icon }) => (
                    <div
                        key={key}
                        className={`rounded-xl border p-5 ${key === 'bookings' ? 'border-agendain-purple/25 bg-gradient-to-br from-white to-agendain-badge' : 'border-agendain-border-card bg-white'}`}
                    >
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <span
                                className={`text-xs ${key === 'bookings' ? 'font-semibold text-agendain-purple' : 'text-agendain-text-muted'}`}
                            >
                                {label}
                            </span>
                            <span
                                className={`grid h-8 w-8 place-items-center rounded-lg ${key === 'bookings' ? 'bg-agendain-purple text-white' : 'bg-agendain-badge text-agendain-purple'}`}
                            >
                                <Icon size={16} />
                            </span>
                        </div>
                        <p
                            className={`text-3xl font-semibold tracking-tight ${key === 'bookings' ? 'text-agendain-purple' : ''}`}
                        >
                            {number.format(stats[key])}
                        </p>
                        <p className="mt-1.5 text-[10px] text-agendain-text-muted">
                            {caption}
                        </p>
                    </div>
                ))}
            </section>
            <div className="flex flex-wrap gap-2 rounded-xl bg-agendain-badge p-2 text-xs">
                {metrics.map(({ key, label, icon: Icon }) => {
                    const className = `inline-flex items-center gap-2 rounded-lg px-3 py-2 ${key === 'bookings' ? 'bg-white font-semibold text-agendain-purple shadow-xs' : 'text-agendain-text-muted'}`;
                    const content = (
                        <>
                            <Icon size={13} />
                            {label}
                            <span className="rounded-full bg-agendain-surface-soft px-1.5 text-[10px]">
                                {number.format(stats[key])}
                            </span>
                        </>
                    );
                    return key === 'venues' ? (
                        <Link
                            key={key}
                            href={venuesIndex()}
                            className={className}
                        >
                            {content}
                        </Link>
                    ) : key === 'bookings' ? (
                        <Link
                            key={key}
                            href={dashboard()}
                            className={className}
                        >
                            {content}
                        </Link>
                    ) : (
                        <span key={key} className={className}>
                            {content}
                        </span>
                    );
                })}
            </div>
            <section
                aria-labelledby="booking-heading"
                className="rounded-xl border border-agendain-border-card bg-white p-4 sm:p-6"
            >
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2
                            id="booking-heading"
                            className="text-lg font-semibold tracking-tight"
                        >
                            Booking Management
                        </h2>
                        <p className="mt-1 text-xs text-agendain-text-muted">
                            View and manage reservations created by your
                            customers.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!bookings.data.length}
                            onClick={() => {
                                const first = bookings.data[0];
                                if (!first) return;
                                router.get(
                                    show.url(first.id, {
                                        query: filters,
                                    }),
                                    {},
                                    {
                                        preserveScroll: true,
                                        preserveState: true,
                                    },
                                );
                            }}
                        >
                            <Eye size={14} /> Inspect booking
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-agendain-purple/15 bg-agendain-badge text-agendain-purple"
                        >
                            <a href={exportMethod.url({ query: filters })}>
                                <Download size={14} /> Export CSV
                            </a>
                        </Button>
                    </div>
                </div>
                <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <form
                        role="search"
                        onSubmit={(event) => {
                            event.preventDefault();
                            filter({});
                        }}
                        className="flex flex-wrap gap-2"
                    >
                        <div className="relative">
                            <Search
                                size={14}
                                className="absolute top-3 left-3 text-agendain-text-muted"
                            />
                            <input
                                aria-label="Search bookings"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                maxLength={100}
                                placeholder="Search bookings…"
                                className="h-10 w-full rounded-lg border border-agendain-border-card bg-agendain-surface-soft pr-3 pl-9 text-xs outline-none focus:ring-2 focus:ring-agendain-purple/25"
                            />
                        </div>
                        <select
                            aria-label="Filter by event"
                            value={filters.event_id}
                            onChange={(event) =>
                                filter({ event_id: event.target.value })
                            }
                            className="h-10 max-w-full rounded-lg border border-agendain-border-card bg-agendain-surface-soft px-3 text-xs sm:max-w-52"
                        >
                            <option value="">All events</option>
                            {events.map((event) => (
                                <option key={event.id} value={event.id}>
                                    {event.title}
                                </option>
                            ))}
                        </select>
                        <Button
                            variant="ghost"
                            size="sm"
                            type="submit"
                            className="h-10 text-agendain-purple"
                        >
                            Search
                        </Button>
                    </form>
                    <div
                        aria-label="Booking status filters"
                        className="flex flex-wrap gap-1"
                    >
                        {statuses.map((status) => (
                            <button
                                key={status.value}
                                aria-pressed={filters.status === status.value}
                                onClick={() => filter({ status: status.value })}
                                className={`rounded-full px-3 py-2 text-[11px] ${filters.status === status.value ? 'bg-agendain-purple font-semibold text-white' : 'bg-agendain-surface-soft text-agendain-text-muted hover:bg-agendain-badge'}`}
                            >
                                {status.label} (
                                {number.format(stats[status.count])})
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[790px] text-left text-xs">
                        <caption className="sr-only">
                            Customer bookings, event dates, ticket quantities,
                            totals and status
                        </caption>
                        <thead className="bg-agendain-surface-soft text-[10px] tracking-wide text-agendain-text-muted uppercase">
                            <tr>
                                {[
                                    'Booking ID',
                                    'Customer',
                                    'Event',
                                    'Event date',
                                    'Tickets',
                                    'Total',
                                    'Booked at',
                                    'Status',
                                    '',
                                ].map((heading) => (
                                    <th
                                        scope="col"
                                        key={heading}
                                        className="px-3 py-3 font-semibold first:rounded-l-lg last:rounded-r-lg"
                                    >
                                        {heading || (
                                            <span className="sr-only">
                                                Actions
                                            </span>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-agendain-border-header">
                            {bookings.data.map((booking) => (
                                <tr
                                    key={booking.id}
                                    className="hover:bg-agendain-surface-hover"
                                >
                                    <td className="px-3 py-5">
                                        <Link
                                            href={show(booking.id, {
                                                query: filters,
                                            })}
                                            preserveScroll
                                            preserveState
                                            aria-label={`Inspect ${booking.booking_code}`}
                                            className="block max-w-28 font-mono text-[10px] font-semibold break-all text-agendain-purple hover:underline"
                                        >
                                            {booking.booking_code}
                                        </Link>
                                    </td>
                                    <td className="px-3 py-5">
                                        <p className="font-semibold">
                                            {booking.user.name}
                                        </p>
                                        <p
                                            className="mt-1 max-w-40 truncate text-[10px] text-agendain-text-muted"
                                            title={booking.user.email}
                                        >
                                            {booking.user.email}
                                        </p>
                                    </td>
                                    <td className="max-w-44 px-3 py-5 leading-relaxed">
                                        {booking.event.title}
                                    </td>
                                    <td className="px-3 py-5 text-[11px] text-agendain-text-muted">
                                        {eventDate(booking.event.date)}
                                    </td>
                                    <td className="px-3 py-5">
                                        <span className="inline-flex flex-col items-center rounded-xl bg-agendain-badge px-2.5 py-1.5 text-[10px] text-agendain-purple">
                                            <span className="font-semibold">
                                                {booking.ticket_quantity}
                                            </span>
                                            Tickets
                                        </span>
                                    </td>
                                    <td className="px-3 py-5 font-medium whitespace-nowrap">
                                        {money(booking.total_price)}
                                    </td>
                                    <td className="px-3 py-5 text-[10px] leading-relaxed text-agendain-text-muted">
                                        {bookedAt(booking.booking_date)}
                                    </td>
                                    <td className="px-3 py-5">
                                        <BookingStatus
                                            status={booking.status}
                                        />
                                    </td>
                                    <td className="px-3 py-5">
                                        <Link
                                            href={show(booking.id, {
                                                query: filters,
                                            })}
                                            preserveScroll
                                            preserveState
                                            aria-label={`View ${booking.booking_code}`}
                                            className="inline-flex rounded-lg p-2 text-agendain-text-muted hover:bg-agendain-badge hover:text-agendain-purple"
                                        >
                                            <Eye size={15} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {bookings.data.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-14 text-center">
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-agendain-badge text-agendain-purple">
                            <Ticket size={25} />
                        </span>
                        <h3 className="text-sm font-semibold">
                            {filters.search ||
                            filters.status ||
                            filters.event_id
                                ? 'No bookings match your filters'
                                : 'Your booking overview is ready'}
                        </h3>
                        <p className="max-w-sm text-xs leading-relaxed text-agendain-text-muted">
                            {filters.search ||
                            filters.status ||
                            filters.event_id
                                ? 'Try another customer, event, or booking status.'
                                : 'Database reservations will appear here. The attendee demo bookings are saved separately in the session.'}
                        </p>
                        {(filters.search ||
                            filters.status ||
                            filters.event_id) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearch('');
                                    filter({
                                        search: '',
                                        status: '',
                                        event_id: '',
                                    });
                                }}
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>
                )}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-agendain-border-header pt-4">
                    <p className="text-[11px] text-agendain-text-muted">
                        Showing {bookings.from ?? 0}–{bookings.to ?? 0} of{' '}
                        {number.format(bookings.total)} bookings
                    </p>
                    <nav
                        aria-label="Booking pagination"
                        className="flex items-center gap-1"
                    >
                        {bookings.prev_page_url ? (
                            <Link
                                href={bookings.prev_page_url}
                                preserveScroll
                                aria-label="Previous page"
                                className="rounded-lg p-2 text-agendain-purple"
                            >
                                <ChevronLeft size={15} />
                            </Link>
                        ) : (
                            <span className="p-2 text-agendain-placeholder">
                                <ChevronLeft size={15} />
                            </span>
                        )}
                        {pages.map((page) => (
                            <Link
                                key={page}
                                href={dashboard({
                                    query: { ...filters, page },
                                })}
                                preserveScroll
                                aria-current={
                                    page === bookings.current_page
                                        ? 'page'
                                        : undefined
                                }
                                className={`grid h-8 w-8 place-items-center rounded-lg text-xs ${page === bookings.current_page ? 'bg-agendain-purple text-white' : 'bg-agendain-badge text-agendain-purple'}`}
                            >
                                {page}
                            </Link>
                        ))}
                        {bookings.next_page_url ? (
                            <Link
                                href={bookings.next_page_url}
                                preserveScroll
                                aria-label="Next page"
                                className="rounded-lg p-2 text-agendain-purple"
                            >
                                <ChevronRight size={15} />
                            </Link>
                        ) : (
                            <span className="p-2 text-agendain-placeholder">
                                <ChevronRight size={15} />
                            </span>
                        )}
                    </nav>
                </div>
            </section>
            {selectedBooking && (
                <BookingDrawer
                    key={`${selectedBooking.id}-${selectedBooking.status}`}
                    booking={selectedBooking}
                    filters={filters}
                    onClose={closeDrawer}
                />
            )}
        </>
    );
}
