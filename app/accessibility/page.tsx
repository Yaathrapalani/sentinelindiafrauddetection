import { Metadata } from 'next';
import { Keyboard, Volume2, Eye, Zap, Touchpad, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Accessibility',
  description: 'Sentinel India is committed to WCAG 2.2 AA accessibility compliance.',
};

const FEATURES = [
  { icon: Keyboard, title: 'Keyboard Navigation', description: 'Full keyboard support with visible focus indicators and logical tab order.' },
  { icon: Volume2, title: 'Voice Narration', description: 'Optional voice narration for all assessment scenarios using the Web Speech API.' },
  { icon: Eye, title: 'Screen Reader Support', description: 'Semantic HTML with ARIA labels and roles for screen reader compatibility.' },
  { icon: Eye, title: 'High Contrast', description: 'Color ratios meeting WCAG AA standards. No information conveyed by color alone.' },
  { icon: Zap, title: 'Reduced Motion', description: 'Respects prefers-reduced-motion. Animations are disabled for users who request it.' },
  { icon: Touchpad, title: 'Large Touch Targets', description: 'All interactive elements meet the 44x44px minimum touch target requirement.' },
  { icon: Code, title: 'Semantic HTML', description: 'Proper heading hierarchy, landmarks, and form labels throughout the application.' },
];

export default function AccessibilityPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Accessibility
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Sentinel India is committed to WCAG 2.2 AA compliance. Digital safety
          education must be accessible to everyone — regardless of ability.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-3xl rounded-lg border border-accent/30 bg-accent/5 p-4">
        <p className="text-sm text-foreground">
          <strong>Commitment:</strong> We design for accessibility from the start, not as
          an afterthought. If you encounter a barrier, please report it through our feedback form.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-5xl">
        <h2 className="text-2xl font-bold text-foreground">Accessibility Features</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="h-full border-border shadow-sm">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <feature.icon className="h-6 w-6 text-accent" aria-hidden="true" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-2xl font-bold text-foreground">Standards We Follow</h2>
        <ul className="mt-4 space-y-3">
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
            <span className="text-muted-foreground">WCAG 2.2 Level AA — Web Content Accessibility Guidelines</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
            <span className="text-muted-foreground">ARIA specification for roles, states, and properties</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
            <span className="text-muted-foreground">Section 508 compliance for U.S. federal standards</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
            <span className="text-muted-foreground">Testing with NVDA, VoiceOver, and keyboard-only navigation</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
