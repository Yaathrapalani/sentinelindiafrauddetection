'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Brain,
  Target,
  Volume2,
  Languages,
  BarChart3,
  ArrowRight,
  Lock,
  Users,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ROUTES } from '@/constants';
import { useSia } from '@/components/providers/sia-provider';

const FEATURES = [
  {
    icon: Target,
    title: 'Adaptive Assessment',
    description: 'Scenarios adapt to your age, occupation, and digital habits for relevant evaluation.',
  },
  {
    icon: Brain,
    title: 'Behavioral Metrics',
    description: '10 hidden metrics measure your fraud susceptibility across multiple dimensions.',
  },
  {
    icon: Shield,
    title: 'Digital Safety Profile',
    description: 'Receive a personalized safety profile with actionable recommendations.',
  },
  {
    icon: Volume2,
    title: 'Voice Support',
    description: 'Optional voice narration for accessibility and multilingual support.',
  },
  {
    icon: Languages,
    title: 'Multilingual Ready',
    description: 'Architecture supports English, Hindi, Tamil, Kannada, and Telugu.',
  },
  {
    icon: BarChart3,
    title: 'Research Quality Data',
    description: 'Anonymous behavioral data collection for academic fraud research.',
  },
];

const STATS = [
  { value: '10+', label: 'Behavioral Metrics' },
  { value: '12', label: 'Assessment Scenarios' },
  { value: '5', label: 'Languages Supported' },
  { value: '100%', label: 'Anonymous' },
];

const SCAM_TYPES = [
  { icon: AlertTriangle, label: 'Phishing', color: 'text-warning' },
  { icon: AlertTriangle, label: 'Investment Fraud', color: 'text-destructive' },
  { icon: AlertTriangle, label: 'Digital Arrest', color: 'text-destructive' },
  { icon: AlertTriangle, label: 'Courier Scams', color: 'text-warning' },
  { icon: AlertTriangle, label: 'Social Engineering', color: 'text-warning' },
  { icon: AlertTriangle, label: 'Recovery Scams', color: 'text-destructive' },
];

export default function HomePage() {
  const sia = useSia();
  const hasGreeted = useRef(false);

  useEffect(() => {
    if (hasGreeted.current) return;
    // Only attempt greeting after enable + interaction (autoplay policy)
    if (!sia.isEnabled || !sia.hasInteracted || sia.isMuted) return;
    hasGreeted.current = true;
    const timer = setTimeout(() => {
      sia.narrateGreeting();
    }, 500);
    return () => clearTimeout(timer);
  }, [sia]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/40 to-background">
        <div className="absolute inset-0 bg-gradient-radial from-accent/5 via-transparent to-transparent" aria-hidden="true" />
        <div className="container relative mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-xs">
              <Shield className="h-4 w-4 text-accent" />
              Behavioral Fraud Prevention Research
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your Shield Against{' '}
              <span className="text-accent">Digital Fraud</span>
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
              An AI-assisted behavioral research platform that helps you identify,
              understand, and resist digital fraud. Built for India&apos;s digital landscape.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href={ROUTES.ASSESSMENT}>
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Safety Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={ROUTES.ABOUT}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore the Platform
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-foreground sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scam Types Banner */}
      <section className="bg-secondary/30 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Scams We Help You Identify
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Based on real fraud patterns reported across India
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {SCAM_TYPES.map((scam, i) => (
              <motion.div
                key={scam.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-xs"
              >
                <scam.icon className={`h-4 w-4 ${scam.color}`} aria-hidden="true" />
                {scam.label}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How Sentinel India Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A research-grade behavioral assessment platform designed for
              India&apos;s digital landscape.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="h-full border-border shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                      <feature.icon className="h-6 w-6 text-accent" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Privacy Section */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                <Lock className="h-7 w-7 text-success" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold">100% Anonymous</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No names, emails, or phone numbers. Only behavioral research data.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <Users className="h-7 w-7 text-accent" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold">Research Grade</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Data collected meets academic research quality standards.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning/10">
                <CheckCircle2 className="h-7 w-7 text-warning" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold">WCAG 2.2 AA</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Full accessibility compliance with keyboard, screen reader, and voice support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-br from-primary to-primary/80 px-8 py-16 text-center shadow-xl"
          >
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Ready to Test Your Digital Safety?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Join thousands of participants in India&apos;s largest behavioral
              fraud research study. It takes 10 minutes.
            </p>
            <Link href={ROUTES.ASSESSMENT} className="mt-8 inline-block">
              <Button size="lg" variant="secondary">
                Begin Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
