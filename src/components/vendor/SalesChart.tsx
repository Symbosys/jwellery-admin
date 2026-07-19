import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { useAdminDashboardChartsQuery } from '@/api/hooks/admin.hooks';
import { Loader2 } from 'lucide-react';

export function SalesChart() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { data: chartsData, isLoading } = useAdminDashboardChartsQuery();

  const data = chartsData?.salesOverview || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-card border border-border rounded-xl p-5 shadow-soft min-h-[400px] flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Sales Overview</h3>
          <p className="text-sm text-muted-foreground">Monthly revenue performance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Sales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-info" />
            <span className="text-sm text-muted-foreground">Orders</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center h-[300px]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? 'hsl(217, 33%, 17%)' : 'hsl(214, 32%, 91%)'}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? 'hsl(215, 20%, 65%)' : 'hsl(215, 16%, 47%)', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? 'hsl(215, 20%, 65%)' : 'hsl(215, 16%, 47%)', fontSize: 12 }}
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? 'hsl(222, 47%, 9%)' : 'hsl(0, 0%, 100%)',
                  border: `1px solid ${isDark ? 'hsl(217, 33%, 17%)' : 'hsl(214, 32%, 91%)'}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                formatter={(value: any, name: string) => [
                  name === "sales" ? `₹${Number(value).toLocaleString()}` : value,
                  name === "sales" ? "Sales" : "Orders"
                ]}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(221, 83%, 53%)"
                strokeWidth={2}
                fill="url(#salesGradient)"
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="hsl(199, 89%, 48%)"
                strokeWidth={2}
                fill="url(#ordersGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

