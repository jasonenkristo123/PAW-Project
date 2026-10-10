import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Search,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import {
    EventImage,
    VenueLine,
    eventDate,
    money,
    primaryButton,
} from '@/components/event-ui';
import { Button } from '@/components/ui/button';
import { show } from '@/routes/events';

const categories = [
    'All',
    'Workshop',
    'Music',
    'Technology',
    'Competition',
    'Seminar',
];

export default function Events({ events }) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [page, setPage] = useState(1);
    const filtered = events.filter(
        (event) =>
            (category === 'All' || event.category === category) &&
            `${event.title} ${event.venue} ${event.category}`
                .toLowerCase()
                .includes(search.toLowerCase()),
    );
    const pageCount = Math.max(1, Math.ceil(filtered.length / 6));
    const visible = filtered.slice((page - 1) * 6, page * 6);

    return (
        <>
            <Head title="Explore Events" />
            <section className="mb-8 flex flex-wrap items-end justify-between gap-5">
                <div>
                    <p className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] text-agendain-purple uppercase">
                        <Sparkles size={13} /> Discover & reserve
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        Make room for a little{' '}
                        <span className="text-agendain-purple">more.</span>
                    </h1>
                    <p className="mt-3 max-w-lg text-sm leading-relaxed text-agendain-text-muted">
                        A new skill, a great conversation, a night to remember.
                        <br className="hidden sm:block" /> Find something worth
                        putting on your calendar.
                    </p>
                </div>
                <span className="rounded-full border border-agendain-border-card bg-white px-3 py-2 text-[11px] text-agendain-text-muted">
                    <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-agendain-purple" />{' '}
                    Preview collection
                </span>
            </section>
            <section
                aria-label="Find events"
                className="mb-7 flex flex-col gap-4 rounded-2xl border border-agendain-border-card bg-white p-3 lg:flex-row lg:items-center lg:justify-between"
            >
                <div className="relative lg:w-96">
                    <Search
                        size={16}
                        className="absolute top-3.5 left-3.5 text-agendain-text-muted"
                    />
                    <input
                        aria-label="Search events"
                        placeholder="Search by event, topic, or venue…"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                        className="h-11 w-full rounded-xl bg-agendain-surface-soft pr-3 pl-10 text-xs outline-none focus:ring-2 focus:ring-agendain-purple/25"
                    />
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {categories.map((item) => (
                        <button
                            key={item}
                            aria-pressed={category === item}
                            onClick={() => {
                                setCategory(item);
                                setPage(1);
                            }}
                            className={`rounded-full px-3.5 py-2 text-xs transition-colors ${category === item ? 'bg-agendain-purple text-white' : 'bg-agendain-badge text-agendain-text-muted hover:text-agendain-purple'}`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </section>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Available events</h2>
                <span className="text-xs text-agendain-text-muted">
                    {filtered.length} experiences to explore
                </span>
            </div>
            <section
                aria-label="Available events"
                className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
                {visible.map((event) => (
                    <article
                        key={event.id}
                        className="group overflow-hidden rounded-2xl border border-agendain-border-card bg-white shadow-agendain-card transition-transform hover:-translate-y-1 motion-reduce:transform-none"
                    >
                        <Link
                            href={show(event.id)}
                            className="relative block overflow-hidden"
                            aria-label={`View ${event.title}`}
                        >
                            <EventImage
                                event={event}
                                className="aspect-[16/9] transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                            />
                            <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-agendain-purple">
                                {event.category}
                            </span>
                            {event.price === 0 && (
                                <span className="absolute top-3 right-3 rounded-full bg-emerald-700 px-2.5 py-1 text-[10px] font-medium text-white">
                                    Free entry
                                </span>
                            )}
                        </Link>
                        <div className="p-5">
                            <p className="mb-2.5 flex items-center gap-1.5 text-[11px] text-agendain-text-muted">
                                <CalendarDays
                                    size={13}
                                    className="text-agendain-purple"
                                />
                                {eventDate(event.date)} · {event.time} WIB
                            </p>
                            <Link
                                href={show(event.id)}
                                className="text-base font-semibold tracking-tight hover:text-agendain-purple"
                            >
                                {event.title}
                            </Link>
                            <VenueLine event={event} className="mt-2" />
                            <p className="mt-3 text-xs text-agendain-text-muted">
                                {event.tagline}
                            </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-agendain-border-header bg-agendain-surface-soft/60 px-5 py-4">
                            <div>
                                <p className="mb-0.5 text-[10px] text-agendain-text-muted">
                                    {event.remaining === 0
                                        ? 'Registration closed'
                                        : 'Per person'}
                                </p>
                                <p
                                    className={`text-sm font-semibold ${event.price === 0 ? 'text-emerald-700' : 'text-agendain-purple'}`}
                                >
                                    {money(event.price)}
                                </p>
                            </div>
                            <Button asChild size="sm" className={primaryButton}>
                                <Link href={show(event.id)}>
                                    View details <ArrowRight size={13} />
                                </Link>
                            </Button>
                        </div>
                    </article>
                ))}
            </section>
            {visible.length === 0 && (
                <div className="rounded-2xl border border-agendain-border-card bg-white p-16 text-center">
                    <Search
                        size={28}
                        className="mx-auto mb-4 text-agendain-purple"
                    />
                    <h2 className="font-semibold">No events found</h2>
                    <p className="mt-2 text-sm text-agendain-text-muted">
                        Try another topic or choose a different category.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-5"
                        onClick={() => {
                            setSearch('');
                            setCategory('All');
                            setPage(1);
                        }}
                    >
                        Clear filters
                    </Button>
                </div>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-agendain-border-card bg-white px-5 py-4">
                <p className="text-xs text-agendain-text-muted">
                    Showing {filtered.length ? (page - 1) * 6 + 1 : 0}–
                    {Math.min(page * 6, filtered.length)} of {filtered.length}{' '}
                    events
                </p>
                <nav aria-label="Event pagination" className="flex gap-1.5">
                    <button
                        disabled={page === 1}
                        aria-label="Previous page"
                        onClick={() => setPage(page - 1)}
                        className="rounded-lg p-2 text-agendain-purple disabled:opacity-30"
                    >
                        <ChevronLeft size={15} />
                    </button>
                    {Array.from(
                        { length: pageCount },
                        (_, offset) => offset + 1,
                    ).map((value) => (
                        <button
                            key={value}
                            aria-current={page === value ? 'page' : undefined}
                            onClick={() => setPage(value)}
                            className={`h-8 w-8 rounded-lg text-xs ${value === page ? 'bg-agendain-purple text-white' : 'bg-agendain-badge text-agendain-purple'}`}
                        >
                            {value}
                        </button>
                    ))}
                    <button
                        disabled={page === pageCount}
                        aria-label="Next page"
                        onClick={() => setPage(page + 1)}
                        className="rounded-lg p-2 text-agendain-purple disabled:opacity-30"
                    >
                        <ChevronRight size={15} />
                    </button>
                </nav>
            </div>
        </>
    );
}
