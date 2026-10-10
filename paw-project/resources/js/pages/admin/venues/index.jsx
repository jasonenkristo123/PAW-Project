import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Building2,
    CalendarDays,
    CheckCheck,
    ChevronLeft,
    ChevronRight,
    Eye,
    MapPin,
    Pencil,
    Plus,
    ReceiptText,
    Search,
    Shapes,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    create,
    destroy,
    edit,
    index,
    show,
    store,
    update,
} from '@/routes/admin/venues';

const primaryButton =
    'bg-agendain-purple text-white shadow-agendain-button hover:bg-agendain-purple-hover';
const metricDefinitions = [
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
        caption: 'Spaces for your next event',
        icon: MapPin,
    },
    {
        key: 'bookings',
        label: 'Total Bookings',
        caption: 'All booking records',
        icon: ReceiptText,
    },
];
const number = new Intl.NumberFormat('en-US');
const venueCode = (id) => `VN-${String(id).padStart(4, '0')}`;

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}
        >
            <span className="h-1 w-1 rounded-full bg-current" />
            {status === 'active' ? 'Available' : 'Unavailable'}
        </span>
    );
}

function VenueForm({ mode, venue, onClose }) {
    const form = useForm({
        name: venue?.name ?? '',
        address: venue?.address ?? '',
        capacity: venue?.capacity ?? '',
        status: venue?.status ?? 'active',
    });
    const editing = mode === 'edit';

    function submit(event) {
        event.preventDefault();
        const options = { preserveScroll: true };
        if (editing) form.put(update.url(venue.id), options);
        else form.post(store.url(), options);
    }

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !form.processing) onClose();
            }}
        >
            <DialogContent
                onEscapeKeyDown={(event) => {
                    if (form.processing) event.preventDefault();
                }}
                onInteractOutside={(event) => {
                    if (form.processing) event.preventDefault();
                }}
            >
                <DialogHeader>
                    <DialogTitle>
                        {editing ? 'Edit venue' : 'Add a venue'}
                    </DialogTitle>
                    <DialogDescription>
                        {editing
                            ? 'Update this location and its availability.'
                            : 'Create a space for your next Agendain event.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="venue-name">Venue name</Label>
                        <Input
                            id="venue-name"
                            autoFocus
                            required
                            maxLength={255}
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            placeholder="e.g. Creative Hall"
                            aria-invalid={!!form.errors.name}
                        />
                        <InputError message={form.errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="venue-address">Address</Label>
                        <textarea
                            id="venue-address"
                            required
                            maxLength={5000}
                            rows={3}
                            value={form.data.address}
                            onChange={(event) =>
                                form.setData('address', event.target.value)
                            }
                            placeholder="Street address or online meeting location"
                            aria-invalid={!!form.errors.address}
                            className="w-full resize-y rounded-md border border-agendain-border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-agendain-purple/30"
                        />
                        <InputError message={form.errors.address} />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="venue-capacity">
                                Capacity (people)
                            </Label>
                            <Input
                                id="venue-capacity"
                                type="number"
                                required
                                min={1}
                                max={4294967295}
                                step={1}
                                value={form.data.capacity}
                                onChange={(event) =>
                                    form.setData('capacity', event.target.value)
                                }
                                aria-invalid={!!form.errors.capacity}
                                placeholder="250"
                            />
                            <InputError message={form.errors.capacity} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="venue-status">Availability</Label>
                            <select
                                id="venue-status"
                                value={form.data.status}
                                onChange={(event) =>
                                    form.setData('status', event.target.value)
                                }
                                aria-invalid={!!form.errors.status}
                                className="h-9 w-full rounded-md border border-agendain-border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-agendain-purple/30"
                            >
                                <option value="active">Available</option>
                                <option value="inactive">Unavailable</option>
                            </select>
                            <InputError message={form.errors.status} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={form.processing}
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className={primaryButton}
                        >
                            {form.processing
                                ? 'Saving…'
                                : editing
                                  ? 'Save changes'
                                  : 'Create venue'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function VenueDetails({ venue, filters, onClose }) {
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{venue.name}</DialogTitle>
                    <DialogDescription>
                        {venueCode(venue.id)} · Venue details
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-5">
                    <StatusBadge status={venue.status} />
                    <p className="flex items-start gap-2 text-sm text-agendain-text-muted">
                        <MapPin size={17} className="mt-0.5 shrink-0" />
                        <span className="whitespace-pre-wrap">
                            {venue.address}
                        </span>
                    </p>
                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-agendain-surface-soft p-4">
                        <div>
                            <p className="text-xs text-agendain-text-muted">
                                Capacity
                            </p>
                            <p className="mt-1 flex items-center gap-2 font-semibold">
                                <Users size={16} />
                                {number.format(venue.capacity)} people
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-agendain-text-muted">
                                Events
                            </p>
                            <p className="mt-1 font-semibold">
                                {number.format(venue.events_count)}
                            </p>
                        </div>
                    </div>
                    <div>
                        <h3 className="mb-2 text-sm font-semibold">
                            Recent events
                        </h3>
                        {venue.events?.length ? (
                            <ul className="divide-y divide-agendain-border-header">
                                {venue.events.map((event) => (
                                    <li
                                        key={event.id}
                                        className="flex justify-between gap-4 py-2 text-sm"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {event.title}
                                            </p>
                                            <p className="mt-1 text-xs text-agendain-text-muted">
                                                {event.date} · {event.quota}{' '}
                                                tickets
                                            </p>
                                        </div>
                                        <span className="text-xs text-agendain-text-muted capitalize">
                                            {event.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-agendain-text-muted">
                                No events are assigned to this venue yet.
                            </p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button asChild className={primaryButton}>
                        <Link
                            href={edit(venue.id, { query: filters })}
                            preserveScroll
                        >
                            <Pencil size={14} /> Edit venue
                        </Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function VenueDialog({ dialog, filters, onClose }) {
    if (!dialog) return null;
    if (dialog.mode === 'show')
        return (
            <VenueDetails
                venue={dialog.venue}
                filters={filters}
                onClose={onClose}
            />
        );
    return (
        <VenueForm
            key={`${dialog.mode}-${dialog.venue?.id ?? 'new'}`}
            mode={dialog.mode}
            venue={dialog.venue}
            onClose={onClose}
        />
    );
}

function DeleteVenueDialog({ venue, filters, onClose }) {
    const deletion = useForm({});
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !deletion.processing) onClose();
            }}
        >
            <DialogContent
                onEscapeKeyDown={(event) => {
                    if (deletion.processing) event.preventDefault();
                }}
                onInteractOutside={(event) => {
                    if (deletion.processing) event.preventDefault();
                }}
            >
                <DialogHeader>
                    <DialogTitle>Delete venue?</DialogTitle>
                    <DialogDescription>
                        {venue.events_count
                            ? `${venue.name} has ${venue.events_count} assigned events. Mark it unavailable to preserve those events.`
                            : `Permanently remove ${venue.name}? This action cannot be undone.`}
                    </DialogDescription>
                </DialogHeader>
                <InputError message={deletion.errors.venue} />
                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={deletion.processing}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    {venue.events_count ? (
                        <Button asChild className={primaryButton}>
                            <Link
                                href={edit(venue.id, { query: filters })}
                                preserveScroll
                                onClick={onClose}
                            >
                                Edit availability
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            disabled={deletion.processing}
                            onClick={() =>
                                deletion.delete(destroy.url(venue.id), {
                                    preserveScroll: true,
                                    onSuccess: onClose,
                                })
                            }
                        >
                            {deletion.processing ? 'Deleting…' : 'Delete venue'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Venues({ venues, filters, stats, dialog }) {
    const [search, setSearch] = useState(filters.search);
    const [deleteVenue, setDeleteVenue] = useState(null);
    const options = { query: filters };
    const startPage = Math.max(
        1,
        Math.min(venues.current_page - 2, venues.last_page - 4),
    );
    const pages = Array.from(
        { length: Math.min(5, venues.last_page) },
        (_, offset) => startPage + offset,
    );

    function filter(nextSearch, status) {
        setSearch(nextSearch);
        router.get(
            index.url(),
            { search: nextSearch, status },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function closeDialog() {
        router.get(
            index.url(options),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Venue Management" />
            <section
                id="overview"
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-agendain-border-card bg-white px-6 py-5"
            >
                <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-wider text-agendain-purple">
                        AGENDAIN · PLATFORM MANAGEMENT
                    </p>
                    <h1 className="text-lg font-semibold tracking-tight">
                        Admin Management Dashboard
                    </h1>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-agendain-badge px-3 py-1.5 text-[11px] text-agendain-text-muted">
                    <CheckCheck size={14} className="text-emerald-700" /> Admin
                    access verified
                </span>
            </section>
            <section
                aria-label="Platform overview"
                className="grid grid-cols-2 gap-4 xl:grid-cols-4"
            >
                {metricDefinitions.map(
                    ({ key, label, caption, icon: Icon }) => (
                        <div
                            key={key}
                            className={`rounded-xl border p-5 ${key === 'venues' ? 'border-agendain-purple/25 bg-linear-to-br from-white to-agendain-badge ring-1 ring-agendain-purple/10' : 'border-agendain-border-card bg-white'}`}
                        >
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <span
                                    className={`text-xs ${key === 'venues' ? 'font-semibold text-agendain-purple' : 'text-agendain-text-muted'}`}
                                >
                                    {label}
                                </span>
                                <span
                                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${key === 'venues' ? 'bg-agendain-purple text-white' : 'bg-agendain-badge text-agendain-purple'}`}
                                >
                                    <Icon size={16} />
                                </span>
                            </div>
                            <p
                                className={`text-3xl font-semibold tracking-tight ${key === 'venues' ? 'text-agendain-purple' : ''}`}
                            >
                                {number.format(stats[key])}
                            </p>
                            <p className="mt-1.5 text-[10px] text-agendain-text-muted">
                                {caption}
                            </p>
                        </div>
                    ),
                )}
            </section>
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-agendain-badge p-2 text-xs">
                {metricDefinitions.map(({ key, label, icon: Icon }) => (
                    <span
                        key={key}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 ${key === 'venues' ? 'bg-white font-semibold text-agendain-purple shadow-xs' : 'text-agendain-text-muted'}`}
                    >
                        <Icon size={13} />
                        {label}
                        <span className="rounded-full bg-agendain-surface-soft px-1.5 text-[10px]">
                            {number.format(stats[key])}
                        </span>
                    </span>
                ))}
            </div>
            <section
                className="rounded-xl border border-agendain-border-card bg-white p-4 sm:p-6"
                aria-labelledby="venue-heading"
            >
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2
                            id="venue-heading"
                            className="text-lg font-semibold tracking-tight"
                        >
                            Venue Management
                        </h2>
                        <p className="mt-1 text-xs text-agendain-text-muted">
                            Manage locations and capacities used for Agendain
                            events.
                        </p>
                    </div>
                    <Button asChild className={primaryButton}>
                        <Link href={create(options)} preserveScroll>
                            <Plus size={16} /> Add Venue
                        </Link>
                    </Button>
                </div>
                <div className="mb-5 flex flex-col gap-3 rounded-xl bg-agendain-badge p-2.5 xl:flex-row xl:items-center xl:justify-between">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            filter(search, filters.status);
                        }}
                        role="search"
                        className="flex flex-1 items-center gap-2 xl:max-w-md"
                    >
                        <div className="relative flex-1">
                            <Search
                                size={15}
                                className="pointer-events-none absolute top-3 left-3 text-agendain-text-muted"
                            />
                            <input
                                aria-label="Search venues by name or address"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                maxLength={100}
                                placeholder="Search venues…"
                                className="h-10 w-full rounded-lg bg-white pr-9 pl-9 text-xs outline-none focus:ring-2 focus:ring-agendain-purple/25"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => filter('', filters.status)}
                                    aria-label="Clear search"
                                    className="absolute top-2.5 right-2 rounded p-0.5 text-agendain-text-muted hover:text-agendain-purple"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>
                        <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-agendain-purple"
                        >
                            Search
                        </Button>
                    </form>
                    <div
                        className="flex flex-wrap gap-1"
                        aria-label="Filter by availability"
                    >
                        {[
                            {
                                value: '',
                                label: 'All Venues',
                                count: stats.venues,
                            },
                            {
                                value: 'active',
                                label: 'Available',
                                count: stats.available,
                            },
                            {
                                value: 'inactive',
                                label: 'Unavailable',
                                count: stats.unavailable,
                            },
                        ].map((item) => (
                            <button
                                key={item.value}
                                onClick={() => filter(search, item.value)}
                                aria-pressed={filters.status === item.value}
                                className={`rounded-full px-3 py-2 text-[11px] transition-colors ${filters.status === item.value ? 'bg-white font-semibold text-agendain-purple shadow-xs' : 'text-agendain-text-muted hover:bg-white/60'}`}
                            >
                                {item.label} ({number.format(item.count)})
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left text-xs">
                        <caption className="sr-only">
                            Venues, their capacity, assigned event count, and
                            availability
                        </caption>
                        <thead className="bg-agendain-surface-soft text-[10px] tracking-wide text-agendain-text-muted uppercase">
                            <tr>
                                {[
                                    'Venue',
                                    'Address',
                                    'Capacity',
                                    'Events',
                                    'Status',
                                    'Actions',
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        scope="col"
                                        className={`px-3 py-3 font-semibold first:rounded-l-lg last:rounded-r-lg ${heading === 'Actions' ? 'text-right' : ''}`}
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-agendain-border-header">
                            {venues.data.map((venue) => (
                                <tr
                                    key={venue.id}
                                    className="hover:bg-agendain-surface-hover"
                                >
                                    <td className="px-3 py-5">
                                        <div className="flex items-start gap-3">
                                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-agendain-badge text-agendain-purple">
                                                <Building2 size={17} />
                                            </span>
                                            <div>
                                                <Link
                                                    href={show(
                                                        venue.id,
                                                        options,
                                                    )}
                                                    preserveScroll
                                                    className="block max-w-44 text-sm leading-snug font-semibold hover:text-agendain-purple"
                                                >
                                                    {venue.name}
                                                </Link>
                                                <span className="mt-1 block text-[10px] text-agendain-text-muted">
                                                    ID: {venueCode(venue.id)}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="max-w-64 px-3 py-5 leading-relaxed text-agendain-text-muted">
                                        <span className="line-clamp-2">
                                            {venue.address}
                                        </span>
                                    </td>
                                    <td className="px-3 py-5">
                                        <span className="block font-medium">
                                            {number.format(venue.capacity)}
                                        </span>
                                        <span className="text-agendain-text-muted">
                                            people
                                        </span>
                                    </td>
                                    <td className="px-3 py-5">
                                        <Link
                                            href={show(venue.id, options)}
                                            preserveScroll
                                            aria-label={`View ${venue.events_count} events at ${venue.name}`}
                                            className="inline-flex flex-col items-center rounded-xl bg-agendain-badge px-2.5 py-1.5 text-[10px] text-agendain-purple hover:bg-agendain-purple/15"
                                        >
                                            <span className="font-semibold">
                                                {venue.events_count}
                                            </span>
                                            Events
                                        </Link>
                                    </td>
                                    <td className="px-3 py-5">
                                        <StatusBadge status={venue.status} />
                                    </td>
                                    <td className="px-3 py-5">
                                        <div className="flex justify-end gap-1">
                                            <Link
                                                href={show(venue.id, options)}
                                                preserveScroll
                                                aria-label={`View ${venue.name}`}
                                                className="rounded-md p-2 text-agendain-text-muted hover:bg-agendain-badge hover:text-agendain-purple"
                                            >
                                                <Eye size={15} />
                                            </Link>
                                            <Link
                                                href={edit(venue.id, options)}
                                                preserveScroll
                                                aria-label={`Edit ${venue.name}`}
                                                className="rounded-md p-2 text-agendain-purple hover:bg-agendain-badge"
                                            >
                                                <Pencil size={15} />
                                            </Link>
                                            <button
                                                aria-label={`Delete ${venue.name}`}
                                                onClick={() => {
                                                    setDeleteVenue(venue);
                                                }}
                                                className="rounded-md p-2 text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {venues.data.length === 0 && (
                        <div className="flex flex-col items-center gap-3 py-16 text-center">
                            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-agendain-badge text-agendain-purple">
                                <MapPin size={25} />
                            </span>
                            <h3 className="text-sm font-semibold">
                                {filters.search || filters.status
                                    ? 'No venues match your filters'
                                    : 'Your next event starts with a great venue'}
                            </h3>
                            <p className="max-w-xs text-xs text-agendain-text-muted">
                                {filters.search || filters.status
                                    ? 'Try another name, address, or availability filter.'
                                    : 'Add your first location to start planning.'}
                            </p>
                            {(filters.search || filters.status) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => filter('', '')}
                                >
                                    Clear filters
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-agendain-border-header pt-4">
                    <p className="text-[11px] text-agendain-text-muted">
                        Showing {venues.from ?? 0}–{venues.to ?? 0} of{' '}
                        {number.format(venues.total)} venues
                    </p>
                    <nav
                        className="flex items-center gap-1"
                        aria-label="Venue pagination"
                    >
                        {venues.prev_page_url ? (
                            <Link
                                href={venues.prev_page_url}
                                preserveScroll
                                className="rounded-lg p-2 text-agendain-purple"
                                aria-label="Previous page"
                            >
                                <ChevronLeft size={15} />
                            </Link>
                        ) : (
                            <span
                                className="p-2 text-agendain-placeholder"
                                aria-disabled="true"
                            >
                                <ChevronLeft size={15} />
                            </span>
                        )}
                        {pages.map((page) => (
                            <Link
                                key={page}
                                href={index({ query: { ...filters, page } })}
                                preserveScroll
                                aria-current={
                                    page === venues.current_page
                                        ? 'page'
                                        : undefined
                                }
                                className={`grid h-8 w-8 place-items-center rounded-lg text-xs ${page === venues.current_page ? 'bg-agendain-purple text-white' : 'bg-agendain-badge text-agendain-purple hover:bg-agendain-purple/15'}`}
                            >
                                {page}
                            </Link>
                        ))}
                        {venues.next_page_url ? (
                            <Link
                                href={venues.next_page_url}
                                preserveScroll
                                className="rounded-lg p-2 text-agendain-purple"
                                aria-label="Next page"
                            >
                                <ChevronRight size={15} />
                            </Link>
                        ) : (
                            <span
                                className="p-2 text-agendain-placeholder"
                                aria-disabled="true"
                            >
                                <ChevronRight size={15} />
                            </span>
                        )}
                    </nav>
                </div>
            </section>
            <VenueDialog
                dialog={dialog}
                filters={filters}
                onClose={closeDialog}
            />
            {deleteVenue && (
                <DeleteVenueDialog
                    venue={deleteVenue}
                    filters={filters}
                    onClose={() => setDeleteVenue(null)}
                />
            )}
        </>
    );
}
