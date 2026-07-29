'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, TrendingUp, AlertTriangle, CheckCircle2, ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MetricRadarChart } from '@/components/charts/metric-radar-chart';
import { MetricBarChart } from '@/components/charts/metric-bar-chart';
import { SIAAssistant } from '@/components/sia/sia-assistant';
import { useSIAOrchestrator } from '@/hooks/use-sia-orchestrator';
import { getBehaviorScore, getPersonas, matchPersona } from '@/lib/services/api';
import { METRIC_DEFINITIONS, POSITIVE_METRICS, NEGATIVE_METRICS } from '@/constants';
import { getRiskColor, getRiskBgColor } from '@/lib/utils/helpers';
import type { BehaviorScore, Persona } from '@/types';
import { ROUTES } from '@/constants';

const TOTAL_STEPS = 5;

export default function ResultsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const participantId = params.get('participant');
  const [score, setScore] = useState<BehaviorScore | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedSteps, setRevealedSteps] = useState(0);

  const sia = useSIAOrchestrator({
    totalScenarios: 12,
  });

  // SIA results intro on mount
  useEffect(() => {
    if (!loading && score) {
      sia.introduceResults();
      // Sequential reveal with SIA narration
      const timers: ReturnType<typeof setTimeout>[] = [];
      for (let i = 0; i < TOTAL_STEPS; i++) {
        timers.push(
          setTimeout(() => {
            setRevealedSteps(i + 1);
            sia.revealNextResult(i);
          }, 2500 + i * 2000)
        );
      }
      return () => timers.forEach(clearTimeout);
    }
  }, [loading, score, sia]);

  useEffect(() => {
    if (!participantId) {
      setError('Missing participant ID');
      setLoading(false);
      return;
    }

    async function load() {
      const [scoreRes, personasRes] = await Promise.all([
        getBehaviorScore(participantId!),
        getPersonas(),
      ]);

      if (scoreRes.error) setError(scoreRes.error);
      if (personasRes.error) setError(personasRes.error);

      setScore(scoreRes.data);
      setPersonas(personasRes.data || []);
      setLoading(false);
    }

    load();
  }, [participantId]);

  const handleRetake = useCallback(() => {
    sia.sayGoodbye();
    setTimeout(() => router.push(ROUTES.ASSESSMENT), 1500);
  }, [router, sia]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-accent" />
          <p className="text-sm text-muted-foreground">Loading your results...</p>
        </div>
        <SIAAssistant />
      </div>
    );
  }

  if (error || !score) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold">Results Unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error || 'Could not load results.'}</p>
          <Button className="mt-6" onClick={() => router.push(ROUTES.ASSESSMENT)}>
            Retake Assessment
          </Button>
        </div>
        <SIAAssistant />
      </div>
    );
  }

  const persona = matchPersona(score.overallScore, personas);
  const strengths = POSITIVE_METRICS
    .map((k) => ({ key: k, score: score.scores[k] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const vulnerabilities = NEGATIVE_METRICS
    .filter((m) => m !== 'overallRisk')
    .map((k) => ({ key: k, score: score.scores[k] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your Digital Safety Profile
          </h1>
          <p className="mt-2 text-muted-foreground">
            Based on your assessment responses, here is your personalized fraud
            susceptibility analysis.
          </p>
        </motion.div>

        {/* Step 1: Overall Score Card */}
        <AnimatePresence>
          {revealedSteps >= 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`mt-8 rounded-2xl border p-8 ${getRiskBgColor(score.riskLevel)}`}
            >
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Safety Score</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-foreground">{score.overallScore}</span>
                    <span className="text-2xl text-muted-foreground">/ 100</span>
                  </div>
                  <Badge className={`mt-3 ${getRiskColor(score.riskLevel)}`} variant="secondary">
                    {score.riskLevel.charAt(0).toUpperCase() + score.riskLevel.slice(1)} Risk
                  </Badge>
                </div>
                {persona && (
                  <div className="mt-6 sm:mt-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Your Persona
                    </div>
                    <p className="mt-1 text-xl font-semibold text-foreground">{persona.name}</p>
                    <p className="mt-1 max-w-xs text-sm text-muted-foreground">{persona.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2: Charts */}
        <AnimatePresence>
          {revealedSteps >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Behavioral Metrics Radar</CardTitle>
                  <CardDescription>Your scores across all 9 behavioral dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  <MetricRadarChart scores={score.scores} />
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Metric Breakdown</CardTitle>
                  <CardDescription>Individual metric scores (0–100)</CardDescription>
                </CardHeader>
                <CardContent>
                  <MetricBarChart scores={score.scores} />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: Strengths */}
        <AnimatePresence>
          {revealedSteps >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mt-8 border-border shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <CardTitle className="text-lg">Your Strengths</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {strengths.map((s) => (
                    <div key={s.key} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
                      <div>
                        <p className="text-sm font-medium">{METRIC_DEFINITIONS[s.key].label}</p>
                        <p className="text-xs text-muted-foreground">{METRIC_DEFINITIONS[s.key].description}</p>
                      </div>
                      <span className="text-lg font-bold text-success">{s.score}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 4: Vulnerabilities */}
        <AnimatePresence>
          {revealedSteps >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mt-8 border-border shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <CardTitle className="text-lg">Areas for Improvement</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {vulnerabilities.map((v) => (
                    <div key={v.key} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
                      <div>
                        <p className="text-sm font-medium">{METRIC_DEFINITIONS[v.key].label}</p>
                        <p className="text-xs text-muted-foreground">{METRIC_DEFINITIONS[v.key].description}</p>
                      </div>
                      <span className="text-lg font-bold text-warning">{v.score}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 5: Recommendations */}
        <AnimatePresence>
          {revealedSteps >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mt-8 border-border shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    <CardTitle className="text-lg">Personalized Recommendations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {vulnerabilities.map((v) => (
                    <div key={v.key} className="rounded-lg border border-border bg-secondary/30 p-4">
                      <p className="text-sm font-semibold">{METRIC_DEFINITIONS[v.key].label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {METRIC_DEFINITIONS[v.key].direction === 'negative'
                          ? `Your score of ${v.score} indicates higher susceptibility. Practice pausing before acting under pressure and verify independently.`
                          : `Your score of ${v.score} can be improved. Focus on building this skill through awareness and practice.`}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions — only after all revealed */}
        {revealedSteps >= TOTAL_STEPS && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <Button variant="outline" onClick={() => router.push(ROUTES.HOME)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Button variant="outline" onClick={handleRetake}>
              <Shield className="mr-2 h-4 w-4" />
              Retake Assessment
            </Button>
            <Button onClick={() => router.push(ROUTES.DASHBOARD)}>
              <TrendingUp className="mr-2 h-4 w-4" />
              View Research Dashboard
            </Button>
          </motion.div>
        )}
      </div>
      <SIAAssistant />
    </div>
  );
}
