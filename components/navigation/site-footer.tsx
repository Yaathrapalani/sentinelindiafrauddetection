import Link from 'next/link';
import { Shield, Heart } from 'lucide-react';
import { ROUTES } from '@/constants';

const FOOTER_LINKS = {
  Platform: [
    { href: ROUTES.ASSESSMENT, label: 'Assessment' },
    { href: ROUTES.DASHBOARD, label: 'Dashboard' },
    { href: ROUTES.ABOUT, label: 'About' },
  ],
  Resources: [
    { href: ROUTES.PRIVACY, label: 'Privacy Policy' },
    { href: ROUTES.ACCESSIBILITY, label: 'Accessibility' },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href={ROUTES.HOME} className="flex items-center gap-2 font-semibold text-primary">
              <Shield className="h-5 w-5 text-accent" aria-hidden="true" />
              <span className="text-base tracking-tight">Sentinel India</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              An AI-assisted behavioral research and education platform that helps users
              identify, understand, and resist digital fraud.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-foreground">{section}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Sentinel India. Research data collected anonymously.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Built with <Heart className="h-3 w-3 text-destructive" aria-hidden="true" /> for a safer digital India
          </p>
        </div>
      </div>
    </footer>
  );
}
