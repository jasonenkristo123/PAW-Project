import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    Clock3,
    Printer,
    Search,
    Ticket,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import {
    BookingStatus,
    EventImage,
    VenueLine,
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
import { cancel } from '@/routes/bookings';
import { index, show } from '@/routes/events';

function CancelBooking({ booking, onClose }) {
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
                    <DialogTitle>Cancel this reservation?</DialogTitle>
                    <DialogDescription>
                        Your {booking.ticket_quantity} ticket(s) for{' '}
                        {booking.event.title} will be cancelled. You can book
                        again if seats are available.
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
                            form.post(cancel.url(booking.code), {
                                preserveScroll: true,
                                onSuccess: onClose,
                            })
                        }
                    >
                        {form.processing ? 'Cancelling…' : 'Cancel reservation'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Bookings({ bookings }) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedCode, setSelectedCode] = useState(
        bookings.find((booking) => booking.status === 'confirmed')?.code,
    );
    const [cancelling, setCancelling] = useState(null);
    const upcoming = bookings.filter((booking) =>
        ['confirmed', 'pending'].includes(booking.status),
    );
    const matches = (booking) =>
        filter === 'all' ||
        (filter === 'upcoming'
            ? ['confirmed', 'pending'].includes(booking.status)
            : booking.status === filter);
    const visible = bookings.filter(
        (booking) =>
            matches(booking) &&
            `${booking.code} ${booking.event.title}`
                .toLowerCase()
                .includes(search.toLowerCase()),
    );
    const selected =
        bookings.find(
            (booking) =>
                booking.code === selectedCode && booking.status === 'confirmed',
        ) ?? bookings.find((booking) => booking.status === 'confirmed');

    return (
        <>
            <Head title="My Bookings" />
            <header className="mb-8 flex flex-wrap items-end justify-between gap-4 print:hidden">
                <div>
                    <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-agendain-badge px-2.5 py-1 text-[10px] font-medium text-agendain-purple">
                        <Ticket size={12} /> Your experience collection
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        My Bookings
                    </h1>
                    <p className="mt-3 text-sm text-agendain-text-muted">
                        Good plans, all in one place. Keep track of what comes
                        next.
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className="rounded-xl bg-white px-3 py-2 text-xs text-agendain-text-muted">
                        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        {upcoming.length} upcoming
                    </span>
                    <span className="rounded-xl bg-white px-3 py-2 text-xs text-agendain-text-muted">
                        {
                            bookings.filter(
                                (booking) => booking.status === 'completed',
                            ).length
                        }{' '}
                        completed
                    </span>
                </div>
            </header>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-agendain-border-card bg-white p-3 print:hidden">
                <div className="flex flex-wrap gap-1 rounded-xl bg-agendain-badge p-1">
                    {['all', 'upcoming', 'cancelled', 'completed'].map(
                        (value) => (
                            <button
                                key={value}
                                aria-pressed={filter === value}
                                onClick={() => setFilter(value)}
                                className={`rounded-lg px-3 py-2 text-xs capitalize ${filter === value ? 'bg-white font-semibold text-agendain-purple shadow-xs' : 'text-agendain-text-muted'}`}
                            >
                                {value}{' '}
                                <span className="ml-1 text-[10px]">
                                    {value === 'all'
                                        ? bookings.length
                                        : value === 'upcoming'
                                          ? upcoming.length
                                          : bookings.filter(
                                                (booking) =>
                                                    booking.status === value,
                                            ).length}
                                </span>
                            </button>
                        ),
                    )}
                </div>
                <div className="relative w-full sm:w-60">
                    <Search
                        size={14}
                        className="absolute top-3 left-3 text-agendain-text-muted"
                    />
                    <input
                        aria-label="Search bookings"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Filter by reference or title…"
                        className="h-10 w-full rounded-xl bg-agendain-surface-soft pr-3 pl-9 text-xs outline-none focus:ring-2 focus:ring-agendain-purple/25"
                    />
                </div>
            </div>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] print:block">
                <section
                    aria-label="Your bookings"
                    className="space-y-4 print:hidden"
                >
                    {visible.map((booking) => (
                        <article
                            key={booking.code}
                            className="rounded-2xl border border-agendain-border-card bg-white p-4 shadow-agendain-card"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <div className="relative shrink-0 overflow-hidden rounded-xl sm:w-36">
                                    <EventImage
                                        event={booking.event}
                                        className="aspect-[16/9] sm:aspect-square"
                                    />
                                    <span className="absolute top-2 left-2">
                                        <BookingStatus
                                            status={booking.status}
                                        />
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="mb-2 truncate font-mono text-[10px] text-agendain-purple">
                                        {booking.code}
                                    </p>
                                    <Link
                                        href={show(booking.event.id)}
                                        className="text-sm font-semibold hover:text-agendain-purple"
                                    >
                                        {booking.event.title}
                                    </Link>
                                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                        <p className="flex items-center gap-1.5 text-[11px] text-agendain-text-muted">
                                            <CalendarDays
                                                size={12}
                                                className="text-agendain-purple"
                                            />
                                            {eventDate(booking.event.date)} ·{' '}
                                            {booking.event.time} WIB
                                        </p>
                                        <VenueLine
                                            event={booking.event}
                                            className="text-[11px]"
                                        />
                                        <p className="flex items-center gap-1.5 text-[11px] text-agendain-text-muted">
                                            <Users size={12} />
                                            {booking.ticket_quantity}{' '}
                                            {booking.ticket_quantity === 1
                                                ? 'ticket'
                                                : 'tickets'}{' '}
                                            · Event pass
                                        </p>
                                        <p className="text-[11px] font-medium">
                                            {money(booking.total_price)}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-agendain-surface-soft px-3 py-2.5">
                                        {booking.status === 'confirmed' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedCode(
                                                        booking.code,
                                                    );
                                                    document
                                                        .getElementById(
                                                            'quick-pass',
                                                        )
                                                        ?.scrollIntoView({
                                                            behavior: 'smooth',
                                                            block: 'nearest',
                                                        });
                                                }}
                                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-agendain-purple"
                                            >
                                                <Ticket size={13} /> View pass
                                            </button>
                                        )}
                                        <Link
                                            href={show(booking.event.id)}
                                            className="inline-flex items-center gap-1.5 text-[11px] text-agendain-text-muted"
                                        >
                                            {booking.status === 'cancelled'
                                                ? 'Book again'
                                                : 'View event'}
                                            <ArrowRight size={12} />
                                        </Link>
                                        {['confirmed', 'pending'].includes(
                                            booking.status,
                                        ) && (
                                            <button
                                                onClick={() =>
                                                    setCancelling(booking)
                                                }
                                                className="ml-auto text-[11px] text-agendain-text-muted hover:text-red-600"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        {booking.status === 'pending' && (
                                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700">
                                                <Clock3 size={11} /> Sample
                                                pending reservation
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                    {visible.length === 0 && (
                        <div className="rounded-2xl border border-agendain-border-card bg-white p-12 text-center">
                            <Ticket
                                size={28}
                                className="mx-auto mb-4 text-agendain-purple"
                            />
                            <h2 className="font-semibold">
                                No bookings here yet
                            </h2>
                            <p className="mt-2 text-xs text-agendain-text-muted">
                                Try another filter, or find your next
                                experience.
                            </p>
                            <Button asChild className={`mt-5 ${primaryButton}`}>
                                <Link href={index()}>Explore events</Link>
                            </Button>
                        </div>
                    )}
                </section>
                <aside
                    id="quick-pass"
                    className="rounded-2xl border border-agendain-border-card bg-white p-5 shadow-agendain-card lg:sticky lg:top-28 print:border-0 print:shadow-none"
                >
                    <div className="mb-5 flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-agendain-badge text-agendain-purple">
                            <Ticket size={17} />
                        </span>
                        <h2 className="text-sm font-semibold">
                            Your event pass
                        </h2>
                    </div>
                    {selected ? (
                        <>
                            <div className="overflow-hidden rounded-2xl border border-agendain-purple/15 bg-agendain-surface-soft">
                                <div className="border-b border-dashed border-agendain-purple/20 p-5">
                                    <p className="mb-2 text-[10px] font-semibold tracking-widest text-agendain-purple uppercase">
                                        Agendain · Demo pass
                                    </p>
                                    <h3 className="text-base leading-snug font-semibold">
                                        {selected.event.title}
                                    </h3>
                                    <p className="mt-2 text-xs text-agendain-text-muted">
                                        {eventDate(selected.event.date)} ·{' '}
                                        {selected.event.time} WIB
                                    </p>
                                </div>
                                <div className="space-y-4 p-5">
                                    <div>
                                        <p className="text-[10px] text-agendain-text-muted">
                                            Reserved for
                                        </p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {selected.name}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-[10px] text-agendain-text-muted">
                                                Passes
                                            </p>
                                            <p className="mt-1 text-xs font-medium">
                                                {selected.ticket_quantity} ×
                                                Event pass
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-agendain-text-muted">
                                                Venue
                                            </p>
                                            <p className="mt-1 text-xs font-medium">
                                                {selected.event.venue}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-agendain-purple/10 bg-white p-3">
                                        <p className="mb-1 text-[9px] text-agendain-text-muted uppercase">
                                            Booking reference
                                        </p>
                                        <p className="font-mono text-xs font-semibold break-all text-agendain-purple">
                                            {selected.code}
                                        </p>
                                    </div>
                                    <BookingStatus status={selected.status} />
                                </div>
                            </div>
                            <Button
                                className={`mt-4 w-full print:hidden ${primaryButton}`}
                                onClick={() => window.print()}
                            >
                                <Printer size={14} /> Print / save pass
                            </Button>
                            <p className="mt-3 text-center text-[10px] leading-relaxed text-agendain-text-muted">
                                This is a preview pass and is not valid for
                                venue entry.
                            </p>
                        </>
                    ) : (
                        <div className="rounded-xl bg-agendain-surface-soft p-6 text-center">
                            <Ticket
                                size={26}
                                className="mx-auto mb-3 text-agendain-purple"
                            />
                            <p className="text-xs leading-relaxed text-agendain-text-muted">
                                Reserve an event to see your pass here.
                            </p>
                        </div>
                    )}
                    <p className="mt-5 border-t border-agendain-border-header pt-4 text-[10px] leading-relaxed text-agendain-text-muted print:hidden">
                        Preview bookings are saved for your current session. No
                        payment is collected.
                    </p>
                </aside>
            </div>
            {cancelling && (
                <CancelBooking
                    booking={cancelling}
                    onClose={() => setCancelling(null)}
                />
            )}
        </>
    );
}
