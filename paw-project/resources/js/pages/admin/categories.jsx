import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpRight,
    CalendarDays,
    Check,
    Eye,
    MapPin,
    Pencil,
    Plus,
    ReceiptText,
    Search,
    Shapes,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CategoryDetailsModal } from '@/components/admin/categories/CategoryDetailsModal';
import { CategoryFormModal } from '@/components/admin/categories/CategoryFormModal';
import { DeleteCategoryModal } from '@/components/admin/categories/DeleteCategoryModal';
import { StatusBadge } from '@/components/admin/categories/StatusBadge';
import { index as bookingsIndex } from '@/routes/admin/bookings';
import { create, edit, index, show } from '@/routes/admin/categories';
import { index as venuesIndex } from '@/routes/admin/venues';
import { index as eventsIndex } from '@/routes/admin/events';
import { getCategoryIcon, number } from '@/utils/categories';

function buildPageRange(current, last) {
    const start = Math.max(1, Math.min(current - 2, last - 4));
    return Array.from({ length: Math.min(5, last) }, (_, i) => start + i);
}

function StatusBar() {
    return (
        <section
            aria-label="System synchronization status"
            className="flex flex-wrap items-center justify-between gap-3 text-xs"
        >
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider text-agendain-purple">
                    CAPSTONE STUDENT PROJECT
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-slate-600">
                    Agendain Core
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    Database Synchronized (MySQL)
                </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>Session: prod-node-04</span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-agendain-purple">
                    Live Mode
                </span>
            </div>
        </section>
    );
}

function MetricCards({ stats }) {
    return (
        <section
            aria-label="Platform metric cards"
            className="grid grid-cols-2 gap-4 xl:grid-cols-4"
        >
            <div className="rounded-2xl border border-agendain-border-card bg-white p-5 shadow-xs transition hover:shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-agendain-text-muted">
                        Total Events
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-purple-50 text-agendain-purple">
                        <CalendarDays size={16} />
                    </span>
                </div>
                <div className="flex items-baseline gap-3">
                    <p className="text-3xl font-bold tracking-tight text-slate-900">
                        {number.format(stats.events)}
                    </p>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <ArrowUpRight size={12} /> +3 this month
                    </span>
                </div>
            </div>

            <div className="rounded-2xl border border-agendain-purple/30 bg-linear-to-br from-purple-50/60 via-white to-purple-50/30 p-5 shadow-xs ring-1 ring-agendain-purple/15 transition hover:shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-agendain-purple">
                        Categories
                        <span className="h-1.5 w-1.5 rounded-full bg-agendain-purple" />
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-agendain-purple text-white shadow-xs">
                        <Shapes size={16} />
                    </span>
                </div>
                <div className="flex items-baseline gap-3">
                    <p className="text-3xl font-bold tracking-tight text-agendain-purple">
                        {number.format(stats.categories)}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100/70 px-2.5 py-0.5 text-[10px] font-semibold text-agendain-purple">
                        <Check size={12} className="stroke-[3]" /> All active
                        &amp; indexed
                    </span>
                </div>
            </div>

            <div className="rounded-2xl border border-agendain-border-card bg-white p-5 shadow-xs transition hover:shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-agendain-text-muted">
                        Venues Registered
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-purple-50 text-agendain-purple">
                        <MapPin size={16} />
                    </span>
                </div>
                <div className="flex items-baseline gap-3">
                    <p className="text-3xl font-bold tracking-tight text-slate-900">
                        {number.format(stats.venues)}
                    </p>
                    <span className="text-[11px] font-medium text-slate-500">
                        Jakarta &amp; Online Links
                    </span>
                </div>
            </div>

            <div className="rounded-2xl border border-agendain-border-card bg-white p-5 shadow-xs transition hover:shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-agendain-text-muted">
                        Total Bookings
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-purple-50 text-agendain-purple">
                        <ReceiptText size={16} />
                    </span>
                </div>
                <div className="flex items-baseline gap-3">
                    <p className="text-3xl font-bold tracking-tight text-slate-900">
                        {number.format(stats.bookings)}
                    </p>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <ArrowUpRight size={12} /> +16% this week
                    </span>
                </div>
            </div>
        </section>
    );
}

