type Props = {
  success?: string | null;
  error?: string | null;
};

export function FlashMessage({ success, error }: Props) {
  if (success) {
    return (
      <div
        role="status"
        className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100"
      >
        {success}
      </div>
    );
  }
  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/60 dark:text-red-100"
      >
        {error}
      </div>
    );
  }
  return null;
}
