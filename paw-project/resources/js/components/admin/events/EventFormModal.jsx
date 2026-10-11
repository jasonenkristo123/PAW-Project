import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store, update } from '@/routes/admin/events';

export function EventFormModal({ mode, event, categories, venues, onClose }) {
    const editing = mode === 'edit';

    const form = useForm({
        title: event?.title ?? '',
        category_id: event?.category_id ?? (categories[0]?.id ?? ''),
        venue_id: event?.venue_id ?? (venues[0]?.id ?? ''),
        date: event?.date ? event.date.slice(0, 10) : '',
        time: event?.time ? event.time.slice(0, 5) : '09:00',
        price: event?.price ?? '0',
        quota: event?.quota ?? 50,
        status: event?.status ?? 'published',
        description: event?.description ?? '',
        whats_included: event?.whats_included ?? '',
        what_to_bring: event?.what_to_bring ?? '',
    });

    const selectedVenue = venues.find(
        (v) => String(v.id) === String(form.data.venue_id),
    );

    function handleSubmit(e) {
        e.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => onClose(),
        };
        if (editing) {
            form.put(update.url(event.id), options);
        } else {
            form.post(store.url(), options);
        }
    }

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !form.processing) onClose();
            }}
        >
            <DialogContent
                className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
                onEscapeKeyDown={(e) => {
                    if (form.processing) e.preventDefault();
                }}
            >
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-900">
                        {editing ? 'Edit Event' : 'Add New Event'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-agendain-text-muted">
                        {editing
                            ? `Update schedule, venue capacity, and ticketing for ${event?.title}.`
                            : 'Create a new event, assign its venue, and configure ticket allotments.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="event-title" className="text-xs font-semibold text-slate-700">
                            Event Title <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            id="event-title"
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                            placeholder="e.g. Creative Design Workshop"
                            maxLength={255}
                            required
                            className="h-10 text-xs focus-visible:ring-agendain-purple"
                        />
                        <InputError message={form.errors.title} />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="event-category" className="text-xs font-semibold text-slate-700">
                                Category <span className="text-rose-500">*</span>
                            </Label>
                            <select
                                id="event-category"
                                value={form.data.category_id}
                                onChange={(e) => form.setData('category_id', e.target.value)}
                                className="h-10 w-full rounded-md border border-agendain-border-input bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-agendain-purple/20"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.category_id} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="event-venue" className="text-xs font-semibold text-slate-700">
                                Venue <span className="text-rose-500">*</span>
                            </Label>
                            <select
                                id="event-venue"
                                value={form.data.venue_id}
                                onChange={(e) => form.setData('venue_id', e.target.value)}
                                className="h-10 w-full rounded-md border border-agendain-border-input bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-agendain-purple/20"
                                required
                            >
                                <option value="">Select Venue</option>
                                {venues.map((ven) => (
                                    <option key={ven.id} value={ven.id}>
                                        {ven.name} (Max {ven.capacity})
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.venue_id} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="event-date" className="text-xs font-semibold text-slate-700">
                                Event Date <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="event-date"
                                type="date"
                                value={form.data.date}
                                onChange={(e) => form.setData('date', e.target.value)}
                                required
                                className="h-10 text-xs focus-visible:ring-agendain-purple"
                            />
                            <InputError message={form.errors.date} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="event-time" className="text-xs font-semibold text-slate-700">
                                Start Time <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="event-time"
                                type="time"
                                value={form.data.time}
                                onChange={(e) => form.setData('time', e.target.value)}
                                required
                                className="h-10 text-xs focus-visible:ring-agendain-purple"
                            />
                            <InputError message={form.errors.time} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="event-price" className="text-xs font-semibold text-slate-700">
                                Ticket Price (Rp) <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="event-price"
                                type="number"
                                min="0"
                                step="1000"
                                value={form.data.price}
                                onChange={(e) => form.setData('price', e.target.value)}
                                placeholder="0 for Free"
                                required
                                className="h-10 text-xs focus-visible:ring-agendain-purple"
                            />
                            <InputError message={form.errors.price} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="event-quota" className="text-xs font-semibold text-slate-700">
                                Ticket Quota <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="event-quota"
                                type="number"
                                min="1"
                                max={selectedVenue?.capacity ?? 100000}
                                value={form.data.quota}
                                onChange={(e) => form.setData('quota', e.target.value)}
                                required
                                className="h-10 text-xs focus-visible:ring-agendain-purple"
                            />
                            <InputError message={form.errors.quota} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="event-status" className="text-xs font-semibold text-slate-700">
                                Status <span className="text-rose-500">*</span>
                            </Label>
                            <select
                                id="event-status"
                                value={form.data.status}
                                onChange={(e) => form.setData('status', e.target.value)}
                                className="h-10 w-full rounded-md border border-agendain-border-input bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-agendain-purple/20"
                                required
                            >
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <InputError message={form.errors.status} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="event-desc" className="text-xs font-semibold text-slate-700">
                            Description <span className="text-rose-500">*</span>
                        </Label>
                        <textarea
                            id="event-desc"
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            rows={3}
                            placeholder="Detail overview of the event..."
                            required
                            className="w-full rounded-md border border-agendain-border-input p-3 text-xs outline-none focus:ring-2 focus:ring-agendain-purple/20"
                        />
                        <InputError message={form.errors.description} />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="event-included" className="text-xs font-semibold text-slate-700">
                                What's Included (optional)
                            </Label>
                            <textarea
                                id="event-included"
                                value={form.data.whats_included}
                                onChange={(e) => form.setData('whats_included', e.target.value)}
                                rows={2}
                                placeholder="E.g. Full session pass, snacks"
                                className="w-full rounded-md border border-agendain-border-input p-2 text-xs outline-none focus:ring-2 focus:ring-agendain-purple/20"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="event-bring" className="text-xs font-semibold text-slate-700">
                                What to Bring (optional)
                            </Label>
                            <textarea
                                id="event-bring"
                                value={form.data.what_to_bring}
                                onChange={(e) => form.setData('what_to_bring', e.target.value)}
                                rows={2}
                                placeholder="E.g. Laptop, notebook"
                                className="w-full rounded-md border border-agendain-border-input p-2 text-xs outline-none focus:ring-2 focus:ring-agendain-purple/20"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={form.processing}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="bg-agendain-purple text-xs text-white shadow-xs hover:bg-agendain-purple-hover"
                        >
                            {form.processing ? 'Saving...' : editing ? 'Update Event' : 'Create Event'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

