export default function DashboardRouteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Auth protection is handled inside each page's DashboardLayout component
    return <>{children}</>;
}
