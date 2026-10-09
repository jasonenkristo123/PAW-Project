import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
export default function AuthSimpleLayout({
    children,
    title,
    description,
    variant,
}) {
    if (variant === 'agendain' || variant === 'agendain-register') {
        return (
            <div className="flex min-h-svh flex-col bg-agendain-page font-sans text-agendain-text">
                <main className="flex flex-1 items-center justify-center px-5 py-12 sm:py-16">
                    <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-agendain-border-card bg-agendain-white shadow-agendain-card">
                        <div className="px-6 pt-10 sm:px-9 sm:pt-12">
                            <div className="mb-8 space-y-2 text-center">
                                <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.04em]">
                                    {title}
                                </h1>
                                <p className="text-sm leading-relaxed text-agendain-text-muted">
                                    {description}
                                </p>
                            </div>
                            {children}
                        </div>
                    </div>
                </main>
                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-agendain-border-card bg-agendain-surface-soft px-6 py-5 text-xs text-agendain-text-muted sm:px-8">
                    <p>
                        © {new Date().getFullYear()}{' '}
                        {variant === 'agendain-register'
                            ? 'Agendain Technologies Inc.'
                            : 'Agendain.'}{' '}
                        All rights reserved.
                    </p>
                    {variant === 'agendain-register' ? (
                        <div className="flex flex-wrap items-center gap-6">
                            <span>Privacy Policy</span>
                            <span>Terms of Service</span>
                            <span>Support</span>
                        </div>
                    ) : (
                        <Link
                            href={home()}
                            className="rounded hover:text-agendain-purple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-agendain-purple"
                        >
                            Back to home
                        </Link>
                    )}
                </footer>
            </div>
        );
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                                <AppLogoIcon className="size-9 fill-current text-[var(--foreground)] dark:text-agendain-white" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
