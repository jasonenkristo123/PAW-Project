import { Form, Head } from '@inertiajs/react';
import { ArrowRight, AtSign } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
/* @chisel-registration */
import { register } from '@/routes';
/* @end-chisel-registration */
import { store } from '@/routes/login';
import { request } from '@/routes/password';
/* @chisel-passkeys */
import PasskeyVerify from '@/components/passkey-verify';

const inputClassName =
    'h-12 rounded-xl border-agendain-border-input bg-agendain-white px-4 text-sm shadow-none placeholder:text-agendain-placeholder focus-visible:border-agendain-purple focus-visible:ring-agendain-purple/15';
const linkClassName =
    'rounded text-agendain-purple no-underline hover:text-agendain-purple-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-agendain-purple';

export default function Login({ status, canResetPassword }) {
    return (
        <>
            <Head title="Log in" />

            {status && (
                <div
                    role="status"
                    className="mb-5 text-center text-sm font-medium text-agendain-success"
                >
                    {status}
                </div>
            )}

            {/* @chisel-passkeys */}
            <div className="[&_button]:h-12 [&_button]:rounded-xl [&_button]:border-agendain-border-input [&_button]:shadow-none [&_button:hover]:bg-agendain-surface-soft">
                <PasskeyVerify />
            </div>
            {/* @end-chisel-passkeys */}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium"
                                >
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        autoComplete="email"
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

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-medium"
                                >
                                    Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
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

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        className="border-agendain-border-checkbox focus-visible:ring-agendain-purple/20 data-[state=checked]:border-agendain-purple data-[state=checked]:bg-agendain-purple"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-xs font-normal text-agendain-text-muted"
                                    >
                                        Remember me
                                    </Label>
                                </div>
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className={`${linkClassName} text-xs`}
                                    >
                                        Forgot password?
                                    </TextLink>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-12 w-full rounded-xl bg-agendain-purple text-sm font-medium text-agendain-white shadow-agendain-button hover:bg-agendain-purple-hover focus-visible:ring-agendain-purple/25"
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? <Spinner /> : null}
                                {processing ? 'Signing in...' : 'Sign in'}
                                {!processing && (
                                    <ArrowRight size={16} aria-hidden="true" />
                                )}
                            </Button>
                        </div>

                        {/* @chisel-registration */}
                        <div className="-mx-6 mt-8 px-6 py-6 text-center text-sm text-agendain-text-muted sm:-mx-9 sm:px-9">
                            Don't have an account?{' '}
                            <TextLink
                                href={register()}
                                className={`${linkClassName} font-medium`}
                            >
                                Sign up
                            </TextLink>
                        </div>
                        {/* @end-chisel-registration */}
                    </>
                )}
            </Form>
        </>
    );
}
Login.layout = {
    title: 'Welcome back',
    description: 'Sign in to Agendain and keep your plans together.',
    variant: 'agendain',
};
