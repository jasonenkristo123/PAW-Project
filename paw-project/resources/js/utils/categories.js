import {
    Code2,
    Music,
    Presentation,
    Shapes,
    Trophy,
    Users,
    Wrench,
} from 'lucide-react';
export const number = new Intl.NumberFormat('en-US');

export const primaryButtonClass =
    'bg-agendain-purple text-white shadow-agendain-button hover:bg-agendain-purple-hover cursor-pointer transition';

export function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}

export function getCategoryIcon(name) {
    const lower = (name || '').toLowerCase();
    if (lower.includes('work') || lower.includes('craft')) return Wrench;
    if (
        lower.includes('semi') ||
        lower.includes('talk') ||
        lower.includes('lecture')
    )
        return Presentation;
    if (
        lower.includes('tech') ||
        lower.includes('code') ||
        lower.includes('dev')
    )
        return Code2;
    if (
        lower.includes('music') ||
        lower.includes('concert') ||
        lower.includes('audio')
    )
        return Music;
    if (
        lower.includes('commun') ||
        lower.includes('social') ||
        lower.includes('meet')
    )
        return Users;
    if (
        lower.includes('compet') ||
        lower.includes('hack') ||
        lower.includes('battle')
    )
        return Trophy;
    return Shapes;
}
