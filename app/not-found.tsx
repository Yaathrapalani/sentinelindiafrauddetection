import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';
import { ROUTES } from '@/constants';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <Compass className="h-8 w-8 text-accent" aria-hidden="true" />
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-foreground">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Page Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href={ROUTES.HOME} className="mt-6 inline-block">
          <Button size="lg">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
