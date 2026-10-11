import { Link } from '@inertiajs/react';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { EventImage, VenueLine, eventDate, money } from '@/components/event-ui';
import { index, show } from '@/routes/events';

export default function UpcomingEvents({ events }) {
    return (
        <section
            className="mx-auto max-w-[1160px] px-5 py-16 sm:px-8"
            aria-labelledby="upcoming-heading"
        >
            <div className="mb-6 flex items-center justify-between gap-4">
                <h2
                    id="upcoming-heading"
                    className="text-2xl font-semibold tracking-tight"
                >
                    Coming up on Agendain
                </h2>
                <Link
                    href={index()}
                    className="inline-flex items-center gap-2 text-sm font-medium text-agendain-purple"
                >
                    Explore events <ArrowUpRight size={16} />
                </Link>
            </div>
            {events.length === 0 ? (
                <p className="rounded-2xl border border-agendain-border-card p-8 text-sm text-agendain-text-muted">
                    New events are on their way. Check back soon.
                </p>
            ) : (
                <div className="grid gap-6 md:grid-cols-3">
                    {events.map((event) => (
                        <Link
                            key={event.id}
                            href={show(event.id)}
                            className="overflow-hidden rounded-2xl border border-agendain-border-card bg-white transition-transform hover:-translate-y-1 motion-reduce:transform-none"
                        >
                            <EventImage
                                event={event}
                                className="aspect-[16/9]"
                            />
                            <div className="space-y-3 p-5">
                                <p className="text-xs font-medium text-agendain-purple">
                                    {event.category}
                                </p>
                                <h3 className="text-lg font-semibold">
                                    {event.title}
                                </h3>
                                <p className="flex items-center gap-2 text-xs text-agendain-text-muted">
                                    <CalendarDays size={14} />
                                    {eventDate(event.date)} · {event.time} WIB
                                </p>
                                <VenueLine event={event} />
                                <p className="text-sm font-semibold text-agendain-purple">
                                    {money(event.price)}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
