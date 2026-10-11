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
import { destroy } from '@/routes/admin/events';

export function DeleteEventModal({ event, onClose }) {
    const form = useForm({});

    function handleDelete() {
        form.delete(destroy.url(event.id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    }

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !form.processing) onClose();
            }}
        >
            <DialogContent
                className="sm:max-w-md"
                onEscapeKeyDown={(e) => {
                    if (form.processing) e.preventDefault();
                }}
            >
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-900">
                        Delete Event?
                    </DialogTitle>
                    <DialogDescription className="text-xs text-agendain-text-muted">
                        Are you sure you want to permanently delete{' '}
                        <strong className="text-slate-900 font-semibold">{event.title}</strong>?
                        This operation cannot be undone. If this event has active bookings, consider changing its status to Cancelled instead.
                    </DialogDescription>
                </DialogHeader>

                <InputError message={form.errors.event} className="mt-2" />

                <DialogFooter className="gap-2 sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={form.processing}
                        className="text-xs"
                    >
                        Keep Event
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={form.processing}
                        className="text-xs"
                    >
                        {form.processing ? 'Deleting...' : 'Delete Event'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

