import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Bell,
    Building2,
    CalendarDays,
    LayoutDashboard,
    LogOut,
    MapPin,
    Menu,
    ReceiptText,
    Shapes,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { logout } from '@/routes';
import { dashboard } from '@/routes/admin';
import { index as bookingsIndex } from '@/routes/admin/bookings';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { index as venuesIndex } from '@/routes/admin/venues';
import { index as eventsIndex } from '@/routes/events';

export default function AdminLayout({ children }) {
    const {
        props: { auth },
        url,
    } = usePage();

    const categoriesActive = url.startsWith('/admin/categories');
    const venuesActive = url.startsWith('/admin/venues');
    const bookingsActive = url.startsWith('/admin/bookings');
    const dashboardActive =
        !categoriesActive && !venuesActive && !bookingsActive;
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
                className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-agendain-border-header bg-white transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
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
                        <span className="mt-0.5 block text-[10px] font-semibold tracking-[0.16em] text-agendain-purple uppercase">
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
                        aria-current={dashboardActive ? 'page' : undefined}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${dashboardActive ? 'bg-agendain-badge font-semibold text-agendain-purple' : 'text-slate-600 hover:bg-agendain-surface-soft hover:text-agendain-text'}`}
                    >
                        <LayoutDashboard size={17} /> Dashboard (Overview)
                    </Link>
                    <Link
                        href={eventsIndex()}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-agendain-surface-soft hover:text-agendain-text"
                    >
                        <CalendarDays size={17} /> Events (CRUD)
                    </Link>
                    <Link
                        href={categoriesIndex()}
                        aria-current={categoriesActive ? 'page' : undefined}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${categoriesActive ? 'bg-agendain-badge font-semibold text-agendain-purple' : 'text-slate-600 hover:bg-agendain-surface-soft hover:text-agendain-text'}`}
                    >
                        <Shapes size={17} /> Categories (CRUD)
                        {categoriesActive && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-agendain-purple" />
                        )}
                    </Link>
                    <Link
                        href={venuesIndex()}
                        aria-current={venuesActive ? 'page' : undefined}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${venuesActive ? 'bg-agendain-badge font-semibold text-agendain-purple' : 'text-slate-600 hover:bg-agendain-surface-soft hover:text-agendain-text'}`}
                    >
                        <MapPin size={17} /> Venues (CRUD)
                        {venuesActive && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-agendain-purple" />
                        )}
                    </Link>
                    <Link
                        href={bookingsIndex()}
                        onClick={() => setMenuOpen(false)}
                        aria-current={bookingsActive ? 'page' : undefined}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${bookingsActive ? 'bg-agendain-badge font-semibold text-agendain-purple' : 'text-slate-600 hover:bg-agendain-surface-soft hover:text-agendain-text'}`}
                    >
                        <ReceiptText size={17} /> Bookings (CRUD)
                        {bookingsActive && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-agendain-purple" />
                        )}
                    </Link>
                </nav>
                <div className="space-y-1 border-t border-agendain-border-header p-4">
                    <Link
                        href={eventsIndex()}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-agendain-text-muted transition-colors hover:bg-agendain-badge"
                    >
                        <ArrowLeft size={17} /> Back to events
                    </Link>
                    <Link
                        href={logout()}
                        as="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                        <LogOut size={17} /> Logout
                    </Link>
                </div>
            </aside>
            <div className="lg:pl-60">
                <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-agendain-border-header bg-white/95 px-5 backdrop-blur-xs sm:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMenuOpen(true)}
                            className="rounded-lg p-2 hover:bg-agendain-badge lg:hidden"
                            aria-label="Open navigation"
                        >
                            <Menu size={20} />
                        </button>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                            Live System
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            className="relative rounded-lg p-2 text-agendain-text-muted transition-colors hover:bg-agendain-badge hover:text-agendain-purple"
                            aria-label="Notifications"
                        >
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-agendain-purple" />
                        </button>
                        <div className="flex items-center gap-3 border-l border-agendain-border-header pl-4">
                            <div className="grid h-9 w-9 place-items-center rounded-full border border-agendain-border-input bg-agendain-badge text-xs font-semibold text-agendain-purple">
                                {auth.user?.name
                                    ? auth.user.name.slice(0, 2).toUpperCase()
                                    : 'AD'}
                            </div>
                            <div className="text-xs">
                                <p className="leading-tight font-semibold text-agendain-heading">
                                    {auth.user?.name || 'Admin User'}
                                </p>
                                <p className="mt-0.5 text-[10px] text-agendain-text-muted">
                                    {auth.user?.role === 'admin'
                                        ? 'Manager'
                                        : 'User'}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
                    {children}
                </main>
                <footer className="mx-auto flex max-w-7xl items-center gap-1.5 px-8 pb-6 text-[11px] text-agendain-text-muted">
                    <Building2 size={12} /> Agendain administration · Platform
                    Control Panel
                </footer>
            </div>
        </div>
    );
}
