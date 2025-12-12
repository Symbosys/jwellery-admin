import { motion } from 'framer-motion';
import { AlertTriangle, Package, Star, TrendingDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const alerts = [
  {
    id: 1,
    type: 'warning',
    icon: Package,
    title: 'Low Stock Alert',
    description: '5 products are running low on inventory',
    action: 'View Products',
  },
  {
    id: 2,
    type: 'info',
    icon: Star,
    title: 'New Reviews',
    description: '12 new product reviews need attention',
    action: 'View Reviews',
  },
  {
    id: 3,
    type: 'error',
    icon: TrendingDown,
    title: 'Performance Drop',
    description: 'Late dispatch rate increased to 8%',
    action: 'View Details',
  },
  {
    id: 4,
    type: 'warning',
    icon: AlertTriangle,
    title: 'Pending Approvals',
    description: '3 products awaiting admin approval',
    action: 'Check Status',
  },
];

const typeStyles = {
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
  info: 'bg-info/10 text-info border-info/20',
};

export function AlertsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-card border border-border rounded-xl p-5 shadow-soft"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Alerts & Insights</h3>
          <p className="text-sm text-muted-foreground">Important notifications</p>
        </div>
        <span className="badge-warning">4 Active</span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className={cn(
              "flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-soft",
              typeStyles[alert.type as keyof typeof typeStyles]
            )}
          >
            <div className="p-2 rounded-lg bg-background/50">
              <alert.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{alert.title}</p>
              <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
