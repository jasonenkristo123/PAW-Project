import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { login } from '@/routes';

export default function Footer({ actionHref, authenticated }) {
    return (
        <>
            <section className="mx-auto w-[calc(100%_-_40px)] max-w-[1160px] py-[65px] text-center min-[701px]:w-[calc(100%_-_64px)] min-[701px]:py-[93px] min-[1001px]:w-[calc(100%_-_96px)] [&>a]:mt-[27px] [&>h2]:text-[clamp(36px,4.6vw,56px)] [&>h2]:leading-[1.15] [&>h2]:font-semibold [&>h2]:tracking-[-1.9px] [&>h2>span]:tracking-[-1.7px] min-[701px]:[&>h2>span]:tracking-[-3px] [&>p:first-of-type]:mb-[17px] [&>p:first-of-type]:justify-center [&>p:first-of-type]:text-[9px] [&>p:first-of-type]:text-[#8a8077] [&>p:last-of-type]:mt-[18px] [&>p:last-of-type]:text-sm [&>p:last-of-type]:text-[#77716b] [&>svg]:mx-auto [&>svg]:mb-[17px] [&>svg]:text-[#6650b8]">
                <Sparkles size={32} strokeWidth={1.4} />
                <p className="flex items-center gap-2 text-[10px] leading-normal font-semibold tracking-[1.65px]">
                    YOUR CALENDAR HAS POTENTIAL
                </p>
                <h2>
                    Make your next
                    <br />
                    <span className="font-serif font-normal tracking-[-3px] text-[#6650b8] italic">
                        “remember when”
                    </span>{' '}
                    happen.
                </h2>
                <p>Good experiences start with a simple yes.</p>
                <Link
                    href={actionHref}
                    className="inline-flex items-center justify-center gap-3.5 rounded-md bg-[#242322] px-[21px] py-3.5 text-sm leading-[1.3] font-semibold text-white transition-[background,transform] duration-150 hover:-translate-y-0.5 hover:bg-[#45413d] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                    {authenticated
                        ? 'Open your dashboard'
                        : 'Create your free account'}{' '}
                    <ArrowRight size={17} />
                </Link>
                {!authenticated && (
                    <span className="mt-4 block text-[11px] text-[#8d877f] [&_a]:text-[#242322] [&_a]:underline! [&_a]:underline-offset-3">
                        Already part of the plan?{' '}
                        <Link href={login()}>Log in</Link>
                    </span>
                )}
            </section>
            <footer className="mx-auto flex w-[calc(100%_-_40px)] max-w-[1160px] flex-wrap items-center gap-4 border-t border-[#e6e1d9] py-6 min-[701px]:w-[calc(100%_-_64px)] min-[701px]:flex-nowrap min-[701px]:gap-[23px] min-[701px]:py-7 min-[1001px]:w-[calc(100%_-_96px)] [&>a:first-child]:text-lg [&>a:first-child>span]:h-[26px] [&>a:first-child>span]:w-6 [&>a:first-child>span]:text-[22px] [&>a:last-child]:w-full [&>a:last-child]:text-[10px] [&>a:last-child]:text-[#77716b] min-[701px]:[&>a:last-child]:w-auto [&>p]:hidden [&>p]:text-[11px] [&>p]:text-[#8d877f] min-[1001px]:[&>p]:block [&>span]:ml-auto [&>span]:text-[10px] [&>span]:text-[#8d877f]">
                <a
                    href="#"
                    className="inline-flex items-center gap-[9px] text-[23px] font-bold tracking-[-1px] text-[#242322]"
                >
                    <span className="grid h-[34px] w-[31px] -rotate-7 place-items-center rounded-[3px] bg-[#242322] font-serif text-[29px] font-bold text-white italic">
                        a
                    </span>{' '}
                    agendain.
                </a>
                <p>A place for plans that become memories.</p>
                <span>© {new Date().getFullYear()} Agendain</span>
                <a href="#">Back to top ↑</a>
            </footer>
        </>
    );
}
