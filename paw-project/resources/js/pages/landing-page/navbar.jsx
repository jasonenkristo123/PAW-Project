import { Link } from '@inertiajs/react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { dashboard, login, register } from '@/routes';

export default function Navbar({ authenticated }) {
    const [open, setOpen] = useState(false);

    return (
        <header className="border-b border-agendain-border-header bg-agendain-white">
            <div className="mx-auto flex min-h-[72px] w-[calc(100%_-_40px)] max-w-[1160px] items-center gap-9 min-[701px]:min-h-[86px] min-[701px]:w-[calc(100%_-_64px)] min-[1001px]:w-[calc(100%_-_96px)]">
                <a
                    href="#"
                    className="inline-flex items-center gap-[9px] text-[23px] font-bold tracking-[-1px] text-landing-ink"
                    aria-label="Agendain home"
                >
                    <span className="grid h-[34px] w-[31px] -rotate-7 place-items-center rounded-[3px] bg-landing-ink font-serif text-[29px] font-bold text-agendain-white italic">
                        a
                    </span>{' '}
                    agendain
                    <span className="-ml-[9px] text-agendain-purple-muted">
                        .
                    </span>
                </a>
                <nav
                    className="ml-[30px] hidden gap-[27px] text-[13px] font-medium min-[701px]:flex [&_a]:text-landing-text [&_a:hover]:text-agendain-purple-muted"
                    aria-label="Main navigation"
                >
                    <a href="#why-agendain">Why Agendain</a>
                    <a href="#how-it-works">How it works</a>
                </nav>
                <div className="ml-auto hidden items-center gap-[25px] text-[13px] min-[701px]:flex">
                    {authenticated ? (
                        <Link
                            href={dashboard()}
                            className="inline-flex items-center justify-center gap-3.5 rounded-md bg-landing-ink px-[21px] py-3.5 text-sm leading-[1.3] font-semibold text-agendain-white transition-[background,transform] duration-150 hover:-translate-y-0.5 hover:bg-landing-ink-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                        >
                            Open dashboard <ArrowUpRight size={16} />
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="text-landing-text hover:text-agendain-purple-muted"
                            >
                                Log in
                            </Link>
                            <Link
                                href={register()}
                                className="inline-flex items-center justify-center gap-3.5 rounded-md bg-landing-ink px-[21px] py-3.5 text-sm leading-[1.3] font-semibold text-agendain-white transition-[background,transform] duration-150 hover:-translate-y-0.5 hover:bg-landing-ink-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                            >
                                Register <ArrowUpRight size={16} />
                            </Link>
                        </>
                    )}
                </div>
                <button
                    className="ml-auto grid cursor-pointer place-items-center border-0 bg-transparent p-2 text-landing-ink min-[701px]:hidden"
                    onClick={() => setOpen(!open)}
                    aria-expanded={open}
                    aria-controls="grid gap-[18px] border-t border-landing-border-menu px-5 pt-3 pb-[25px] text-sm min-[701px]:hidden [&_a]:flex [&_a]:items-center [&_a]:gap-2 [&_a]:text-landing-ink"
                    aria-label={open ? 'Close menu' : 'Open menu'}
                >
                    {open ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
            {open && (
                <nav
                    id="grid gap-[18px] border-t border-landing-border-menu px-5 pt-3 pb-[25px] text-sm min-[701px]:hidden [&_a]:flex [&_a]:items-center [&_a]:gap-2 [&_a]:text-landing-ink"
                    className="grid gap-[18px] border-t border-landing-border-menu px-5 pt-3 pb-[25px] text-sm min-[701px]:hidden [&_a]:flex [&_a]:items-center [&_a]:gap-2 [&_a]:text-landing-ink"
                    aria-label="Mobile navigation"
                >
                    <a href="#why-agendain" onClick={() => setOpen(false)}>
                        Why Agendain
                    </a>
                    <a href="#how-it-works" onClick={() => setOpen(false)}>
                        How it works
                    </a>
                    {authenticated ? (
                        <Link href={dashboard()}>Open dashboard</Link>
                    ) : (
                        <>
                            <Link href={login()}>Log in</Link>
                            <Link href={register()}>
                                Create an account <ArrowUpRight size={16} />
                            </Link>
                        </>
                    )}
                </nav>
            )}
        </header>
    );
}