function CrudSwitcher({ stats }) {
    return (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-agendain-border-card bg-white p-2 text-xs">
            <Link
                href={eventsIndex()}
                className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
                <CalendarDays size={14} className="text-slate-400" />
                Events CRUD
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                    {number.format(stats.events)}
                </span>
            </Link>

            <div className="inline-flex items-center gap-2 rounded-xl bg-agendain-purple px-4 py-2 font-semibold text-white shadow-xs">
                <Shapes size={14} />
                Categories CRUD
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
                    {number.format(stats.categories)}
                </span>
            </div>

            <Link
                href={venuesIndex()}
                className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
                <MapPin size={14} className="text-slate-400" />
                Venues CRUD
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                    {number.format(stats.venues)}
                </span>
            </Link>

            <Link
                href={bookingsIndex()}
                className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
                <ReceiptText size={14} className="text-slate-400" />
                Bookings CRUD
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                    {number.format(stats.bookings)}
                </span>
            </Link>
        </div>
    );
}

function CategoryTableRow({ cat, filters, onDeleteClick }) {
    const Icon = getCategoryIcon(cat.name);
    return (
        <tr className="group transition-colors hover:bg-slate-50/60">
            <td className="py-4 pl-2">
                <div className="flex items-center gap-3.5">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-purple-100/80 bg-purple-50 text-agendain-purple">
                        <Icon size={18} />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 transition-colors group-hover:text-agendain-purple">
                            {cat.name}
                        </p>
                        <p className="font-mono text-[11px] text-slate-400">
                            slug: /{cat.slug}
                        </p>
                    </div>
                </div>
            </td>

            <td className="max-w-sm px-4 py-4 text-xs text-slate-600 sm:text-sm">
                <p className="line-clamp-2 leading-relaxed">
                    {cat.description || '—'}
                </p>
            </td>

            <td className="px-4 py-4">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-100/70 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-agendain-purple">
                    <CalendarDays size={13} />
                    {cat.events_count ?? 0} Events
                </span>
            </td>

            <td className="px-4 py-4">
                <StatusBadge status={cat.status} />
            </td>

            <td className="py-4 pr-2 text-right">
                <div className="inline-flex items-center gap-1">
                    <Link
                        href={show(cat.id, { query: filters })}
                        preserveScroll
                        aria-label={`View ${cat.name}`}
                        className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-purple-50 hover:text-agendain-purple"
                    >
                        <Eye size={16} />
                    </Link>
                    <Link
                        href={edit(cat.id, { query: filters })}
                        preserveScroll
                        aria-label={`Edit ${cat.name}`}
                        className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-purple-50 hover:text-agendain-purple"
                    >
                        <Pencil size={16} />
                    </Link>
                    <button
                        type="button"
                        onClick={() => onDeleteClick(cat)}
                        aria-label={`Delete ${cat.name}`}
                        className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

function EmptyState({ hasFilters, onReset }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-purple-50 text-agendain-purple">
                <Shapes size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
                No categories found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
                {hasFilters
                    ? 'No categories match the active filter criteria. Try clearing search or status filters.'
                    : 'Start organizing your discovery catalog by adding your first event category.'}
            </p>
            {hasFilters && (
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={onReset}
                >
                    Reset filters
                </Button>
            )}
        </div>
    );
}

function Pagination({ categories, filters, pages }) {
    return (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-800">
                    {categories.from ?? 0} - {categories.to ?? 0}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-slate-800">
                    {number.format(categories.total)}
                </span>{' '}
                categories
            </p>

            <nav className="flex items-center gap-1.5" aria-label="Pagination">
                {categories.prev_page_url ? (
                    <Link
                        href={categories.prev_page_url}
                        preserveScroll
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                        Previous
                    </Link>
                ) : (
                    <span className="cursor-not-allowed px-3 py-1.5 text-xs text-slate-300">
                        Previous
                    </span>
                )}

                {pages.map((p) => (
                    <Link
                        key={p}
                        href={index({ query: { ...filters, page: p } })}
                        preserveScroll
                        aria-current={
                            p === categories.current_page ? 'page' : undefined
                        }
                        className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-semibold transition ${
                            p === categories.current_page
                                ? 'bg-agendain-purple text-white shadow-xs'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        {p}
                    </Link>
                ))}

                {categories.next_page_url ? (
                    <Link
                        href={categories.next_page_url}
                        preserveScroll
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                        Next
                    </Link>
                ) : (
                    <span className="cursor-not-allowed px-3 py-1.5 text-xs text-slate-300">
                        Next
                    </span>
                )}
            </nav>
        </div>
    );
}

export default function Categories({ categories, filters, stats, dialog }) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteCategory, setDeleteCategory] = useState(null);

    const activeFilter = filters.status || '';
    const pages = buildPageRange(categories.current_page, categories.last_page);

    function handleFilter(nextSearch, nextStatus) {
        setSearch(nextSearch);
        router.get(
            index.url(),
            { search: nextSearch, status: nextStatus },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function closeDialog() {
        router.get(
            index.url({ query: filters }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Agendain — Admin Categories CRUD" />

            <StatusBar />

            <MetricCards stats={stats} />

            <CrudSwitcher stats={stats} />

            <section className="rounded-2xl border border-agendain-border-card bg-white p-5 shadow-xs sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">
                            Category Management
                        </h2>
                        <p className="mt-1 text-xs text-agendain-text-muted">
                            Create and organize categories used to classify
                            events across the booking discovery engine.
                        </p>
                    </div>
                    <Button
                        asChild
                        className="cursor-pointer bg-agendain-purple text-white shadow-agendain-button transition hover:bg-agendain-purple-hover"
                    >
                        <Link href={create({ query: filters })} preserveScroll>
                            <Plus size={16} className="mr-1 stroke-[2.5]" />{' '}
                            Add Category
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
                    <div className="relative w-full max-w-sm">
                        <Search
                            size={16}
                            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) =>
                                handleFilter(e.target.value, activeFilter)
                            }
                            placeholder="Search categories..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-4 pl-10 text-xs text-slate-800 transition placeholder:text-slate-400 focus:border-agendain-purple focus:bg-white focus:ring-2 focus:ring-agendain-purple/15 focus:outline-none sm:text-sm"
                        />
                        {search && (
                            <button
                                onClick={() => handleFilter('', activeFilter)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                aria-label="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        {[
                            { value: '', label: `All (${categories.total})` },
                            {
                                value: 'active',
                                label: `Active (${stats.active ?? 0})`,
                            },
                            {
                                value: 'inactive',
                                label: `Inactive (${stats.inactive ?? 0})`,
                            },
                        ].map(({ value, label }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => handleFilter(search, value)}
                                className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                    activeFilter === value
                                        ? 'bg-agendain-purple text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                                <th scope="col" className="pb-3.5 pl-2">
                                    Category
                                </th>
                                <th scope="col" className="px-4 pb-3.5">
                                    Description
                                </th>
                                <th scope="col" className="px-4 pb-3.5">
                                    Total Events
                                </th>
                                <th scope="col" className="px-4 pb-3.5">
                                    Status
                                </th>
                                <th
                                    scope="col"
                                    className="pr-2 pb-3.5 text-right"
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {categories.data.map((cat) => (
                                <CategoryTableRow
                                    key={cat.id}
                                    cat={cat}
                                    filters={filters}
                                    onDeleteClick={setDeleteCategory}
                                />
                            ))}
                        </tbody>
                    </table>

                    {categories.data.length === 0 && (
                        <EmptyState
                            hasFilters={
                                Boolean(filters.search) ||
                                Boolean(filters.status)
                            }
                            onReset={() => handleFilter('', '')}
                        />
                    )}
                </div>

                <Pagination
                    categories={categories}
                    filters={filters}
                    pages={pages}
                />
            </section>

            {dialog?.mode === 'show' && (
                <CategoryDetailsModal
                    category={dialog.category}
                    filters={filters}
                    onClose={closeDialog}
                />
            )}
            {(dialog?.mode === 'create' || dialog?.mode === 'edit') && (
                <CategoryFormModal
                    mode={dialog.mode}
                    category={dialog.category}
                    onClose={closeDialog}
                />
            )}

            {deleteCategory && (
                <DeleteCategoryModal
                    category={deleteCategory}
                    filters={filters}
                    onClose={() => setDeleteCategory(null)}
                />
            )}
        </>
    );
}
