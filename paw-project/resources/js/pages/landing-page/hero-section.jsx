import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    ArrowDown,
    Bookmark,
    CalendarDays,
    Pause,
    Play,
    Sparkles,
    Ticket,
} from 'lucide-react';
import { login } from '@/routes';

const highlights = [
    { icon: CalendarDays, label: 'Events worth discovering' },
    { icon: Bookmark, label: 'All your plans in one place' },
    { icon: Ticket, label: 'Simple seat reservations' },
];

const headlinePhrases = [
    { text: 'great', className: 'bg-highlight-purple text-agendain-purple' },
    {
        text: 'better',
        className: 'bg-highlight-amber text-highlight-amber-text',
    },
    { text: 'fun', className: 'bg-highlight-teal text-highlight-teal-text' },
];

export default function HeroSection({ actionHref, authenticated }) {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const preference = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );
        const syncPreference = () => setReducedMotion(preference.matches);
        syncPreference();
        preference.addEventListener('change', syncPreference);
        return () => preference.removeEventListener('change', syncPreference);
    }, []);

    useEffect(() => {
        if (paused || reducedMotion) return;

        const interval = window.setInterval(() => {
            setPhraseIndex((index) => (index + 1) % headlinePhrases.length);
        }, 1000);

        return () => window.clearInterval(interval);
    }, [paused, reducedMotion]);

    const activePhrase = headlinePhrases[phraseIndex];

    return (
        <section
            aria-labelledby="hero-heading"
            className="px-5 pt-16 pb-16 sm:px-8 sm:pt-20 sm:pb-20 lg:px-12 lg:pt-24 lg:pb-24"
        >
            <div className="mx-auto flex max-w-[1280px] flex-col items-center text-center">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-agendain-badge px-3 py-1.5 text-xs font-medium text-agendain-purple">
                    <Sparkles size={13} aria-hidden="true" />
                    Simple Event Booking Platform
                </p>

                <h1
                    id="hero-heading"
                    className="mt-7 text-[clamp(2.25rem,7.5vw,7.5rem)] leading-[1.08] font-bold tracking-[-0.055em] text-agendain-heading sm:mt-8"
                >
                    <span className="sr-only">
                        Discover events. Make great plans.
                    </span>
                    <span aria-hidden="true">
                        Discover events.
                        <br />
                        <span className="mt-[0.12em] flex flex-wrap items-center justify-center gap-x-[0.22em] gap-y-[0.12em]">
                            Make
                            <span
                                className={`inline-block rounded-full px-[0.4em] py-[0.16em] text-[0.8em] leading-[1.1] tracking-[-0.045em] whitespace-nowrap transition-colors duration-300 motion-reduce:transition-none ${activePhrase.className}`}
                            >
                                {activePhrase.text}
                            </span>
                            plans.
                        </span>
                    </span>
                </h1>

                <p className="mt-6 max-w-[920px] text-base leading-relaxed text-agendain-text-muted sm:mt-7 sm:text-xl lg:text-2xl">
                    Find your next experience, book your seat, and keep your
                    plans together.
                </p>

                <div className="mt-8 flex w-full max-w-[360px] flex-col items-stretch justify-center gap-3 sm:mt-9 sm:max-w-none sm:flex-row sm:items-center">
                    <Link
                        href={actionHref}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-agendain-purple px-6 py-3 text-sm font-semibold text-agendain-white transition-colors hover:bg-agendain-purple-hover motion-reduce:transition-none"
                    >
                        Explore Events
                        <ArrowDown size={16} aria-hidden="true" />
                    </Link>
                    <Link
                        href={authenticated ? actionHref : login()}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-agendain-border-button bg-agendain-white px-6 py-3 text-sm font-medium text-agendain-text transition-colors hover:border-agendain-border-button-hover hover:bg-agendain-surface-hover motion-reduce:transition-none"
                    >
                        <Bookmark
                            size={16}
                            className="text-agendain-purple"
                            aria-hidden="true"
                        />
                        My Bookings
                    </Link>
                </div>

                <ul className="mt-10 flex flex-col items-center justify-center gap-4 text-xs text-agendain-text-muted sm:mt-12 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
                    {highlights.map(({ icon: Icon, label }) => (
                        <li key={label} className="flex items-center gap-2">
                            <Icon
                                size={14}
                                className="text-agendain-icon-accent"
                                aria-hidden="true"
                            />
                            {label}
                        </li>
                    ))}
                </ul>
                {!reducedMotion && (
                    <button
                        type="button"
                        onClick={() => setPaused((value) => !value)}
                        aria-pressed={paused}
                        aria-label="Pause rotating headline"
                        className="mt-5 inline-flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-xs text-agendain-text-muted hover:text-agendain-purple"
                    >
                        {paused ? (
                            <Play size={12} aria-hidden="true" />
                        ) : (
                            <Pause size={12} aria-hidden="true" />
                        )}
                        {paused ? 'Resume animation' : 'Pause animation'}
                    </button>
                )}
            </div>
        </section>
    );
}
