import { Metadata } from 'next';
import { Lock, Database, Shield, Clock, Eye, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Sentinel India collects, uses, and protects your anonymous research data.',
};

const SECTIONS = [
  {
    icon: Database,
    title: 'What We Collect',
    description:
      'We collect anonymous behavioral data including: age bracket, occupation, digital usage level, assessment responses, response timing, and confidence levels. We do NOT collect names, emails, phone numbers, or any personally identifiable information.',
  },
  {
    icon: Shield,
    title: 'How We Use Data',
    description:
      'Your anonymous data is used exclusively for academic research on digital fraud behavior patterns in India. Aggregated, non-identifiable data may be shared in research publications.',
  },
  {
    icon: Clock,
    title: 'Data Retention',
    description:
      'Anonymous behavioral data is retained indefinitely for longitudinal research. You can request data deletion at any time by contacting our research team.',
  },
  {
    icon: Lock,
    title: 'Data Security',
    description:
      'All data is encrypted in transit and at rest. Access is restricted to authorized researchers. We follow OWASP security principles and conduct regular security reviews.',
  },
  {
    icon: Eye,
    title: 'Your Rights',
    description:
      'You have the right to know what data we collect, request deletion of your data, and withdraw from the research at any time. Since data is anonymous, we cannot identify individual participants after submission.',
  },
  {
    icon: FileText,
    title: 'Research Ethics',
    description:
      'This study follows institutional research ethics guidelines. All data collection is voluntary with informed consent. The research protocol is designed to minimize any risk to participants.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          How we collect, use, and protect your data. Sentinel India is designed
          with privacy as the foundation — not an afterthought.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-3xl rounded-lg border border-accent/30 bg-accent/5 p-4">
        <p className="text-sm text-foreground">
          <strong>Summary:</strong> We collect only anonymous behavioral data for research.
          No names, emails, phone numbers, or personally identifiable information are stored.
          All participation is voluntary with informed consent.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-5xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {SECTIONS.map((section) => (
            <Card key={section.title} className="h-full border-border shadow-sm">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <section.icon className="h-6 w-6 text-accent" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {section.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <p className="text-sm text-muted-foreground">
          For privacy-related questions or data deletion requests, please contact our
          research team through the feedback form. This privacy policy may be updated
          periodically; the date below reflects the last update.
        </p>
        <p className="mt-4 text-xs text-muted-foreground/60">
          Last updated: 28 July 2026
        </p>
      </div>
    </div>
  );
}
