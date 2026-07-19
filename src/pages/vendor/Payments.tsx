import { motion } from 'framer-motion';
import {
  DollarSign,
  CreditCard,
  Clock,
  Download,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  FileText
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { useAdminPaymentsOverviewQuery, useAdminTransactionsQuery } from '@/api/hooks/admin.hooks';

export default function Payments() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { data: overviewData, isLoading: isLoadingOverview } = useAdminPaymentsOverviewQuery();
  const { data: transactionsData, isLoading: isLoadingTransactions } = useAdminTransactionsQuery({ limit: 10 });

  const getIcon = (label: string) => {
    switch (label) {
      case 'Total Earnings': return DollarSign;
      case 'Pending Payout': return Clock;
      case 'This Month': return TrendingUp;
      case 'Completed Payouts': return Wallet;
      default: return DollarSign;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Manage earnings and settlements</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Button className="gap-2">
            <CreditCard className="w-4 h-4" />
            Request Payout
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      {isLoadingOverview ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(overviewData?.stats || []).map((stat, index) => {
            const Icon = getIcon(stat.label);
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="stat-card"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    {stat.change !== null && stat.change !== undefined && (
                      <p className={cn(
                        "text-sm flex items-center gap-1 mt-1",
                        stat.change >= 0 ? "text-success" : "text-destructive"
                      )}>
                        <TrendingUp className="w-3 h-3" />
                        {stat.change >= 0 ? '+' : ''}{stat.change}%
                      </p>
                    )}
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Earnings Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl p-6 shadow-soft"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Earnings Overview</h3>
            <p className="text-sm text-muted-foreground">Monthly earnings trend</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">6 Months</Button>
            <Button variant="ghost" size="sm">1 Year</Button>
          </div>
        </div>

        <div className="h-[300px]">
          {isLoadingOverview ? (
            <div className="w-full h-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground animate-pulse">Generating chart...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overviewData?.earningsData || []}>
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? 'hsl(222, 47%, 9%)' : 'hsl(0, 0%, 100%)',
                    border: `1px solid ${isDark ? 'hsl(217, 33%, 17%)' : 'hsl(214, 32%, 91%)'}`,
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Earnings']}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={2}
                  fill="url(#earningsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-xl shadow-soft overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <p className="text-sm text-muted-foreground">Your payment history</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="w-4 h-4" />
            View All
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="table-header px-5 py-3 text-left">Description</th>
                <th className="table-header px-5 py-3 text-left hidden md:table-cell">Date</th>
                <th className="table-header px-5 py-3 text-left hidden lg:table-cell">Status</th>
                <th className="table-header px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingTransactions ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground animate-pulse font-medium">
                    Loading transactions...
                  </td>
                </tr>
              ) : !transactionsData || transactionsData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactionsData.map((tx, index) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          tx.type === 'credit' ? "bg-success/10" : "bg-muted"
                        )}>
                          {tx.type === 'credit' ? (
                            <ArrowDownLeft className="w-4 h-4 text-success" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-medium">{tx.description}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-sm text-muted-foreground">
                      {tx.date}
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className={cn(
                        tx.status === 'completed' ? 'badge-success' : 'badge-warning'
                      )}>
                        {tx.status}
                      </span>
                    </td>
                    <td className={cn(
                      "px-5 py-4 text-right font-medium",
                      tx.type === 'credit' ? "text-success" : "text-foreground"
                    )}>
                      {tx.type === 'credit' ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
