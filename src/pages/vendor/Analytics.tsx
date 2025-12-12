import { motion } from 'framer-motion';
import { 
  Star, 
  TrendingUp, 
  TrendingDown,
  Truck,
  XCircle,
  Clock,
  Award,
  AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const performanceData = [
  { month: 'Jan', orders: 245, returns: 12 },
  { month: 'Feb', orders: 289, returns: 8 },
  { month: 'Mar', orders: 312, returns: 15 },
  { month: 'Apr', orders: 278, returns: 10 },
  { month: 'May', orders: 356, returns: 18 },
  { month: 'Jun', orders: 398, returns: 14 },
];

const ratingBreakdown = [
  { stars: 5, count: 1245, percentage: 68 },
  { stars: 4, count: 389, percentage: 21 },
  { stars: 3, count: 134, percentage: 7 },
  { stars: 2, count: 45, percentage: 3 },
  { stars: 1, count: 18, percentage: 1 },
];

const metrics = [
  { 
    label: 'Overall Rating', 
    value: '4.7', 
    icon: Star, 
    trend: 0.2, 
    color: 'text-warning',
    description: 'Based on 1,831 reviews'
  },
  { 
    label: 'On-Time Delivery', 
    value: '94%', 
    icon: Truck, 
    trend: 2.1, 
    color: 'text-success',
    description: 'Target: 95%'
  },
  { 
    label: 'Cancellation Rate', 
    value: '1.8%', 
    icon: XCircle, 
    trend: -0.5, 
    color: 'text-success',
    description: 'Target: <2%'
  },
  { 
    label: 'Response Time', 
    value: '2.4h', 
    icon: Clock, 
    trend: -0.3, 
    color: 'text-success',
    description: 'Target: <4h'
  },
];

export default function Analytics() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold">Performance Analytics</h1>
        <p className="text-muted-foreground">Track your store's performance and ratings</p>
      </motion.div>

      {/* Seller Scorecard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border rounded-xl p-6 shadow-soft"
      >
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-semibold">Seller Scorecard</h2>
          <span className="badge-success">Excellent</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Your seller rating is excellent! Maintain your performance to unlock premium benefits.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-card rounded-lg p-4 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={cn("w-5 h-5", metric.color)} />
                <div className={cn(
                  "flex items-center text-xs font-medium",
                  metric.trend > 0 ? "text-success" : "text-destructive"
                )}>
                  {metric.trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {metric.trend > 0 ? '+' : ''}{metric.trend}%
                </div>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Rating Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Rating Breakdown</h3>
              <p className="text-sm text-muted-foreground">Product reviews distribution</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-warning">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-2xl font-bold">4.7</span>
              </div>
              <p className="text-xs text-muted-foreground">1,831 reviews</p>
            </div>
          </div>

          <div className="space-y-3">
            {ratingBreakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{item.stars}</span>
                  <Star className="w-3 h-3 text-warning fill-warning" />
                </div>
                <div className="flex-1">
                  <Progress value={item.percentage} className="h-2" />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6 shadow-soft"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Orders vs Returns</h3>
            <p className="text-sm text-muted-foreground">Monthly performance comparison</p>
          </div>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDark ? 'hsl(217, 33%, 17%)' : 'hsl(214, 32%, 91%)'} 
                  vertical={false}
                />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? 'hsl(215, 20%, 65%)' : 'hsl(215, 16%, 47%)', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? 'hsl(215, 20%, 65%)' : 'hsl(215, 16%, 47%)', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? 'hsl(222, 47%, 9%)' : 'hsl(0, 0%, 100%)',
                    border: `1px solid ${isDark ? 'hsl(217, 33%, 17%)' : 'hsl(214, 32%, 91%)'}`,
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="orders" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returns" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-xl p-6 shadow-soft"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-semibold">Performance Alerts</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium">Late Dispatch Warning</p>
                <p className="text-sm text-muted-foreground">3 orders were dispatched late this week</p>
              </div>
            </div>
            <button className="text-sm text-primary font-medium hover:underline">View Orders</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-info/10 rounded-lg border border-info/20">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-info" />
              <div>
                <p className="font-medium">New Reviews Received</p>
                <p className="text-sm text-muted-foreground">12 new product reviews need your response</p>
              </div>
            </div>
            <button className="text-sm text-primary font-medium hover:underline">View Reviews</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
