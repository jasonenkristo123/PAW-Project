import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
export default function AuthLayout({
    title = '',
    description = '',
    variant,
    children,
}) {
    return (
        <AuthLayoutTemplate
            title={title}
            description={description}
            variant={variant}
        >
            {children}
        </AuthLayoutTemplate>
    );
}
