import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/context/ThemeContext';

const data = [
  { name: 'Jan', sales: 4000, orders: 240 },
  { name: 'Feb', sales: 3000, orders: 139 },
  { name: 'Mar', sales: 5000, orders: 380 },
  { name: 'Apr', sales: 2780, orders: 190 },
  { name: 'May', sales: 7890, orders: 480 },
  { name: 'Jun', sales: 8390, orders: 520 },
  { name: 'Jul', sales: 6490, orders: 410 },
];

export function SalesChart() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-card border border-border rounded-xl p-5 shadow-soft"
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
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? 'hsl(222, 47%, 9%)' : 'hsl(0, 0%, 100%)',
                border: `1px solid ${isDark ? 'hsl(217, 33%, 17%)' : 'hsl(214, 32%, 91%)'}`,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
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
    </motion.div>
  );
}
