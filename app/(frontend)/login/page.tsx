import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="py-8">
      <Suspense
        fallback={
          <div className="mx-auto max-w-md animate-pulse rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="h-8 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
