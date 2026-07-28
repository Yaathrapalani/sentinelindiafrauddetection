'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { MetricKey } from '@/types';
import { METRIC_DEFINITIONS, METRIC_CHART_COLOR } from '@/constants';

interface MetricBarChartProps {
  scores: Record<MetricKey, number>;
}

export function MetricBarChart({ scores }: MetricBarChartProps) {
  const metrics = (Object.keys(METRIC_DEFINITIONS) as MetricKey[]).filter(
    (m) => m !== 'overallRisk'
  );

  const data = metrics.map((key) => ({
    name: METRIC_DEFINITIONS[key].label,
    shortName: METRIC_DEFINITIONS[key].label.split(' ')[0],
    value: scores[key] ?? 50,
    key,
    fill: METRIC_CHART_COLOR[key],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="shortName"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            color: 'hsl(var(--card-foreground))',
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.key} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
