'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Lock,
  Mail,
  ShieldCheck,
  LogOut,
  Users,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Loader2,
  Download,
  Database,
  Activity,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase/client';
import { getAnalyticsSummary } from '@/lib/services/api';
import { METRIC_DEFINITIONS, RISK_LEVELS } from '@/constants';
import type { AnalyticsSummary, MetricKey, AdminUser, RiskLevel } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [recentParticipants, setRecentParticipants] = useState<
    { id: string; anonymous_id: string; age_bracket: string; occupation: string; created_at: string; completed_at: string | null }[]
  >([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          role: 'admin',
          displayName: data.user.email?.split('@')[0] || 'Admin',
          createdAt: data.user.created_at || new Date().toISOString(),
        });
      }
      setAuthChecking(false);
    })();
  }, []);

  const loadDashboardData = useCallback(async () => {
    setSummaryLoading(true);
    setParticipantsLoading(true);
    setSummaryError(null);

    const { data, error } = await getAnalyticsSummary();
    if (error) setSummaryError(error);
    setSummary(data);
    setSummaryLoading(false);

    const { data: participants } = await supabase
      .from('participants')
      .select('id, anonymous_id, age_bracket, occupation, created_at, completed_at')
      .order('created_at', { ascending: false })
      .limit(10);
    setRecentParticipants(participants || []);
    setParticipantsLoading(false);
  }, []);

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user, loadDashboardData]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    setAuthError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      setSigningIn(false);
      return;
    }

    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        role: 'admin',
        displayName: data.user.email?.split('@')[0] || 'Admin',
        createdAt: data.user.created_at || new Date().toISOString(),
      });
    }
    setSigningIn(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEmail('');
    setPassword('');
    router.refresh();
  };

  const exportCsv = () => {
    if (!summary) return;
    const rows = [
      ['Metric', 'Label', 'Average Score', 'Direction'],
      ...Object.entries(summary.metricAverages).map(([key, val]) => [
        key,
        METRIC_DEFINITIONS[key as MetricKey].label,
        String(val),
        METRIC_DEFINITIONS[key as MetricKey].direction,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authChecking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          <Card className="border-border shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-7 w-7 text-primary" aria-hidden="true" />
              </div>
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription>
                Researcher and administrator access for Sentinel India.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="researcher@sentinel.in"
                      className="pl-10"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                {authError && (
                  <p className="text-sm text-destructive" role="alert">
                    {authError}
                  </p>
                )}
                <Button type="submit" className="w-full" size="lg" disabled={signingIn}>
                  {signingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Admin access is restricted to authorized researchers and administrators.
                Contact the research team for access.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statCards = summary
    ? [
        { icon: Users, label: 'Total Participants', value: summary.totalParticipants },
        { icon: CheckCircle2, label: 'Completed Assessments', value: summary.completedAssessments },
        { icon: TrendingUp, label: 'Average Safety Score', value: summary.averageOverallScore },
      ]
    : [];

  const riskColors: Record<RiskLevel, string> = {
    low: 'text-success',
    moderate: 'text-accent',
    elevated: 'text-warning',
    high: 'text-destructive',
    critical: 'text-destructive',
  };

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{user.email}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={!summary}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        {summaryLoading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : summaryError ? (
          <Card className="mt-8 border-destructive/50">
            <CardContent className="flex items-center gap-3 p-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{summaryError}</p>
            </CardContent>
          </Card>
        ) : (
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
        )}

        {summary && !summaryLoading && (
          <>
            {/* Risk Distribution + Top Vulnerabilities */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Risk Distribution</CardTitle>
                  <CardDescription>Participants by risk level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {RISK_LEVELS.map((rl) => {
                      const count = summary.riskDistribution[rl.level as RiskLevel] || 0;
                      const pct = summary.totalParticipants > 0
                        ? Math.round((count / summary.totalParticipants) * 100)
                        : 0;
                      return (
                        <div key={rl.level}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{rl.label}</span>
                            <span className={riskColors[rl.level as RiskLevel]}>
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                            <motion.div
                              className="h-full rounded-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Top Vulnerabilities</CardTitle>
                  <CardDescription>Lowest average scores across participants</CardDescription>
                </CardHeader>
                <CardContent>
                  {summary.topVulnerabilities.length > 0 ? (
                    <div className="space-y-3">
                      {summary.topVulnerabilities.map((v, i) => (
                        <div key={v.metric} className="flex items-center gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {METRIC_DEFINITIONS[v.metric as MetricKey]?.label || v.metric}
                            </p>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full bg-destructive"
                                style={{ width: `${100 - v.averageScore}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-bold text-destructive">
                            {v.averageScore}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No vulnerability data yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Category Performance */}
            <Card className="mt-6 border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Category Performance</CardTitle>
                <CardDescription>
                  Average response safety by scam category (higher = safer choices)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Object.entries(summary.categoryPerformance).map(([cat, score]) => (
                    <div
                      key={cat}
                      className="rounded-lg border border-border bg-secondary/30 p-3 text-center"
                    >
                      <p className="text-xs font-medium capitalize text-muted-foreground">{cat}</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">{score}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Metric Averages */}
            <Card className="mt-6 border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Metric Averages</CardTitle>
                <CardDescription>All 10 behavioral metrics averaged across participants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {Object.entries(summary.metricAverages).map(([key, val]) => {
                    const def = METRIC_DEFINITIONS[key as MetricKey];
                    if (!def) return null;
                    return (
                      <div
                        key={key}
                        className="rounded-lg border border-border bg-secondary/30 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{def.label}</p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                def.direction === 'positive' ? 'text-success' : 'text-destructive'
                              }
                            >
                              {def.direction}
                            </Badge>
                            <span className="text-lg font-bold">{val}</span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{def.description}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Recent Participants */}
        <Card className="mt-6 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Participants</CardTitle>
            <CardDescription>Latest 10 participant records</CardDescription>
          </CardHeader>
          <CardContent>
            {participantsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : recentParticipants.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No participants yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Anonymous ID</th>
                      <th className="pb-2 pr-4 font-medium">Age</th>
                      <th className="pb-2 pr-4 font-medium">Occupation</th>
                      <th className="pb-2 pr-4 font-medium">Joined</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentParticipants.map((p) => (
                      <tr key={p.id} className="border-b border-border/50">
                        <td className="py-3 pr-4 font-mono text-xs">
                          {p.anonymous_id.slice(0, 16)}...
                        </td>
                        <td className="py-3 pr-4">{p.age_bracket}</td>
                        <td className="py-3 pr-4 capitalize">{p.occupation}</td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          {p.completed_at ? (
                            <Badge className="bg-success/10 text-success">Completed</Badge>
                          ) : (
                            <Badge variant="outline">In Progress</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Source Info */}
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Database className="h-3.5 w-3.5" />
          <span>
            Data source: Supabase PostgreSQL · Last updated:{' '}
            {summary ? new Date(summary.lastUpdated).toLocaleString() : '—'}
          </span>
          <Activity className="ml-2 h-3.5 w-3.5" />
          <span>Live research data</span>
        </div>
      </div>
    </div>
  );
}
