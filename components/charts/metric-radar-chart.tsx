'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { MetricKey } from '@/types';
import { METRIC_DEFINITIONS } from '@/constants';

interface MetricRadarChartProps {
  scores: Record<MetricKey, number>;
  showAll?: boolean;
}

export function MetricRadarChart({ scores, showAll = true }: MetricRadarChartProps) {
  const metrics = showAll
    ? (Object.keys(METRIC_DEFINITIONS) as MetricKey[]).filter((m) => m !== 'overallRisk')
    : (Object.keys(METRIC_DEFINITIONS) as MetricKey[]).filter((m) => m !== 'overallRisk');

  const data = metrics.map((key) => ({
    metric: METRIC_DEFINITIONS[key].label,
    value: scores[key] ?? 50,
    key,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
        />
        <PolarRadiusAxis
          domain={[0, 100]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          stroke="hsl(var(--border))"
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="hsl(var(--accent))"
          fill="hsl(var(--accent))"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            color: 'hsl(var(--card-foreground))',
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
