import { Form, Head } from '@inertiajs/react';
import { ArrowRight, AtSign, ContactRound } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
const inputClassName =
    'h-11 rounded-xl border-agendain-border-input bg-agendain-white px-4 text-sm shadow-none placeholder:text-agendain-placeholder focus-visible:border-agendain-purple focus-visible:ring-agendain-purple/15';
const linkClassName =
    'rounded text-agendain-purple no-underline hover:text-agendain-purple-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-agendain-purple';

export default function Register({ passwordRules }) {
    return (
        <>
            <Head title="Create your account" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Jane Doe"
                                        aria-invalid={Boolean(errors.name)}
                                        aria-describedby={
                                            errors.name
                                                ? 'name-error'
                                                : undefined
                                        }
                                        className={`${inputClassName} pr-11`}
                                    />
                                    <ContactRound
                                        size={18}
                                        aria-hidden="true"
                                        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-agendain-icon-muted"
                                    />
                                </div>
                                <InputError
                                    id="name-error"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="jane@example.com"
                                        aria-invalid={Boolean(errors.email)}
                                        aria-describedby={
                                            errors.email
                                                ? 'email-error'
                                                : undefined
                                        }
                                        className={`${inputClassName} pr-11`}
                                    />
                                    <AtSign
                                        size={18}
                                        aria-hidden="true"
                                        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-agendain-icon-muted"
                                    />
                                </div>
                                <InputError
                                    id="email-error"
                                    message={errors.email}
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Create a strong password (min. 8 characters)"
                                    passwordrules={passwordRules}
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={
                                        errors.password
                                            ? 'password-error'
                                            : undefined
                                    }
                                    className={inputClassName}
                                />
                                <InputError
                                    id="password-error"
                                    message={errors.password}
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password_confirmation">
                                    Confirm Password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Repeat your password"
                                    passwordrules={passwordRules}
                                    aria-invalid={Boolean(
                                        errors.password_confirmation,
                                    )}
                                    aria-describedby={
                                        errors.password_confirmation
                                            ? 'password_confirmation-error'
                                            : undefined
                                    }
                                    className={inputClassName}
                                />
                                <InputError
                                    id="password_confirmation-error"
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <p className="mx-auto mt-2 max-w-[330px] text-center text-xs leading-relaxed text-agendain-text">
                                By signing up, you agree to Agendain’s{' '}
                                <span className="text-agendain-purple">
                                    Terms of Service
                                </span>{' '}
                                and{' '}
                                <span className="text-agendain-purple">
                                    Privacy Policy
                                </span>
                                .
                            </p>

                            <Button
                                type="submit"
                                className="h-11 w-full rounded-xl bg-agendain-purple text-sm font-medium text-agendain-white shadow-agendain-button hover:bg-agendain-purple-hover focus-visible:ring-agendain-purple/25"
                                disabled={processing}
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                {processing
                                    ? 'Creating account...'
                                    : 'Create Account'}
                                {!processing && (
                                    <ArrowRight size={16} aria-hidden="true" />
                                )}
                            </Button>
                        </div>

                        <div className="-mx-6 mt-7 px-6 py-6 text-center text-sm text-agendain-text-muted sm:-mx-9 sm:px-9">
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className={linkClassName}
                            >
                                Sign in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
Register.layout = {
    title: 'Create your account',
    description: 'Join Agendain and start discovering events.',
    variant: 'agendain-register',
};
