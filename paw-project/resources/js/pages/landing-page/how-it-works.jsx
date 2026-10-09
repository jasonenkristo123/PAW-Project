import { ArrowRight, Check, PencilLine } from 'lucide-react';
import { Link } from '@inertiajs/react';

const steps = [
    ['Make yourself at home', 'Create an account to unlock your event space.'],
    [
        'Find your kind of thing',
        'Sign in and explore events that match your interests.',
    ],
    [
        'Book it. Be there.',
        'Reserve your place and manage your bookings from your account.',
    ],
];

export default function HowItWorks({ actionHref, authenticated }) {
    return (
        <section
            id="how-it-works"
            className="bg-landing-section py-[55px] min-[701px]:py-20"
        >
            <div className="mx-auto grid w-[calc(100%_-_40px)] max-w-[1160px] grid-cols-1 items-center gap-[50px] min-[701px]:w-[calc(100%_-_64px)] min-[701px]:grid-cols-2 min-[701px]:gap-[55px] min-[1001px]:w-[calc(100%_-_96px)] min-[1001px]:gap-[110px]">
                <div
                    className="relative mx-auto w-[calc(100%_-_12px)] max-w-[420px] -rotate-3 rounded-[3px] border border-paper-border bg-paper-surface bg-[repeating-linear-gradient(transparent_0_41px,var(--color-paper-rule)_42px_43px)] pt-[35px] pr-[22px] pb-[38px] pl-12 shadow-paper min-[701px]:w-full min-[701px]:max-w-none min-[1001px]:pr-[34px] min-[1001px]:pl-[58px] [&_div>svg]:text-agendain-purple-muted [&>div:not(:first-child)]:flex [&>div:not(:first-child)]:min-h-[43px] [&>div:not(:first-child)]:items-center [&>div:not(:first-child)]:gap-[13px] [&>div:not(:first-child)]:text-[15px] min-[701px]:[&>div:not(:first-child)]:text-[13px] min-[1001px]:[&>div:not(:first-child)]:text-base [&>p]:mb-[22px] [&>p]:text-[25px] [&>p]:font-semibold [&>p]:tracking-[-1px] min-[1001px]:[&>p]:text-[29px] [&>svg]:mb-5"
                    aria-hidden="true"
                >
                    <div className="absolute inset-y-0 left-[38px] w-px bg-paper-margin" />
                    <PencilLine size={31} strokeWidth={1.5} />
                    <p>The good plans list</p>
                    <div>
                        <Check size={21} /> Learn something new
                    </div>
                    <div>
                        <Check size={21} /> Meet interesting people
                    </div>
                    <div>
                        <Check size={21} /> Try something different
                    </div>
                    <div className="[&>span]:size-[19px] [&>span]:rounded-[3px] [&>span]:border-[1.5px] [&>span]:border-paper-checkbox">
                        <span /> Make a memory
                    </div>
                    <span className="mt-8 block -rotate-4 font-serif text-[22px] text-agendain-purple-muted italic">
                        You should be there. ↗
                    </span>
                </div>
                <div className="[&>h2]:text-[35px] [&>h2]:leading-[1.15] [&>h2]:font-semibold [&>h2]:tracking-[-1.9px] [&>p]:mb-[15px] [&>p]:text-[9px] [&>p]:text-landing-eyebrow">
                    <p className="flex items-center gap-2 text-[10px] leading-normal font-semibold tracking-[1.65px]">
                        FROM MAYBE TO SEE YOU THERE
                    </p>
                    <h2>
                        Your next adventure,
                        <br />
                        in three small steps.
                    </h2>
                    <ol className="my-[30px] grid list-none gap-[22px] p-0 [&_h3]:mb-[5px] [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:leading-[1.7] [&_p]:text-landing-text-muted [&>li]:flex [&>li]:gap-[15px]">
                        {steps.map(([title, description], index) => (
                            <li key={title}>
                                <span className="grid size-[27px] shrink-0 place-items-center rounded-full border border-paper-step-border text-[11px]">
                                    {index + 1}
                                </span>
                                <div>
                                    <h3>{title}</h3>
                                    <p>{description}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                    <Link
                        href={actionHref}
                        className="inline-flex items-center gap-[7px] text-[13px] font-semibold text-landing-ink hover:text-agendain-purple-muted"
                    >
                        {authenticated
                            ? 'Go to your dashboard'
                            : 'Let’s make a plan'}{' '}
                        <ArrowRight size={17} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
