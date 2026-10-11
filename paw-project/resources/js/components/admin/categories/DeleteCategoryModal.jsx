import { Link, useForm } from '@inertiajs/react';
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
import { destroy, edit } from '@/routes/admin/categories';
import { primaryButtonClass } from '@/utils/categories';

export function DeleteCategoryModal({ category, filters, onClose }) {
    const deletion = useForm({});
    const hasEvents = (category.events_count ?? 0) > 0;

    function handleDelete() {
        deletion.delete(destroy.url(category.id), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    }

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !deletion.processing) onClose();
            }}
        >
            <DialogContent
                onEscapeKeyDown={(e) => {
                    if (deletion.processing) e.preventDefault();
                }}
            >
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-900">
                        Delete category?
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-600">
                        {hasEvents
                            ? `"${category.name}" has ${category.events_count} assigned events. You cannot delete categories with active events. Please set the status to Inactive instead.`
                            : `Are you sure you want to permanently remove "${category.name}"? This action cannot be undone.`}
                    </DialogDescription>
                </DialogHeader>

                <InputError message={deletion.errors.category} />

                <DialogFooter className="gap-2 pt-3 sm:gap-0">
                    <Button
                        variant="outline"
                        disabled={deletion.processing}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    {hasEvents ? (
                        <Button asChild className={primaryButtonClass}>
                            <Link
                                href={edit(category.id, { query: filters })}
                                preserveScroll
                                onClick={onClose}
                            >
                                Edit category status
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            disabled={deletion.processing}
                            onClick={handleDelete}
                        >
                            {deletion.processing
                                ? 'Deleting…'
                                : 'Delete Category'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
