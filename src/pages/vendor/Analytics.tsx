import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  TrendingUp, 
  TrendingDown,
  Truck,
  XCircle,
  Clock,
  Award,
  AlertTriangle,
  ShoppingBag,
  Eye,
  ShoppingCart
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  useAnalyticsOverviewQuery,
  usePerformanceChartQuery,
  useProductAnalyticsQuery
} from '@/api/hooks/analytics.hooks';

export default function Analytics() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [range, setRange] = useState<'7d' | '30d' | '12m'>('30d');

  // Queries
  const { data: overviewData, isLoading: isLoadingOverview } = useAnalyticsOverviewQuery({ range });
  const { data: performanceChartData, isLoading: isLoadingChart } = usePerformanceChartQuery({ range });
  const { data: productAnalyticsData, isLoading: isLoadingProducts } = useProductAnalyticsQuery({ limit: 5 });

  const metricsList = [
    { 
      label: 'Total Revenue', 
      value: overviewData ? `$${Number(overviewData.metrics.sales.value).toLocaleString()}` : '$0', 
      icon: TrendingUp,
      trend: overviewData?.metrics.sales.trend || 0, 
      color: 'text-primary',
      description: overviewData?.metrics.sales.description || 'Total revenue'
    },
    { 
      label: 'Total Orders', 
      value: overviewData?.metrics.orders.value || 0, 
      icon: ShoppingBag,
      trend: overviewData?.metrics.orders.trend || 0, 
      color: 'text-sky-500',
      description: overviewData?.metrics.orders.description || 'Orders count'
    },
    { 
      label: 'Overall Rating', 
      value: overviewData?.metrics.rating.value || '0.0', 
      icon: Star, 
      trend: overviewData?.metrics.rating.trend || 0, 
      color: 'text-warning',
      description: overviewData?.metrics.rating.description || 'No reviews yet'
    },
    { 
      label: 'On-Time Delivery', 
      value: overviewData?.metrics.delivery.value || '0%', 
      icon: Truck, 
      trend: overviewData?.metrics.delivery.trend || 0, 
      color: 'text-success',
      description: overviewData?.metrics.delivery.description || 'Target: 95%'
    },
    { 
      label: 'Cancellation Rate', 
      value: overviewData?.metrics.cancellation.value || '0%', 
      icon: XCircle, 
      trend: overviewData?.metrics.cancellation.trend || 0, 
      color: 'text-destructive',
      description: overviewData?.metrics.cancellation.description || 'Target: <2%'
    },
    { 
      label: 'Response Time', 
      value: overviewData?.metrics.responseTime.value || '0h', 
      icon: Clock, 
      trend: overviewData?.metrics.responseTime.trend || 0, 
      color: 'text-indigo-500',
      description: overviewData?.metrics.responseTime.description || 'Target: <4h'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Performance Analytics</h1>
          <p className="text-muted-foreground">Track your store's performance and ratings</p>
        </div>

        {/* Range Selector */}
        <div className="flex bg-muted border border-border p-1 rounded-lg">
          {(['7d', '30d', '12m'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                range === r 
                  ? "bg-background text-foreground shadow-sm font-bold" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '12 Months'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Seller Scorecard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border rounded-xl p-6 shadow-soft"
      >
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-6 h-6 text-primary animate-pulse" />
          <h2 className="text-lg font-semibold">Seller Scorecard</h2>
          <span className="badge-success bg-success/20 text-success border border-success/30 px-2 py-0.5 rounded-full text-xs font-semibold">
            Excellent
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Your seller rating is excellent! Maintain your performance to unlock premium benefits.
        </p>

        {isLoadingOverview ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-4 border border-border animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {metricsList.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.03 }}
                className="bg-card rounded-lg p-4 border border-border hover:border-primary/30 hover:shadow-soft transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className={cn("w-5 h-5", metric.color)} />
                  <div className={cn(
                    "flex items-center text-xs font-semibold",
                    metric.trend >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {metric.trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {metric.trend >= 0 ? '+' : ''}{metric.trend}%
                  </div>
                </div>
                <p className="text-2xl font-bold truncate">{metric.value}</p>
                <p className="text-sm text-muted-foreground truncate">{metric.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1 truncate">{metric.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Rating Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6 shadow-soft flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Rating Breakdown</h3>
                <p className="text-sm text-muted-foreground">Product reviews distribution</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-warning justify-end">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-2xl font-bold">
                    {overviewData?.metrics.rating.value || '4.7'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {overviewData?.totalReviews || '1,831'} reviews
                </p>
              </div>
            </div>

            {isLoadingOverview ? (
              <div className="space-y-4 py-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(overviewData?.ratingBreakdown || []).map((item) => (
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
            )}
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
            <p className="text-sm text-muted-foreground">Performance comparison over range</p>
          </div>

          <div className="h-[250px]">
            {isLoadingChart ? (
              <div className="w-full h-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground animate-pulse">Generating chart...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceChartData || []}>
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
                  <Bar dataKey="orders" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} name="Orders" />
                  <Bar dataKey="returns" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="Returns" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* Product Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-card border border-border rounded-xl p-6 shadow-soft"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Top Performing Products</h3>
            <p className="text-sm text-muted-foreground">Product engagement and performance metrics</p>
          </div>
        </div>

        {isLoadingProducts ? (
          <div className="space-y-3 py-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !productAnalyticsData || productAnalyticsData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No product analytics available yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs text-foreground uppercase border-b border-border bg-muted/20">
                <tr>
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 text-center font-semibold">Views</th>
                  <th className="py-3 px-4 text-center font-semibold">Add to Carts</th>
                  <th className="py-3 px-4 text-center font-semibold">Purchases</th>
                  <th className="py-3 px-4 text-right font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {productAnalyticsData.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3 font-medium text-foreground">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center text-xs">📦</span>
                        )}
                      </div>
                      <span className="truncate max-w-[200px] lg:max-w-[300px]" title={item.name}>{item.name}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/60 text-xs">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{item.views}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/60 text-xs">
                        <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{item.addToCarts}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted/60 text-xs">
                        <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{item.purchases}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-foreground font-semibold">
                      ${Number(item.revenue).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

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
                <p className="font-semibold text-foreground">Late Dispatch Warning</p>
                <p className="text-xs text-muted-foreground">3 orders were dispatched late this week</p>
              </div>
            </div>
            <button className="text-sm text-primary font-semibold hover:underline">View Orders</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-info/10 rounded-lg border border-info/20">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-info animate-pulse" />
              <div>
                <p className="font-semibold text-foreground">New Reviews Received</p>
                <p className="text-xs text-muted-foreground">12 new product reviews need your response</p>
              </div>
            </div>
            <button className="text-sm text-primary font-semibold hover:underline">View Reviews</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
