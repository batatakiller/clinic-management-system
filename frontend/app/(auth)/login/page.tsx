import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-md flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Loading login…</p>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
