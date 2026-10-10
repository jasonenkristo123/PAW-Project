import { Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    CalendarDays,
    ChevronDown,
    Menu,
    ShieldCheck,
    Ticket,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { UserMenuContent } from '@/components/user-menu-content';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { home } from '@/routes';
import { index as eventsIndex } from '@/routes/events';
import { index as bookingsIndex } from '@/routes/bookings';
import { dashboard as adminIndex } from '@/routes/admin';

export default function ExploreLayout({ children }) {
    const {
        props: { auth },
        url,
    } = usePage();
    const [open, setOpen] = useState(false);
    useFlashToast();
    const links = [
        {
            title: 'Events',
            href: eventsIndex(),
            active: url.startsWith('/events'),
            icon: CalendarDays,
        },
        {
            title: 'My Bookings',
            href: bookingsIndex(),
            active: url.startsWith('/my-bookings'),
            icon: Ticket,
        },
        ...(auth.user.role === 'admin'
            ? [
                  {
                      title: 'Admin',
                      href: adminIndex(),
                      active: false,
                      icon: ShieldCheck,
                  },
              ]
            : []),
    ];

    return (
        <div className="flex min-h-screen flex-col bg-agendain-page text-agendain-text">
            <header className="sticky top-0 z-30 border-b border-agendain-border-header bg-white/95 backdrop-blur-md print:hidden">
                <div className="mx-auto flex h-20 max-w-7xl items-center gap-10 px-5 sm:px-8">
                    <Link
                        href={eventsIndex()}
                        className="text-xl font-semibold tracking-tight"
                    >
                        Agendain<span className="text-agendain-purple">.</span>
                    </Link>
                    <nav
                        aria-label="Main navigation"
                        className="hidden h-full items-center gap-7 md:flex"
                    >
                        {links.map(({ title, href, active }) => (
                            <Link
                                key={title}
                                href={href}
                                aria-current={active ? 'page' : undefined}
                                className={`flex h-full items-center border-b-2 text-sm transition-colors ${active ? 'border-agendain-purple font-semibold text-agendain-purple' : 'border-transparent text-agendain-text-muted hover:text-agendain-purple'}`}
                            >
                                {title}
                            </Link>
                        ))}
                    </nav>
                    <div className="ml-auto flex items-center gap-3">
                        <span className="hidden rounded-full bg-agendain-badge px-3 py-1.5 text-[10px] font-medium text-agendain-purple sm:block">
                            A little time, well spent.
                        </span>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                aria-label="Open account menu"
                                className="flex items-center gap-2 rounded-full p-1 outline-none focus-visible:ring-2 focus-visible:ring-agendain-purple"
                            >
                                <span className="grid h-9 w-9 place-items-center rounded-full border border-agendain-purple/15 bg-agendain-badge text-xs font-semibold text-agendain-purple">
                                    {auth.user.name.slice(0, 2).toUpperCase()}
                                </span>
                                <ChevronDown
                                    size={13}
                                    className="text-agendain-text-muted"
                                />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <button
                            onClick={() => setOpen(!open)}
                            aria-label={
                                open ? 'Close navigation' : 'Open navigation'
                            }
                            aria-expanded={open}
                            className="rounded-lg p-2 hover:bg-agendain-badge md:hidden"
                        >
                            {open ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
                {open && (
                    <nav
                        aria-label="Mobile navigation"
                        className="space-y-1 border-t border-agendain-border-header px-5 py-3 md:hidden"
                    >
                        {links.map(({ title, href, active, icon: Icon }) => (
                            <Link
                                key={title}
                                href={href}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${active ? 'bg-agendain-badge font-semibold text-agendain-purple' : 'text-agendain-text-muted'}`}
                            >
                                <Icon size={17} />
                                {title}
                            </Link>
                        ))}
                    </nav>
                )}
            </header>
            <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8 sm:py-10">
                {children}
            </main>
            <footer className="mt-6 border-t border-agendain-border-header bg-white print:hidden">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-8 text-xs sm:px-8">
                    <div>
                        <Link href={home()} className="text-sm font-semibold">
                            Agendain
                            <span className="text-agendain-purple">.</span>
                        </Link>
                        <p className="mt-1.5 text-agendain-text-muted">
                            Good company. New experiences. Better plans.
                        </p>
                    </div>
                    <Link
                        href={eventsIndex()}
                        className="inline-flex items-center gap-1.5 text-agendain-purple"
                    >
                        Find your next experience <ArrowUpRight size={14} />
                    </Link>
                    <p className="text-[10px] text-agendain-text-muted">
                        © {new Date().getFullYear()} Agendain
                    </p>
                </div>
            </footer>
        </div>
    );
}
