export function StatusBadge({ status }) {
    const isActive = status === 'active';
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                isActive
                    ? 'border border-emerald-100 bg-emerald-50 text-emerald-700'
                    : 'border border-slate-200 bg-slate-100 text-slate-600'
            }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${
                    isActive ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
            />
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
}
