import { Link } from '@inertiajs/react';
import { CalendarDays, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { edit } from '@/routes/admin/categories';
import { getCategoryIcon, primaryButtonClass } from '@/utils/categories';
import { StatusBadge } from './StatusBadge';

export function CategoryDetailsModal({ category, filters, onClose }) {
    const Icon = getCategoryIcon(category.name);

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="mb-1 flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-xl border border-purple-100 bg-purple-50 text-agendain-purple">
                            <Icon size={22} />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-slate-900">
                                {category.name}
                            </DialogTitle>
                            <DialogDescription className="font-mono text-xs font-medium text-agendain-purple">
                                slug: /{category.slug}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between">
                        <StatusBadge status={category.status} />
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-100 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-agendain-purple">
                            <CalendarDays size={14} />
                            {category.events_count ?? 0} Total Events
                        </span>
                    </div>

                    <div>
                        <h4 className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                            Description
                        </h4>
                        <p className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
                            {category.description ||
                                'No description provided for this category.'}
                        </p>
                    </div>

                    <div>
                        <h4 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                            Assigned Events ({category.events?.length ?? 0})
                        </h4>
                        {category.events && category.events.length > 0 ? (
                            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                                {category.events.map((ev) => (
                                    <div
                                        key={ev.id}
                                        className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2.5 transition hover:bg-slate-50"
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">
                                                {ev.title}
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                {ev.date} ·{' '}
                                                {ev.venue?.name || 'Venue'}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-700 uppercase">
                                            {ev.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">
                                No events currently assigned.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 pt-3 sm:gap-0">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button asChild className={primaryButtonClass}>
                        <Link
                            href={edit(category.id, { query: filters })}
                            preserveScroll
                        >
                            <Pencil size={14} className="mr-1.5" /> Edit
                            category
                        </Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
