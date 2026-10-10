import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock3,
    MapPin,
    Minus,
    Plus,
    Sparkles,
    Ticket,
} from 'lucide-react';
import {
    EventImage,
    eventDate,
    money,
    primaryButton,
} from '@/components/event-ui';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { book, index } from '@/routes/events';

export default function EventDetails({ event }) {
    const { auth } = usePage().props;
    const form = useForm({
        ticket_quantity: 1,
        name: auth.user.name,
        email: auth.user.email,
        phone_number: auth.user.phone_number ?? '',
    });
    const limit = Math.min(4, event.remaining);
    const fee = event.price > 0 ? 5000 : 0;
    const subtotal = form.data.ticket_quantity * event.price;

    return (
        <>
            <Head title={event.title} />
            <Link
                href={index()}
                className="mb-6 inline-flex items-center gap-2 text-xs text-agendain-text-muted hover:text-agendain-purple"
            >
                <ArrowLeft size={14} /> Back to events
            </Link>
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
                <div className="space-y-7">
                    <div className="relative overflow-hidden rounded-2xl">
                        <EventImage
                            event={event}
                            eager
                            className="aspect-[16/9]"
                        />
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-agendain-purple px-3 py-1.5 text-[10px] font-semibold text-white">
                                {event.category}
                            </span>
                            <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-medium text-emerald-700">
                                {event.remaining
                                    ? 'Open registration'
                                    : 'Registration closed'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className="mb-2 text-[10px] font-semibold tracking-widest text-agendain-purple uppercase">
                            A new experience awaits
                        </p>
                        <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                            {event.title}
                        </h1>
                        <p className="mt-3 text-sm text-agendain-text-muted">
                            {event.tagline}
                        </p>
                        <div className="mt-5 flex items-center gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-full bg-agendain-badge text-agendain-purple">
                                <Sparkles size={18} />
                            </span>
                            <div>
                                <p className="text-xs font-semibold">
                                    {event.organizer}
                                </p>
                                <p className="mt-0.5 text-[10px] text-agendain-text-muted">
                                    Your host for this experience
                                </p>
                            </div>
                        </div>
                    </div>
                    <section
                        aria-label="Event information"
                        className="space-y-4 rounded-2xl border border-agendain-border-card bg-white p-5"
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="flex items-start gap-3 rounded-xl bg-agendain-surface-soft p-3">
                                <CalendarDays
                                    size={17}
                                    className="mt-1 text-agendain-purple"
                                />
                                <div>
                                    <p className="text-[10px] text-agendain-text-muted">
                                        Date
                                    </p>
                                    <p className="mt-1 text-xs font-medium">
                                        {eventDate(event.date, true)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-xl bg-agendain-surface-soft p-3">
                                <Clock3
                                    size={17}
                                    className="mt-1 text-agendain-purple"
                                />
                                <div>
                                    <p className="text-[10px] text-agendain-text-muted">
                                        Time
                                    </p>
                                    <p className="mt-1 text-xs font-medium">
                                        {event.time}–{event.end_time} WIB
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl bg-agendain-surface-soft p-3">
                            <MapPin
                                size={17}
                                className="mt-1 shrink-0 text-agendain-purple"
                            />
                            <div>
                                <p className="text-[10px] text-agendain-text-muted">
                                    Venue
                                </p>
                                <p className="mt-1 text-xs font-medium">
                                    {event.venue}
                                </p>
                                <p className="mt-1 text-[11px] text-agendain-text-muted">
                                    {event.address}
                                </p>
                            </div>
                        </div>
                        <div>
                            <div className="mb-2 flex items-center justify-between text-[11px]">
                                <span>Seat availability</span>
                                <span className="text-agendain-purple">
                                    {event.remaining} seats left of{' '}
                                    {event.quota}
                                </span>
                            </div>
                            <progress
                                aria-label="Seats available"
                                value={event.remaining}
                                max={event.quota}
                                className="h-1.5 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-agendain-purple [&::-webkit-progress-bar]:bg-agendain-badge [&::-webkit-progress-value]:bg-agendain-purple"
                            />
                        </div>
                    </section>
                    <section className="rounded-2xl border border-agendain-border-card bg-white p-6">
                        <h2 className="mb-3 text-sm font-semibold">
                            About the experience
                        </h2>
                        <p className="text-sm leading-7 text-agendain-text-muted">
                            {event.description}
                        </p>
                    </section>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[
                            { title: "What's included", items: event.included },
                            { title: 'What to bring', items: event.bring },
                        ].map(({ title, items }) => (
                            <section
                                key={title}
                                className="rounded-2xl border border-agendain-border-card bg-white p-6"
                            >
                                <h2 className="mb-4 text-sm font-semibold">
                                    {title}
                                </h2>
                                <ul className="space-y-3">
                                    {items.map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-2 text-xs leading-relaxed text-agendain-text-muted"
                                        >
                                            <Check
                                                size={14}
                                                className="mt-0.5 shrink-0 text-agendain-purple"
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>
                </div>
                <aside className="rounded-2xl border border-agendain-border-card bg-white p-6 shadow-agendain-card lg:sticky lg:top-28">
                    <div className="mb-6 flex items-start justify-between gap-4">
                        <div>
                            <p className="mb-1 text-[10px] font-semibold tracking-wide text-agendain-purple uppercase">
                                Your next good plan
                            </p>
                            <h2 className="text-lg font-semibold">
                                Book your seat
                            </h2>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-semibold">
                                {money(event.price)}
                            </p>
                            <p className="text-[10px] text-agendain-text-muted">
                                per person
                            </p>
                        </div>
                    </div>
                    {event.remaining > 0 ? (
                        <form
                            onSubmit={(submitEvent) => {
                                submitEvent.preventDefault();
                                form.post(book.url(event.id));
                            }}
                            className="space-y-5"
                        >
                            <div className="flex items-center justify-between rounded-xl bg-agendain-badge p-3.5">
                                <div>
                                    <p className="text-xs font-semibold">
                                        Number of tickets
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-agendain-text-muted">
                                        Up to {limit} per booking
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg bg-white p-1">
                                    <button
                                        type="button"
                                        aria-label="Remove one ticket"
                                        disabled={
                                            form.data.ticket_quantity <= 1 ||
                                            form.processing
                                        }
                                        onClick={() =>
                                            form.setData(
                                                'ticket_quantity',
                                                form.data.ticket_quantity - 1,
                                            )
                                        }
                                        className="rounded p-1.5 text-agendain-purple disabled:opacity-30"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <output
                                        aria-label="Ticket quantity"
                                        className="text-sm font-medium"
                                    >
                                        {form.data.ticket_quantity}
                                    </output>
                                    <button
                                        type="button"
                                        aria-label="Add one ticket"
                                        disabled={
                                            form.data.ticket_quantity >=
                                                limit || form.processing
                                        }
                                        onClick={() =>
                                            form.setData(
                                                'ticket_quantity',
                                                form.data.ticket_quantity + 1,
                                            )
                                        }
                                        className="rounded p-1.5 text-agendain-purple disabled:opacity-30"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                            <InputError message={form.errors.ticket_quantity} />
                            {[
                                {
                                    key: 'name',
                                    label: 'Full name',
                                    type: 'text',
                                    autoComplete: 'name',
                                },
                                {
                                    key: 'email',
                                    label: 'Email address',
                                    type: 'email',
                                    autoComplete: 'email',
                                },
                                {
                                    key: 'phone_number',
                                    label: 'Phone number (optional)',
                                    type: 'tel',
                                    autoComplete: 'tel',
                                },
                            ].map((field) => (
                                <div key={field.key} className="space-y-2">
                                    <Label
                                        htmlFor={field.key}
                                        className="text-xs"
                                    >
                                        {field.label}
                                    </Label>
                                    <Input
                                        id={field.key}
                                        type={field.type}
                                        autoComplete={field.autoComplete}
                                        required={field.key !== 'phone_number'}
                                        maxLength={
                                            field.key === 'phone_number'
                                                ? 30
                                                : 255
                                        }
                                        value={form.data[field.key]}
                                        onChange={(change) =>
                                            form.setData(
                                                field.key,
                                                change.target.value,
                                            )
                                        }
                                        aria-invalid={!!form.errors[field.key]}
                                        className="h-11 rounded-xl border-agendain-border-card bg-agendain-surface-soft text-xs shadow-none"
                                    />
                                    <InputError
                                        message={form.errors[field.key]}
                                    />
                                </div>
                            ))}
                            <div className="space-y-3 rounded-xl bg-agendain-badge p-4 text-xs">
                                <div className="flex justify-between text-agendain-text-muted">
                                    <span>
                                        {form.data.ticket_quantity} × Event pass
                                    </span>
                                    <span>{money(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-agendain-text-muted">
                                    <span>Service fee</span>
                                    <span>{money(fee)}</span>
                                </div>
                                <div className="flex justify-between border-t border-agendain-purple/10 pt-3 text-sm font-semibold">
                                    <span>Total</span>
                                    <span>{money(subtotal + fee)}</span>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className={`h-12 w-full ${primaryButton}`}
                            >
                                <Ticket size={16} />
                                {form.processing
                                    ? 'Reserving…'
                                    : 'Reserve demo pass'}
                            </Button>
                            <p className="flex items-center justify-center gap-1.5 text-[10px] text-agendain-text-muted">
                                <CheckCircle2
                                    size={12}
                                    className="text-emerald-700"
                                />{' '}
                                Preview booking · no payment is collected
                            </p>
                        </form>
                    ) : (
                        <div className="rounded-xl bg-agendain-surface-soft p-6 text-center">
                            <Ticket
                                size={26}
                                className="mx-auto mb-3 text-agendain-purple"
                            />
                            <h3 className="font-semibold">
                                Registration is closed
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-agendain-text-muted">
                                There are no available seats for this session.
                                Explore another experience.
                            </p>
                            <Button asChild className={`mt-5 ${primaryButton}`}>
                                <Link href={index()}>Explore other events</Link>
                            </Button>
                        </div>
                    )}
                </aside>
            </div>
        </>
    );
}
