import { Metadata } from 'next';
import { Target, Eye, Shield, Users, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Sentinel India — our mission, research goals, and commitment to privacy.',
};

const RESEARCH_GOALS = [
  'Understand behavioral patterns that lead to fraud susceptibility',
  'Develop adaptive assessment tools for diverse demographics',
  'Create data-driven fraud prevention education materials',
  'Build the first large-scale Indian digital fraud behavioral dataset',
];

const VALUES = [
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'All participation is anonymous. We collect only research-relevant behavioral data — no personally identifiable information is stored.',
  },
  {
    icon: Target,
    title: 'Research Driven',
    description: 'Every design decision is guided by academic research standards and the goal of producing publishable behavioral data.',
  },
  {
    icon: Eye,
    title: 'Accessibility',
    description: 'Built to WCAG 2.2 AA standards with voice narration, keyboard navigation, and screen reader support.',
  },
  {
    icon: Users,
    title: 'Inclusive Design',
    description: 'Scenarios reflect real fraud patterns across Indian demographics — from students to retirees, urban to rural.',
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          About Sentinel India
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Sentinel India is a behavioral research and education platform dedicated to
          understanding how Indians interact with digital fraud. We collect research-quality
          behavioral data to build better fraud prevention tools.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-5xl">
        <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
        <p className="mt-3 text-muted-foreground">
          Digital fraud in India has reached epidemic proportions. From &quot;digital arrest&quot;
          scams to fake investment schemes, millions of Indians lose money and trust every year.
          Sentinel India exists to understand the behavioral patterns behind fraud susceptibility
          and build data-driven tools to help people resist manipulation.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-5xl">
        <h2 className="text-2xl font-bold text-foreground">Research Goals</h2>
        <ul className="mt-4 space-y-3">
          {RESEARCH_GOALS.map((goal, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
              <span className="text-muted-foreground">{goal}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-16 max-w-5xl">
        <h2 className="text-2xl font-bold text-foreground">Our Values</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {VALUES.map((value) => (
            <Card key={value.title} className="h-full border-border shadow-sm">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <value.icon className="h-6 w-6 text-accent" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {value.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-5xl">
        <div className="rounded-2xl border border-border bg-secondary/30 p-8">
          <div className="flex items-start gap-4">
            <Database className="h-8 w-8 flex-shrink-0 text-accent" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Data &amp; Research Access</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Aggregated, non-identifiable data from this platform may be shared in academic
                research publications. Researchers interested in accessing the dataset should
                contact the Sentinel India research team. All data sharing follows strict
                ethical guidelines and contains no personally identifiable information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
