import { Head, usePage } from '@inertiajs/react';
import { register } from '@/routes';
import { index as eventsIndex } from '@/routes/events';
import Navbar from '@/pages/landing-page/navbar';
import HeroSection from '@/pages/landing-page/hero-section';
import FeaturesSection from '@/pages/landing-page/features-section';
import HowItWorks from '@/pages/landing-page/how-it-works';
import Footer from '@/pages/landing-page/footer';

export default function Welcome() {
    const { auth } = usePage().props;
    const authenticated = Boolean(auth?.user);
    const actionHref = authenticated ? eventsIndex() : register();

    return (
        <div className="min-h-svh bg-agendain-white font-sans text-landing-ink [&_*]:box-border [&_a]:no-underline [&_a:focus-visible]:outline-3 [&_a:focus-visible]:outline-offset-5 [&_a:focus-visible]:outline-agendain-focus [&_button:focus-visible]:outline-3 [&_button:focus-visible]:outline-offset-5 [&_button:focus-visible]:outline-agendain-focus">
            <Head title="Agendain — Plan, discover, and book events">
                <meta
                    name="description"
                    content="Discover creative workshops, summits, and live indie sessions. Agendain helps you reserve seats and manage your bookings in one simple platform."
                />
            </Head>
            <a
                href="#main-content"
                className="absolute -top-20 left-[15px] z-10 rounded bg-landing-ink p-3 text-agendain-white focus:top-[15px]"
            >
                Skip to content
            </a>
            <Navbar />
            <main id="main-content">
                <HeroSection
                    actionHref={actionHref}
                    authenticated={authenticated}
                />
                <div className="mx-auto flex w-[calc(100%_-_40px)] max-w-[1160px] flex-col items-start gap-4 border-y border-landing-border py-[23px] min-[701px]:w-[calc(100%_-_64px)] min-[701px]:py-[26px] min-[1001px]:w-[calc(100%_-_96px)] min-[1001px]:flex-row min-[1001px]:items-center min-[1001px]:justify-between min-[1001px]:gap-[26px] [&>div]:flex [&>div]:w-full [&>div]:flex-wrap [&>div]:items-center [&>div]:gap-x-[17px] [&>div]:gap-y-2.5 [&>div]:text-xs [&>div]:font-medium min-[701px]:[&>div]:justify-between min-[701px]:[&>div]:gap-3 min-[701px]:[&>div]:text-[15px] min-[1001px]:[&>div]:w-auto min-[1001px]:[&>div]:gap-[25px] [&>p]:text-[9px] [&>p]:font-semibold [&>p]:tracking-[1.4px] [&>p]:text-landing-caption">
                    <p>FOR EVERY KIND OF CURIOUS.</p>
                    <div>
                        <span>Workshops</span>
                        <span className="text-base text-agendain-decoration min-[701px]:text-xl">
                            ✳
                        </span>
                        <span>Live music</span>
                        <span className="text-base text-agendain-decoration min-[701px]:text-xl">
                            ✳
                        </span>
                        <span>Big ideas</span>
                        <span className="text-base text-agendain-decoration min-[701px]:text-xl">
                            ✳
                        </span>
                        <span>New connections</span>
                    </div>
                </div>
                <FeaturesSection />
                <HowItWorks
                    actionHref={actionHref}
                    authenticated={authenticated}
                />
                <Footer actionHref={actionHref} authenticated={authenticated} />
            </main>
        </div>
    );
}
