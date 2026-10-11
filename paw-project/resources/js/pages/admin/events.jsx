import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    Eye,
    MapPin,
    Pencil,
    Plus,
    ReceiptText,
    Search,
    Shapes,
    Ticket,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EventDetailsModal } from '@/components/admin/events/EventDetailsModal';
import { EventFormModal } from '@/components/admin/events/EventFormModal';
import { DeleteEventModal } from '@/components/admin/events/DeleteEventModal';
import AdminLayout from '@/layouts/admin-layout';
import { index as bookingsIndex } from '@/routes/admin/bookings';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { index as venuesIndex } from '@/routes/admin/venues';
import { index as eventsIndex } from '@/routes/admin/events';

const number = new Intl.NumberFormat('en-US');

function formatPrice(val) {
    const num = Number(val);
    if (!num || num === 0) return <span className="font-semibold text-emerald-600">Free</span>;
    return <span className="font-semibold text-agendain-purple">{'Rp' + num.toLocaleString('id-ID')}</span>;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getCategoryColor(name) {
    const map = {
        Workshop: 'bg-purple-100 text-purple-700 border-purple-200',
        Music: 'bg-violet-100 text-violet-700 border-violet-200',
        Technology: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        Competition: 'bg-amber-100 text-amber-700 border-amber-200',
        Seminar: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return map[name] || 'bg-slate-100 text-slate-700 border-slate-200';
}

function getEventThumbnail(title) {
    if (title.toLowerCase().includes('design')) {
        return 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=120&q=80';
    }
    if (title.toLowerCase().includes('music') || title.toLowerCase().includes('indie')) {
        return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=120&q=80';
    }
    if (title.toLowerCase().includes('ai') || title.toLowerCase().includes('tech')) {
        return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=120&q=80';
    }
    return 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=120&q=80';
}

export default function EventsAdmin({
    events,
    categories,
    venues,
    filters,
    stats,
    dialog,
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [modalState, setModalState] = useState(dialog || null);

    function handleFilter(changes = {}) {
        router.get(
            eventsIndex.url(),
            {
                search,
                category_id: selectedCategory,
                status: selectedStatus,
                ...changes,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <AdminLayout>
            <Head title="Event Management — Agendain Admin" />

            {/* Top Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold tracking-wider text-agendain-purple">
                        CAPSTONE STUDENT PROJECT
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-slate-700">AGENDAIN CORE</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Database Synchronized (MySQL)
                </div>
            </div>

            {/* Header Title */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Admin Management Dashboard
                </h1>
                <p className="mt-1 text-xs text-agendain-text-muted">
                    Manage events, categories, venues, and user bookings in one unified interface.
                </p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <div className="rounded-2xl border border-agendain-border-card bg-white p-5 shadow-xs">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wider text-agendain-text-muted uppercase">
                            TOTAL EVENTS
                        </span>
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-50 text-agendain-purple">
                            <CalendarDays size={16} />
                        </span>
                    </div>
                    <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {number.format(stats.events)}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        ↗ +3 this month
                    </p>
                </div>

                <div className="rounded-2xl border border-agendain-border-card bg-white p-5 shadow-xs">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wider text-agendain-text-muted uppercase">
                            CATEGORIES
                        </span>
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-50 text-agendain-purple">
                            <Shapes size={16} />
                        </span>
                    </div>
                    <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {number.format(stats.categories)}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        ● All active and indexed
                    </p>
                </div>

                <div className="rounded-2xl border border-agendain-border-card bg-white p-5 shadow-xs">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wider text-agendain-text-muted uppercase">
                            VENUES REGISTERED
                        </span>
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-50 text-agendain-purple">
                            <MapPin size={16} />
                        </span>
                    </div>
                    <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {number.format(stats.venues)}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        📍 Jakarta & Online Links
                    </p>
                </div>

                <div className="rounded-2xl border border-agendain-border-card bg-white p-5 shadow-xs">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wider text-agendain-text-muted uppercase">
                            TOTAL BOOKINGS
                        </span>
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-50 text-agendain-purple">
                            <ReceiptText size={16} />
                        </span>
                    </div>
                    <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {number.format(stats.bookings)}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        ↗ +18% growth this week
                    </p>
                </div>
            </div>

            {/* Pill Navigation Bar */}
            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#F0EBF8] p-2 text-xs">
                <Link
                    href={eventsIndex.url()}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 font-bold text-agendain-purple shadow-xs"
                >
                    <CalendarDays size={14} />
                    Events CRUD
                    <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-agendain-purple">
                        {stats.events}
                    </span>
                </Link>
                <Link
                    href={categoriesIndex.url()}
                    className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-medium text-slate-600 transition hover:bg-white/60 hover:text-agendain-purple"
                >
                    <Shapes size={14} />
                    Categories CRUD
                    <span className="rounded-full bg-slate-200/70 px-1.5 py-0.5 text-[10px]">
                        {stats.categories}
                    </span>
                </Link>
                <Link
                    href={venuesIndex.url()}
                    className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-medium text-slate-600 transition hover:bg-white/60 hover:text-agendain-purple"
                >
                    <MapPin size={14} />
                    Venues CRUD
                    <span className="rounded-full bg-slate-200/70 px-1.5 py-0.5 text-[10px]">
                        {stats.venues}
                    </span>
                </Link>
                <Link
                    href={bookingsIndex.url()}
                    className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-medium text-slate-600 transition hover:bg-white/60 hover:text-agendain-purple"
                >
                    <ReceiptText size={14} />
                    Bookings CRUD
                    <span className="rounded-full bg-slate-200/70 px-1.5 py-0.5 text-[10px]">
                        {stats.bookings}
                    </span>
                </Link>
            </div>

            {/* Event Management Main Card */}
            <div className="rounded-2xl border border-agendain-border-card bg-white p-5 sm:p-6 shadow-xs">
                {/* Section Header */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Event Management
                        </h2>
                        <p className="mt-0.5 text-xs text-agendain-text-muted">
                            Create, inspect, update schedules, and track ticket allotments.
                        </p>
                    </div>
                    <Button
                        onClick={() => setModalState({ mode: 'create', event: null })}
                        className="inline-flex items-center gap-2 rounded-xl bg-agendain-purple px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-agendain-purple-hover"
                    >
                        <Plus size={16} />
                        Add Event
                    </Button>
                </div>

                {/* Filter and Search Bar */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleFilter();
                        }}
                        className="flex flex-1 flex-wrap items-center gap-2 sm:max-w-md"
                    >
                        <div className="relative flex-1 min-w-[200px]">
                            <Search size={15} className="absolute top-2.5 left-3 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search entries..."
                                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 pr-3 pl-9 text-xs outline-none focus:border-agendain-purple focus:bg-white focus:ring-2 focus:ring-agendain-purple/20"
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="h-9 text-xs font-semibold text-agendain-purple"
                        >
                            Filter
                        </Button>
                    </form>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                handleFilter({ category_id: e.target.value });
                            }}
                            className="h-9 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs outline-none focus:ring-2 focus:ring-agendain-purple/20"
                        >
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                handleFilter({ status: e.target.value });
                            }}
                            className="h-9 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs outline-none focus:ring-2 focus:ring-agendain-purple/20"
                        >
                            <option value="">All Statuses</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full border-collapse text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 bg-[#FAF9FD] text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                                <th className="py-3 px-4">EVENT DETAILS</th>
                                <th className="py-3 px-4">CATEGORY</th>
                                <th className="py-3 px-4">SCHEDULE</th>
                                <th className="py-3 px-4">VENUE</th>
                                <th className="py-3 px-4">TICKET PRICE</th>
                                <th className="py-3 px-4">QUOTA / SOLD</th>
                                <th className="py-3 px-4">STATUS</th>
                                <th className="py-3 px-4 text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {events.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-10 text-center text-slate-400">
                                        No events found. Click "+ Add Event" to create one.
                                    </td>
                                </tr>
                            ) : (
                                events.data.map((item) => {
                                    const sold = Number(item.sold_tickets ?? 0);
                                    const quota = Number(item.quota ?? 1);
                                    const percent = Math.min(100, Math.round((sold / quota) * 100));

                                    return (
                                        <tr key={item.id} className="transition hover:bg-slate-50/60">
                                            {/* EVENT DETAILS */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={getEventThumbnail(item.title)}
                                                        alt={item.title}
                                                        className="h-10 w-10 shrink-0 rounded-lg object-cover shadow-2xs"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 truncate">
                                                            {item.title}
                                                        </p>
                                                        <p className="text-[11px] font-medium text-slate-400">
                                                            ID: #{'EVT-' + (item.id + 1080)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* CATEGORY */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getCategoryColor(
                                                        item.category?.name,
                                                    )}`}
                                                >
                                                    {item.category?.name ?? 'General'}
                                                </span>
                                            </td>

                                            {/* SCHEDULE */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <p className="font-medium text-slate-800">
                                                    {formatDate(item.date)}
                                                </p>
                                                <p className="text-[11px] text-slate-400">
                                                    {item.time ? item.time.slice(0, 5) : '09:00'} WIB
                                                </p>
                                            </td>

                                            {/* VENUE */}
                                            <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                                                {item.venue?.name ?? '-'}
                                            </td>

                                            {/* TICKET PRICE */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {formatPrice(item.price)}
                                            </td>

                                            {/* QUOTA / SOLD */}
                                            <td className="py-3.5 px-4 min-w-[140px]">
                                                <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                                                    <span className="text-slate-700">
                                                        {sold} / {quota}
                                                    </span>
                                                    <span className="text-slate-400">{percent}%</span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-agendain-purple"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </td>

                                            {/* STATUS */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                    Active
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="py-3.5 px-4 whitespace-nowrap text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setModalState({ mode: 'show', event: item })}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-agendain-purple"
                                                        title="Inspect Event"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setModalState({ mode: 'edit', event: item })}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-agendain-purple"
                                                        title="Edit Event"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setModalState({ mode: 'delete', event: item })}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                                        title="Delete Event"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <p>
                        Showing {events.from ?? 0} – {events.to ?? 0} of {events.total ?? 0} events
                    </p>
                    <div className="flex items-center gap-1">
                        {events.prev_page_url ? (
                            <Link
                                href={events.prev_page_url}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium hover:bg-slate-50"
                            >
                                Previous
                            </Link>
                        ) : (
                            <span className="rounded-lg border border-slate-100 px-3 py-1.5 text-slate-300">
                                Previous
                            </span>
                        )}

                        {events.links
                            .filter((l) => !l.label.includes('Previous') && !l.label.includes('Next'))
                            .map((page, idx) => (
                                <Link
                                    key={idx}
                                    href={page.url ?? '#'}
                                    className={`rounded-lg px-3 py-1.5 font-semibold ${
                                        page.active
                                            ? 'bg-agendain-purple text-white shadow-xs'
                                            : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    {page.label}
                                </Link>
                            ))}

                        {events.next_page_url ? (
                            <Link
                                href={events.next_page_url}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium hover:bg-slate-50"
                            >
                                Next
                            </Link>
                        ) : (
                            <span className="rounded-lg border border-slate-100 px-3 py-1.5 text-slate-300">
                                Next
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {modalState?.mode === 'create' && (
                <EventFormModal
                    mode="create"
                    event={null}
                    categories={categories}
                    venues={venues}
                    onClose={() => setModalState(null)}
                />
            )}
            {modalState?.mode === 'edit' && (
                <EventFormModal
                    mode="edit"
                    event={modalState.event}
                    categories={categories}
                    venues={venues}
                    onClose={() => setModalState(null)}
                />
            )}
            {modalState?.mode === 'show' && (
                <EventDetailsModal
                    event={modalState.event}
                    onClose={() => setModalState(null)}
                />
            )}
            {modalState?.mode === 'delete' && (
                <DeleteEventModal
                    event={modalState.event}
                    onClose={() => setModalState(null)}
                />
            )}
        </AdminLayout>
    );
}

