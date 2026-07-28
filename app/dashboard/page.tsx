'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RiskDistributionChart } from '@/components/charts/risk-distribution-chart';
import { MetricBarChart } from '@/components/charts/metric-bar-chart';
import { getAnalyticsSummary } from '@/lib/services/api';
import { METRIC_DEFINITIONS } from '@/constants';
import type { AnalyticsSummary, MetricKey } from '@/types';

export default function DashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await getAnalyticsSummary();
      if (error) setError(error);
      setSummary(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-2 h-5 w-96" />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold">Dashboard Unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || 'Could not load analytics data.'}
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: 'Total Participants', value: summary.totalParticipants },
    { icon: CheckCircle2, label: 'Completed Assessments', value: summary.completedAssessments },
    { icon: TrendingUp, label: 'Average Safety Score', value: summary.averageOverallScore },
  ];

  const metricScores = Object.entries(summary.metricAverages).reduce(
    (acc, [key, val]) => {
      acc[key as MetricKey] = val;
      return acc;
    },
    {} as Record<MetricKey, number>
  );

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Research Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Aggregated behavioral analytics from Sentinel India participants.
          </p>
        </motion.div>

        {/* Stat Cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                      <stat.icon className="h-6 w-6 text-accent" aria-hidden="true" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {summary.totalParticipants === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">No data available yet.</p>
            <p className="text-xs text-muted-foreground/60">
              Analytics will appear once participants complete assessments.
            </p>
          </div>
        ) : (
          <>
            {/* Charts */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Risk Distribution</CardTitle>
                  <CardDescription>Participants by risk level</CardDescription>
                </CardHeader>
                <CardContent>
                  <RiskDistributionChart distribution={summary.riskDistribution} />
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Average Metric Scores</CardTitle>
                  <CardDescription>Across all participants</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(metricScores).length > 0 ? (
                    <MetricBarChart scores={metricScores} />
                  ) : (
                    <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                      No metric data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Demographics */}
            <Card className="mt-6 border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Demographic Breakdown</CardTitle>
                <CardDescription>Participant distribution by age, occupation, and digital habits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-foreground">Age Groups</h4>
                    <div className="space-y-2">
                      {Object.entries(summary.demographicBreakdown.ageBracket).map(([key, count]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-foreground">Occupations</h4>
                    <div className="space-y-2">
                      {Object.entries(summary.demographicBreakdown.occupation).map(([key, count]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="capitalize text-muted-foreground">{key}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-foreground">Digital Habits</h4>
                    <div className="space-y-2">
                      {Object.entries(summary.demographicBreakdown.digitalHabitLevel).map(([key, count]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="capitalize text-muted-foreground">{key}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metric Definitions */}
            <Card className="mt-6 border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Behavioral Metrics Reference</CardTitle>
                <CardDescription>The 10 hidden metrics measured in every assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(Object.keys(METRIC_DEFINITIONS) as MetricKey[]).map((key) => (
                    <div key={key} className="rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{METRIC_DEFINITIONS[key].label}</p>
                        <span className={`text-2xs ${METRIC_DEFINITIONS[key].direction === 'positive' ? 'text-success' : 'text-destructive'}`}>
                          {METRIC_DEFINITIONS[key].direction === 'positive' ? 'Positive' : 'Negative'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{METRIC_DEFINITIONS[key].description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
