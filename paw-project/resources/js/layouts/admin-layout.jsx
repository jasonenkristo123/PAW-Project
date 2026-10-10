import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    ArrowLeft,
    CalendarDays,
    LayoutDashboard,
    LogOut,
    MapPin,
    Menu,
    ReceiptText,
    Shapes,
    ShieldCheck,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { logout } from '@/routes';
import { index } from '@/routes/admin/venues';
import { dashboard } from '@/routes/admin';
import { index as bookingsIndex } from '@/routes/admin/bookings';
import { index as eventsIndex } from '@/routes/events';

const pendingSections = [
    { title: 'Events', icon: CalendarDays },
    { title: 'Categories', icon: Shapes },
];

export default function AdminLayout({ children }) {
    const {
        props: { auth },
        url,
    } = usePage();
    const venuesActive = url.startsWith('/admin/venues');
    const dashboardActive = !venuesActive;
    const [menuOpen, setMenuOpen] = useState(false);
    useFlashToast();

    return (
        <div className="min-h-screen bg-agendain-page text-agendain-text">
            {menuOpen && (
                <button
                    className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close navigation"
                />
            )}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-agendain-border-header bg-white transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex h-20 items-center justify-between border-b border-agendain-border-header px-6">
                    <Link
                        href={dashboard()}
                        className="leading-tight"
                        onClick={() => setMenuOpen(false)}
                    >
                        <span className="block text-lg font-bold tracking-tight">
                            Agendain
                            <span className="text-agendain-purple">.</span>
                        </span>
                        <span className="mt-1 block text-[10px] font-semibold tracking-[0.16em] text-agendain-purple">
                            ADMIN WORKSPACE
                        </span>
                    </Link>
                    <button
                        className="p-1 lg:hidden"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close navigation"
                    >
                        <X size={18} />
                    </button>
                </div>
                <nav
                    aria-label="Admin navigation"
                    className="flex-1 space-y-1 px-4 py-7"
                >
                    <p className="mb-4 px-3 text-[10px] font-semibold tracking-wider text-agendain-text-muted">
                        PLATFORM MANAGEMENT
                    </p>
                    <Link
                        href={dashboard()}
                        aria-current={
                            dashboardActive &&
                            !url.startsWith('/admin/bookings')
                                ? 'page'
                                : undefined
                        }
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${dashboardActive && !url.startsWith('/admin/bookings') ? 'bg-agendain-badge font-semibold text-agendain-purple' : 'hover:bg-agendain-surface-soft'}`}
                    >
                        <LayoutDashboard size={17} /> Dashboard
                    </Link>
                    {pendingSections
                        .slice(0, 2)
                        .map(({ title, icon: Icon }) => (
                            <span
                                key={title}
                                aria-disabled="true"
                                className="flex items-center gap-3 px-3 py-3 text-sm text-agendain-text-muted"
                            >
                                <Icon size={17} />
                                {title}
                                <span className="ml-auto text-[9px] text-agendain-placeholder">
                                    Soon
                                </span>
                            </span>
                        ))}
                    <Link
                        href={index()}
                        aria-current={venuesActive ? 'page' : undefined}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${venuesActive ? 'bg-agendain-badge font-semibold text-agendain-purple' : 'hover:bg-agendain-surface-soft'}`}
                    >
                        <MapPin size={17} /> Venues{' '}
                        {venuesActive && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-agendain-purple" />
                        )}
                    </Link>
                    <Link
                        href={bookingsIndex()}
                        onClick={() => setMenuOpen(false)}
                        aria-current={
                            url.startsWith('/admin/bookings')
                                ? 'page'
                                : undefined
                        }
                        className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${url.startsWith('/admin/bookings') ? 'bg-agendain-badge font-semibold text-agendain-purple' : 'hover:bg-agendain-surface-soft'}`}
                    >
                        <ReceiptText size={17} /> Bookings
                    </Link>
                </nav>
                <div className="border-t border-agendain-border-header p-4">
                    <Link
                        href={eventsIndex()}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-agendain-text-muted hover:bg-agendain-badge"
                    >
                        <ArrowLeft size={17} /> Back to events
                    </Link>
                    <Link
                        href={logout()}
                        as="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                        <LogOut size={17} /> Logout
                    </Link>
                </div>
            </aside>
            <div className="lg:pl-56">
                <header className="flex h-20 items-center justify-between border-b border-agendain-border-header bg-white/90 px-5 sm:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMenuOpen(true)}
                            className="rounded-lg p-2 hover:bg-agendain-badge lg:hidden"
                            aria-label="Open navigation"
                        >
                            <Menu size={20} />
                        </button>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />{' '}
                            Admin workspace
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ShieldCheck
                            size={18}
                            className="hidden text-agendain-text-muted sm:block"
                        />
                        <div className="grid h-9 w-9 place-items-center rounded-full border border-agendain-border-input bg-agendain-badge text-xs font-semibold text-agendain-purple">
                            {auth.user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="text-xs">
                            <p className="font-semibold">{auth.user.name}</p>
                            <p className="mt-0.5 text-[10px] text-agendain-text-muted">
                                Administrator
                            </p>
                        </div>
                    </div>
                </header>
                <main className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
                    {children}
                </main>
                <footer className="mx-auto flex max-w-7xl items-center gap-1.5 px-8 pb-6 text-[11px] text-agendain-text-muted">
                    <Building2 size={12} /> Agendain administration
                </footer>
            </div>
        </div>
    );
}
