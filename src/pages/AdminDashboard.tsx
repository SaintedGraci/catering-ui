import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { analyticsService, type DashboardStats } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CHART_COLORS = {
  primary: '#8b5cf6',
  secondary: '#ec4899',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  purple: '#a855f7',
};

const STATUS_COLORS: Record<string, string> = {
  'Pending': '#f59e0b',
  'Confirmed': '#10b981',
  'Completed': '#3b82f6',
  'Cancelled': '#ef4444',
};

const AdminDashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    document.title = "Dashboard — Catering Admin";
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setIsLoadingStats(true);
      const response = await analyticsService.getDashboardStats();
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black border-2 border-white/20 rounded-lg p-4 shadow-2xl">
          <p className="text-base font-bold text-white mb-3 border-b border-white/20 pb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 py-1">
              <span className="text-sm font-medium text-white/90">{entry.name}:</span>
              <span className="text-sm font-bold text-white">
                {entry.name.includes('Revenue') ? formatCurrency(entry.value) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const statsCards = dashboardData ? [
    {
      icon: Calendar,
      label: "Total Bookings",
      value: dashboardData.overview.totalBookings.toString(),
      change: dashboardData.overview.pendingBookings > 0 
        ? `${dashboardData.overview.pendingBookings} pending` 
        : "All processed",
      trend: "up",
      gradient: "from-violet-500 to-purple-600",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500",
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: formatCurrency(dashboardData.overview.totalRevenue),
      change: `Avg: ${formatCurrency(dashboardData.overview.avgBookingValue)}`,
      trend: "up",
      gradient: "from-emerald-500 to-green-600",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    {
      icon: Users,
      label: "Total Customers",
      value: dashboardData.overview.totalCustomers.toString(),
      change: "Unique clients",
      trend: "up",
      gradient: "from-blue-500 to-cyan-600",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      icon: TrendingUp,
      label: "Avg Booking Value",
      value: formatCurrency(dashboardData.overview.avgBookingValue),
      change: "Per booking",
      trend: "neutral",
      gradient: "from-pink-500 to-rose-600",
      iconBg: "bg-pink-500/10",
      iconColor: "text-pink-500",
    },
  ] : [];

  // Prepare chart data
  const statusChartData = dashboardData?.bookingsByStatus.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    color: STATUS_COLORS[item.status.charAt(0).toUpperCase() + item.status.slice(1)] || CHART_COLORS.primary
  })) || [];

  const packageChartData = dashboardData?.popularPackages.slice(0, 6).map((item, index) => ({
    name: item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name,
    bookings: item.count,
    fill: Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]
  })) || [];

  const trendChartData = dashboardData?.monthlyTrend.map(item => ({
    month: item.month,
    bookings: item.bookings,
    revenue: Math.round(item.revenue)
  })) || [];

  const guestChartData = dashboardData?.guestDistribution.map((item, index) => ({
    range: item.range,
    count: item.count,
    fill: Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]
  })) || [];

  return (
    <AdminLayout>
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-to-r from-background via-background to-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Welcome back, {user?.name}
              </h1>
              <p className="text-foreground/60 mt-1 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Here's your business overview and analytics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary text-sm font-medium">
                <Clock className="w-4 h-4 inline mr-2" />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8 space-y-8 bg-gradient-to-br from-background via-background to-muted/20">
        {isLoadingStats ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-foreground/60">Loading analytics...</p>
            </div>
          </div>
        ) : dashboardData ? (
          <>
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {statsCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center backdrop-blur-sm`}>
                          <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                        </div>
                        {stat.trend === "up" && (
                          <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        )}
                        {stat.trend === "down" && (
                          <div className="flex items-center gap-1 text-red-500 text-sm font-medium">
                            <ArrowDownRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <p className="font-mono text-xs tracking-wider uppercase text-foreground/60 mb-2">
                        {stat.label}
                      </p>
                      <p className="font-display text-3xl font-bold text-foreground mb-1">
                        {stat.value}
                      </p>
                      <p className="text-xs text-foreground/50 flex items-center gap-1">
                        {stat.change}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts Row 1 - Full Width Trend */}
            <div className="rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Revenue & Bookings Trend
                  </h2>
                  <p className="text-sm text-foreground/60 mt-1">Monthly performance over the last 12 months</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={trendChartData}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#888" 
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke={CHART_COLORS.primary}
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke={CHART_COLORS.success}
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Area 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorBookings)"
                    name="Bookings"
                  />
                  <Area 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={CHART_COLORS.success}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue (₱)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Charts Row 2 */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Booking Status */}
              <div className="rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-6 shadow-lg">
                <div className="mb-6">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Booking Status
                  </h2>
                  <p className="text-sm text-foreground/60 mt-1">Distribution by status</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Popular Packages */}
              <div className="rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-6 shadow-lg">
                <div className="mb-6">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Popular Packages
                  </h2>
                  <p className="text-sm text-foreground/60 mt-1">Top performing packages</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={packageChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888" 
                      angle={-20} 
                      textAnchor="end" 
                      height={100}
                      style={{ fontSize: '11px' }}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#888"
                      style={{ fontSize: '12px' }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="bookings" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={60}
                    >
                      {packageChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Guest Distribution */}
            <div className="rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-6 shadow-lg">
              <div className="mb-6">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Guest Count Distribution
                </h2>
                <p className="text-sm text-foreground/60 mt-1">Event size breakdown</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={guestChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                  <XAxis 
                    type="number" 
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                  />
                  <YAxis 
                    dataKey="range" 
                    type="category" 
                    stroke="#888" 
                    width={100}
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
                    radius={[0, 8, 8, 0]}
                    maxBarSize={40}
                  >
                    {guestChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Bookings Table */}
            <div className="rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Recent Bookings
                  </h2>
                  <p className="text-sm text-foreground/60 mt-1">Latest customer inquiries</p>
                </div>
                <button 
                  onClick={() => navigate("/admin/bookings")}
                  className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                >
                  View all
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-mono text-xs tracking-wider uppercase text-foreground/60 font-semibold">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 font-mono text-xs tracking-wider uppercase text-foreground/60 font-semibold">
                        Package
                      </th>
                      <th className="text-left py-3 px-4 font-mono text-xs tracking-wider uppercase text-foreground/60 font-semibold">
                        Event Date
                      </th>
                      <th className="text-left py-3 px-4 font-mono text-xs tracking-wider uppercase text-foreground/60 font-semibold">
                        Guests
                      </th>
                      <th className="text-left py-3 px-4 font-mono text-xs tracking-wider uppercase text-foreground/60 font-semibold">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 font-mono text-xs tracking-wider uppercase text-foreground/60 font-semibold">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer group"
                        onClick={() => navigate("/admin/bookings")}
                      >
                        <td className="py-4 px-4 font-medium text-foreground group-hover:text-primary transition-colors">
                          {booking.customerName}
                        </td>
                        <td className="py-4 px-4 text-foreground/70 text-sm">
                          {booking.packageName}
                        </td>
                        <td className="py-4 px-4 text-foreground/70 text-sm">
                          {new Date(booking.eventDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-foreground/70 text-sm">
                          {booking.guestCount}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === "confirmed"
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : booking.status === "completed"
                                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                : booking.status === "cancelled"
                                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-foreground">
                          {booking.estimatedPrice ? formatCurrency(booking.estimatedPrice) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-foreground/60">No data available</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
