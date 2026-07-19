import { motion } from 'framer-motion';
import { AlertTriangle, Star, TrendingDown, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminDashboardAlertsQuery } from '@/api/hooks/admin.hooks';
import { Link } from 'react-router-dom';

const typeStyles = {
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
  info: 'bg-info/10 text-info border-info/20',
};

const iconMap = {
  warning: AlertTriangle,
  error: TrendingDown,
  info: Star,
};

const actionLinks: Record<string, string> = {
  'View Products': '/products',
  'View Reviews': '/reviews',
  'View Details': '/orders',
  'Check Status': '/products',
};

export function AlertsPanel() {
  const { data: alerts = [], isLoading } = useAdminDashboardAlertsQuery();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-card border border-border rounded-xl p-5 shadow-soft min-h-[380px] flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Alerts & Insights</h3>
          <p className="text-sm text-muted-foreground">Important notifications</p>
        </div>
        {!isLoading && (
          <span className="badge-warning">{alerts.length} Active</span>
        )}
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[250px]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[250px] text-muted-foreground text-sm">
          No alerts or performance drop detected.
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {alerts.map((alert, index) => {
            const Icon = iconMap[alert.type] || AlertTriangle;
            const targetLink = actionLinks[alert.action] || '/';
            return (
              <Link key={alert.id} to={targetLink} className="block">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-soft",
                    typeStyles[alert.type] || typeStyles.info
                  )}
                >
                  <div className="p-2 rounded-lg bg-background/50">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

