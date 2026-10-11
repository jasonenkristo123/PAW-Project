import {
    CalendarDays,
    Clock,
    DollarSign,
    MapPin,
    Tag,
    Ticket,
    Users,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

function formatRupiah(value) {
    const num = Number(value);
    if (!num || num === 0) return 'Free';
    return 'Rp' + num.toLocaleString('id-ID');
}

export function EventDetailsModal({ event, onClose }) {
    if (!event) return null;

    const sold = Number(event.sold_tickets ?? 0);
    const quota = Number(event.quota ?? 1);
    const percent = Math.min(100, Math.round((sold / quota) * 100));

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-agendain-badge px-2.5 py-0.5 text-[10px] font-semibold text-agendain-purple">
                            #{'EVT-' + event.id}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {event.status}
                        </span>
                    </div>
                    <DialogTitle className="pt-1 text-lg font-bold text-slate-900">
                        {event.title}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-agendain-text-muted">
                        Event configuration, venue capacity, and ticketing details.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-3 rounded-xl border border-agendain-border-card bg-agendain-surface-soft p-3.5 text-xs">
                        <div className="flex items-center gap-2">
                            <Tag size={15} className="text-agendain-purple" />
                            <div>
                                <p className="text-[10px] text-agendain-text-muted">Category</p>
                                <p className="font-semibold">{event.category?.name ?? '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign size={15} className="text-agendain-purple" />
                            <div>
                                <p className="text-[10px] text-agendain-text-muted">Ticket Price</p>
                                <p className="font-semibold text-agendain-purple">
                                    {formatRupiah(event.price)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarDays size={15} className="text-agendain-purple" />
                            <div>
                                <p className="text-[10px] text-agendain-text-muted">Schedule Date</p>
                                <p className="font-semibold">{event.date ? event.date.slice(0, 10) : '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={15} className="text-agendain-purple" />
                            <div>
                                <p className="text-[10px] text-agendain-text-muted">Time</p>
                                <p className="font-semibold">
                                    {event.time ? event.time.slice(0, 5) : '-'} WIB
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-agendain-border-card bg-white p-3.5 text-xs">
                        <div className="flex items-start gap-2">
                            <MapPin size={16} className="mt-0.5 text-agendain-purple shrink-0" />
                            <div>
                                <p className="font-semibold">{event.venue?.name ?? '-'}</p>
                                <p className="mt-0.5 text-[11px] text-agendain-text-muted">
                                    {event.venue?.address ?? 'No address provided'}
                                </p>
                                <p className="mt-1 text-[10px] font-medium text-slate-500">
                                    Venue Capacity: {event.venue?.capacity ?? 0} seats
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-agendain-border-card bg-white p-3.5 text-xs">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                <Ticket size={15} className="text-agendain-purple" />
                                <span>Ticket Allotment</span>
                            </div>
                            <span className="font-bold text-slate-900">
                                {sold} / {quota} ({percent}%)
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-agendain-purple transition-all"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                        <p className="font-semibold text-slate-700">Description</p>
                        <p className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-slate-600 leading-relaxed">
                            {event.description}
                        </p>
                    </div>

                    {event.whats_included && (
                        <div className="space-y-1 text-xs">
                            <p className="font-semibold text-slate-700">What's Included</p>
                            <p className="text-slate-600 whitespace-pre-line text-[11px]">
                                {event.whats_included}
                            </p>
                        </div>
                    )}

                    {event.what_to_bring && (
                        <div className="space-y-1 text-xs">
                            <p className="font-semibold text-slate-700">What to Bring</p>
                            <p className="text-slate-600 whitespace-pre-line text-[11px]">
                                {event.what_to_bring}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-2">
                    <Button onClick={onClose} variant="outline" className="text-xs">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

