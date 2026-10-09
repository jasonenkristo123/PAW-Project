import { Link } from '@inertiajs/react';
import {
    ArrowDown,
    Bookmark,
    CalendarDays,
    Sparkles,
    Ticket,
} from 'lucide-react';
import { login } from '@/routes';

const highlights = [
    { icon: CalendarDays, label: 'Events worth discovering' },
    { icon: Bookmark, label: 'All your plans in one place' },
    { icon: Ticket, label: 'Simple seat reservations' },
];

export default function HeroSection({ actionHref, authenticated }) {
    return (
        <section
            aria-labelledby="hero-heading"
            className="px-5 pt-16 pb-16 sm:px-8 sm:pt-20 sm:pb-20 lg:px-12 lg:pt-28 lg:pb-24"
        >
            <div className="mx-auto flex max-w-[1120px] flex-col items-center text-center">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f0ff] px-3 py-1.5 text-xs font-medium text-[#6236e8]">
                    <Sparkles size={13} aria-hidden="true" />
                    Simple Event Booking Platform
                </p>

                <h1
                    id="hero-heading"
                    className="mt-6 max-w-[1000px] text-[clamp(2.5rem,5.6vw,5rem)] leading-[1.06] font-bold tracking-[-0.045em] text-[#242228] sm:mt-7"
                >
                    Plan, discover, and book
                    <br className="hidden sm:block" /> events with ease.
                </h1>

                <p className="mt-6 max-w-[580px] text-base leading-[1.7] text-[#625e6d] sm:mt-7 sm:text-lg">
                    Agendain helps users find events, reserve seats, and manage
                    bookings in one simple platform. Browse creative workshops,
                    summits, and live indie sessions.
                </p>

                <div className="mt-8 flex w-full max-w-[360px] flex-col items-stretch justify-center gap-3 sm:mt-9 sm:max-w-none sm:flex-row sm:items-center">
                    <Link
                        href={actionHref}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#6236e8] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#5127cf] motion-reduce:transition-none"
                    >
                        Explore Events
                        <ArrowDown size={16} aria-hidden="true" />
                    </Link>
                    <Link
                        href={authenticated ? actionHref : login()}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#eae7ef] bg-white px-6 py-3 text-sm font-medium text-[#242228] transition-colors hover:border-[#d6c9f7] hover:bg-[#faf8ff] motion-reduce:transition-none"
                    >
                        <Bookmark
                            size={16}
                            className="text-[#6236e8]"
                            aria-hidden="true"
                        />
                        My Bookings
                    </Link>
                </div>

                <ul className="mt-10 flex flex-col items-center justify-center gap-4 text-xs text-[#625e6d] sm:mt-12 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
                    {highlights.map(({ icon: Icon, label }) => (
                        <li key={label} className="flex items-center gap-2">
                            <Icon
                                size={14}
                                className="text-[#8a72bb]"
                                aria-hidden="true"
                            />
                            {label}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
