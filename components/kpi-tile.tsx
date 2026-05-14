import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function KPITile({
  label,
  value,
  hint,
  icon,
  trend,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  // trend: porcentaje firmado (ej. 22.45 = +22.45%, -10.24 = -10.24%)
  trend?: number;
}) {
  const trendColor =
    trend == null
      ? 'text-muted-foreground'
      : trend >= 0
        ? 'text-success'
        : 'text-destructive';
  const TrendIcon = trend != null && trend < 0 ? ArrowDownRight : ArrowUpRight;

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-2xl font-bold leading-tight">{value}</p>
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          {trend != null && (
            <div className={cn('mt-1 inline-flex items-center gap-0.5 text-xs font-medium', trendColor)}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span>{Math.abs(trend).toFixed(2)}%</span>
            </div>
          )}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {icon}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
