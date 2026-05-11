import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold">404 — Page not found</h2>
        <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Link href="/" className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Back to home
        </Link>
      </div>
    </div>
  );
}
