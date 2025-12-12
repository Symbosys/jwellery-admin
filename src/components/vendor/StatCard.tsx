import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
}

export function StatCard({ title, value, change, icon: Icon, iconColor = "text-primary", delay = 0 }: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="stat-card"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold tracking-tight">{value}</p>
          
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isPositive && "text-success",
              isNegative && "text-destructive",
              !isPositive && !isNegative && "text-muted-foreground"
            )}>
              {isPositive && <TrendingUp className="w-4 h-4" />}
              {isNegative && <TrendingDown className="w-4 h-4" />}
              <span>{isPositive ? '+' : ''}{change}%</span>
              <span className="text-muted-foreground font-normal">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={cn("p-3 rounded-xl bg-primary/10", iconColor)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}
