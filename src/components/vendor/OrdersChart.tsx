import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { useAdminDashboardChartsQuery } from '@/api/hooks/admin.hooks';
import { Loader2 } from 'lucide-react';

export function OrdersChart() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { data: chartsData, isLoading } = useAdminDashboardChartsQuery();

  const data = chartsData?.ordersBreakdown || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-card border border-border rounded-xl p-5 shadow-soft min-h-[360px] flex flex-col justify-between"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Orders Breakdown</h3>
        <p className="text-sm text-muted-foreground">Order status distribution</p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center h-[280px]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? 'hsl(222, 47%, 9%)' : 'hsl(0, 0%, 100%)',
                  border: `1px solid ${isDark ? 'hsl(217, 33%, 17%)' : 'hsl(214, 32%, 91%)'}`,
                  borderRadius: '8px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ color: isDark ? 'hsl(210, 40%, 98%)' : 'hsl(222, 47%, 11%)' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

