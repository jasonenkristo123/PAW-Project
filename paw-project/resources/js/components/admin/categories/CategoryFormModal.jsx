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
import { store, update } from '@/routes/admin/categories';
import { primaryButtonClass, slugify } from '@/utils/categories';

export function CategoryFormModal({ mode, category, onClose }) {
    const editing = mode === 'edit';

    const form = useForm({
        name: category?.name ?? '',
        description: category?.description ?? '',
        status: category?.status ?? 'active',
    });

    const currentSlug = form.data.name
        ? slugify(form.data.name)
        : (category?.slug ?? '');

    function handleSubmit(e) {
        e.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => onClose(),
        };
        if (editing) {
            form.put(update.url(category.id), options);
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
                className="sm:max-w-md"
                onEscapeKeyDown={(e) => {
                    if (form.processing) e.preventDefault();
                }}
            >
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-900">
                        {editing ? 'Edit Category' : 'Add New Category'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-agendain-text-muted">
                        {editing
                            ? `Update settings for ${category?.name}. Changes apply across active event discovery.`
                            : 'Create a new classification category for events in the discovery engine.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="category-name"
                            className="text-xs font-semibold text-slate-700"
                        >
                            Category Name
                        </Label>
                        <Input
                            id="category-name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            placeholder="e.g. Workshop, Seminar, Technology"
                            disabled={form.processing}
                            className="text-sm"
                            required
                        />
                        {currentSlug && (
                            <p className="font-mono text-[11px] text-agendain-text-muted">
                                Generated slug:{' '}
                                <span className="font-semibold text-agendain-purple">
                                    /{currentSlug}
                                </span>
                            </p>
                        )}
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="category-description"
                            className="text-xs font-semibold text-slate-700"
                        >
                            Description
                        </Label>
                        <textarea
                            id="category-description"
                            rows={3}
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                            placeholder="Describe what kind of events belong in this category..."
                            disabled={form.processing}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        />
                        <InputError message={form.errors.description} />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-700">
                            Status
                        </Label>
                        <div className="flex gap-4">
                            {['active', 'inactive'].map((val) => (
                                <label
                                    key={val}
                                    className="flex cursor-pointer items-center gap-2 text-sm"
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value={val}
                                        checked={form.data.status === val}
                                        onChange={() =>
                                            form.setData('status', val)
                                        }
                                        disabled={form.processing}
                                        className="accent-agendain-purple"
                                    />
                                    <span
                                        className={
                                            val === 'active'
                                                ? 'font-medium text-slate-800'
                                                : 'text-slate-600'
                                        }
                                    >
                                        {val.charAt(0).toUpperCase() +
                                            val.slice(1)}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <InputError message={form.errors.status} />
                    </div>

                    <DialogFooter className="gap-2 pt-3 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={form.processing}
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className={primaryButtonClass}
                        >
                            {form.processing
                                ? 'Saving…'
                                : editing
                                  ? 'Save changes'
                                  : 'Create Category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
