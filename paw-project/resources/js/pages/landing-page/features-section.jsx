import { ArrowUpRight, CalendarDays, Compass, Ticket } from 'lucide-react';

const features = [
    {
        number: '01',
        icon: Compass,
        title: 'Follow your curiosity.',
        description:
            'A new skill, a live performance, a conversation that stays with you. Make space for experiences beyond your everyday.',
    },
    {
        number: '02',
        icon: Ticket,
        title: 'Make it a real plan.',
        description:
            'Find an event that feels right, check the details, and book your place. Spend less time organizing and more time looking forward to it.',
    },
    {
        number: '03',
        icon: CalendarDays,
        title: 'Keep it all together.',
        description:
            'Your upcoming experiences and booking details, in one place. A simpler way to keep track of what’s next.',
    },
];

export default function FeaturesSection() {
    return (
        <section
            id="why-agendain"
            className="mx-auto w-[calc(100%_-_40px)] max-w-[1160px] scroll-mt-[30px] py-[60px] min-[701px]:w-[calc(100%_-_64px)] min-[701px]:py-[100px] min-[1001px]:w-[calc(100%_-_96px)]"
        >
            <div className="grid grid-cols-1 gap-[18px] min-[701px]:grid-cols-2 min-[701px]:gap-x-[70px] min-[701px]:gap-y-0 [&>h2]:text-[clamp(32px,4vw,46px)] [&>h2]:leading-[1.15] [&>h2]:font-semibold [&>h2]:tracking-[-1.9px] [&>p:first-child]:col-span-full [&>p:first-child]:text-landing-eyebrow min-[701px]:[&>p:first-child]:mb-[15px] [&>p:last-child]:self-end [&>p:last-child]:pb-1.5 [&>p:last-child]:text-[13px] [&>p:last-child]:leading-[1.9] [&>p:last-child]:text-landing-text-muted min-[701px]:[&>p:last-child]:text-sm">
                <p className="flex items-center gap-2 text-[10px] leading-normal font-semibold tracking-[1.65px]">
                    MAKE ROOM FOR MORE
                </p>
                <h2>
                    Big experiences.
                    <br />
                    Little effort.
                </h2>
                <p>
                    Life is better with something to look forward to.
                    <br />
                    We help you get from “that looks interesting” to “I’ll be
                    there.”
                </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-7 min-[701px]:mt-[46px] min-[701px]:grid-cols-3 min-[701px]:gap-[25px] min-[1001px]:gap-[45px]">
                {features.map(({ number, icon: Icon, title, description }) => (
                    <article
                        className="border-t border-landing-border-feature pt-[23px] [&>h3]:mb-3 [&>h3]:text-[19px] [&>h3]:font-semibold [&>h3]:tracking-[-0.5px] [&>p]:text-[13px] [&>p]:leading-[1.85] [&>p]:text-landing-text-muted"
                        key={number}
                    >
                        <div className="mb-[18px] flex items-center justify-between min-[701px]:mb-[26px] [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span]:text-[10px] [&>span]:text-landing-label [&>svg]:text-agendain-purple-muted">
                            <Icon size={30} strokeWidth={1.5} />
                            <span>
                                {number} <ArrowUpRight size={15} />
                            </span>
                        </div>
                        <h3>{title}</h3>
                        <p>{description}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
