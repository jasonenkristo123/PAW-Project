import { MapPin } from 'lucide-react';

export const primaryButton =
    'rounded-xl bg-agendain-purple text-white shadow-agendain-button hover:bg-agendain-purple-hover';
export const money = (value) =>
    value === 0
        ? 'Free'
        : new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0,
          }).format(value);
export const eventDate = (date, long = false) =>
    new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: long ? 'long' : 'short',
        year: 'numeric',
        ...(long ? { weekday: 'long' } : {}),
        timeZone: 'Asia/Jakarta',
    }).format(new Date(`${date}T00:00:00+07:00`));

export function EventImage({ event, className = '', eager = false }) {
    return (
        <img
            src={event.image}
            alt={`Illustrative ${event.category.toLowerCase()} experience`}
            className={`w-full object-cover ${className}`}
            loading={eager ? 'eager' : 'lazy'}
        />
    );
}

export function VenueLine({ event, className = '' }) {
    return (
        <p
            className={`flex items-center gap-1.5 text-xs text-agendain-text-muted ${className}`}
        >
            <MapPin size={13} className="shrink-0" />
            {event.venue}, Jakarta
        </p>
    );
}

export function BookingStatus({ status }) {
    const styles = {
        confirmed: 'bg-emerald-50 text-emerald-700',
        pending: 'bg-amber-50 text-amber-700',
        cancelled: 'bg-red-50 text-red-600',
        completed: 'bg-agendain-badge text-agendain-purple',
    };
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${styles[status]}`}
        >
            <span className="h-1 w-1 rounded-full bg-current" />
            {status}
        </span>
    );
}
