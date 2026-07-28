'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { RiskLevel } from '@/types';

interface RiskDistributionChartProps {
  distribution: Record<RiskLevel, number>;
}

const RISK_COLORS: Record<RiskLevel, string> = {
  low: 'hsl(var(--success))',
  moderate: 'hsl(var(--accent))',
  elevated: 'hsl(var(--warning))',
  high: 'hsl(var(--destructive))',
  critical: 'hsl(0 72% 40%)',
};

const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Low Risk',
  moderate: 'Moderate Risk',
  elevated: 'Elevated Risk',
  high: 'High Risk',
  critical: 'Critical Risk',
};

export function RiskDistributionChart({ distribution }: RiskDistributionChartProps) {
  const data = (Object.keys(distribution) as RiskLevel[])
    .map((level) => ({
      name: RISK_LABELS[level],
      value: distribution[level],
      level,
    }))
    .filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        No data available yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={40}
          paddingAngle={2}
        >
          {data.map((entry) => (
            <Cell key={entry.level} fill={RISK_COLORS[entry.level]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            color: 'hsl(var(--card-foreground))',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
