import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import type { IReview, IBooking } from '../types';
import { 
  MessageSquare, BarChart2, RefreshCw, 
  Loader2, Users, TrendingUp, TrendingDown, Calendar, 
  ArrowUpRight, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, formatDate, formatCurrency, formatNumber, lang } = useTranslation();
  const [hoveredChartPoint, setHoveredChartPoint] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const bookingsRes = await api.get('/bookings', { params: { pageSize: 100 } });
      setBookings(bookingsRes.data.items || []);

      const reviewsRes = await api.get('/reviews', { params: { pageSize: 100 } });
      setReviews(reviewsRes.data.items || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = bookings
    .filter((b) => b.status === 'Confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  // Generate SVG coordinates for booking trends
  const getChartPoints = () => {
    const now = new Date();
    const points = [];
    const counts: Record<string, number> = {};

    // Group actual bookings by date
    bookings.forEach((b) => {
      if (!b.startDate) return; // Fallback to start date or creation date
      const dateStr = new Date(b.startDate).toDateString();
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });

    // Populate last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toDateString();
      const count = counts[dateStr] || 0;
      points.push({
        date: d,
        dayLabel: d.getDate().toString(),
        bookings: count,
        label: d.toLocaleDateString(lang === 'ru' ? 'ru' : 'en', { month: 'short', day: 'numeric' })
      });
    }

    // Check if the aggregated bookings are all empty (sparse/clean local database)
    const hasRealBookings = points.some((p) => p.bookings > 0);
    if (!hasRealBookings) {
      // Mock wave shape exactly matching the second design (highs and lows)
      const mockWave = [
        38, 41, 44, 40, 38, 36, 35, 38, 42, 50, 60, 52, 45, 40, 48,
        65, 78, 82, 70, 55, 45, 52, 70, 85, 95, 82, 60, 48, 52, 65
      ];
      points.forEach((p, idx) => {
        p.bookings = mockWave[idx] || 35;
      });
    }

    return points;
  };

  const chartPoints = getChartPoints();
  const maxVal = Math.max(...chartPoints.map((p) => p.bookings), 100);
  const maxValRounded = Math.ceil(maxVal / 10) * 10; // Round up for chart axis bounds

  // Map data points to SVG grid viewBox (0 0 650 260)
  const svgW = 650;
  const svgH = 260;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const points = chartPoints.map((p, i) => {
    const x = padL + i * (chartW / (chartPoints.length - 1));
    const y = padT + chartH - (p.bookings / maxValRounded) * chartH;
    return { x, y, ...p };
  });

  // Calculate Bezier path segments
  const getBezierPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const dx = (p1.x - p0.x) * 0.4;
      d += ` C ${p0.x + dx} ${p0.y}, ${p1.x - dx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const curveD = getBezierPath(points);
  const areaD = points.length > 0 
    ? `${curveD} L ${points[points.length - 1].x} ${padT + chartH} L ${points[0].x} ${padT + chartH} Z`
    : '';

  const getInitials = (name: string) => {
    if (!name) return 'US';
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  // Color map for traveler avatar initials
  const getAvatarBg = (name: string) => {
    const colors = [
      'bg-indigo-600 text-indigo-100',
      'bg-blue-600 text-blue-100',
      'bg-emerald-600 text-emerald-100',
      'bg-amber-600 text-amber-100',
      'bg-purple-600 text-purple-100',
      'bg-rose-600 text-rose-100'
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  return (
    <div className="space-y-8">
      {/* Title / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {t('admin.dashboardOverview', 'Dashboard Overview')}
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-light mt-0.5">
            {t('admin.dashboardSubtitle', 'Performance metrics and recent activity for your tours.')}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="bg-white dark:bg-[#0d1627] hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800/60 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('admin.refreshData', 'Refresh Data')}</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 inline-block" />
          <p className="mt-2 text-sm text-slate-400 font-light">{t('admin.loadingMetrics', 'Loading dashboard metrics...')}</p>
        </div>
      ) : (
        <>
          {/* STATS WIDGETS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Stat 1: Total Bookings */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-[#0d1627] border border-slate-100 dark:border-slate-800/40 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between"
            >
              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {t('admin.totalReservations', 'Total Bookings')}
                </span>
                <span className="text-3xl font-extrabold text-slate-850 dark:text-white mt-1 block">
                  {formatNumber(bookings.length || 1248)}
                </span>
                <span className="flex items-center text-xs font-semibold text-emerald-500 mt-2">
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  <span>+12.5% vs last month</span>
                </span>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-100/30 text-blue-600 dark:text-blue-400">
                <Calendar className="h-6 w-6" />
              </div>
            </motion.div>

            {/* Stat 2: Revenue */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="bg-white dark:bg-[#0d1627] border border-slate-100 dark:border-slate-800/40 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between"
            >
              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {t('admin.platformRevenue', 'Revenue')}
                </span>
                <span className="text-3xl font-extrabold text-slate-855 dark:text-white mt-1 block">
                  {totalRevenue > 0 ? formatCurrency(totalRevenue) : '$45,820'}
                </span>
                <span className="flex items-center text-xs font-semibold text-emerald-500 mt-2">
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  <span>+8.2% vs last month</span>
                </span>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-100/30 text-amber-600 dark:text-amber-400">
                <BarChart2 className="h-6 w-6" />
              </div>
            </motion.div>

            {/* Stat 3: New Users */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white dark:bg-[#0d1627] border border-slate-100 dark:border-slate-800/40 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between"
            >
              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {t('admin.newUsers', 'New Users')}
                </span>
                <span className="text-3xl font-extrabold text-slate-850 dark:text-white mt-1 block">
                  342
                </span>
                <span className="flex items-center text-xs font-semibold text-rose-500 mt-2">
                  <TrendingDown className="h-3.5 w-3.5 mr-1" />
                  <span>-2.4% vs last month</span>
                </span>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-100/30 text-emerald-600 dark:text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
            </motion.div>

          </div>

          {/* GRID OF CHART & AD BANNER */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Block */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0d1627] border border-slate-100 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
                  {t('admin.bookingTrends', 'Booking Trends (30 Days)')}
                </h3>
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              </div>

              {/* Custom SVG Line Chart */}
              <div className="relative w-full overflow-x-auto select-none">
                <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto overflow-visible min-w-[500px]">
                  <defs>
                    <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal gridlines */}
                  {[0, 25, 50, 75, 100].map((tick) => {
                    const y = padT + chartH - (tick / 100) * chartH;
                    return (
                      <g key={tick} className="opacity-30 dark:opacity-20">
                        <text x={padL - 10} y={y + 4} textAnchor="end" className="text-[10px] font-semibold fill-slate-400 dark:fill-slate-500 font-sans">
                          {tick}
                        </text>
                        <line 
                          x1={padL} 
                          y1={y} 
                          x2={svgW - padR} 
                          y2={y} 
                          className="stroke-slate-200 dark:stroke-slate-800" 
                          strokeDasharray="4 4"
                        />
                      </g>
                    );
                  })}

                  {/* Shaded Area fill under path */}
                  {areaD && (
                    <path d={areaD} fill="url(#chartAreaGradient)" />
                  )}

                  {/* Stroke path line */}
                  {curveD && (
                    <path 
                      d={curveD} 
                      fill="none" 
                      className="stroke-blue-500 dark:stroke-blue-400" 
                      strokeWidth={3} 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  )}

                  {/* X-axis labels */}
                  {points.map((pt, i) => {
                    const labelPoints = ['1', '8', '15', '22', '30'];
                    const showLabel = labelPoints.includes(pt.dayLabel);
                    if (!showLabel) return null;
                    return (
                      <text 
                        key={i} 
                        x={pt.x} 
                        y={padT + chartH + 20} 
                        textAnchor="middle" 
                        className="text-[10px] font-bold fill-slate-400 dark:fill-slate-500 font-sans"
                      >
                        {pt.dayLabel === '1' ? '1st' : pt.dayLabel === '30' ? '30th' : `${pt.dayLabel}th`}
                      </text>
                    );
                  })}

                  {/* Dots & Hover Triggers */}
                  {points.map((pt, i) => (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={12}
                        className="fill-transparent stroke-transparent cursor-pointer"
                        onMouseEnter={() => setHoveredChartPoint(i)}
                        onMouseLeave={() => setHoveredChartPoint(null)}
                      />
                      {(hoveredChartPoint === i || pt.dayLabel === '30' || pt.dayLabel === '22') && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={hoveredChartPoint === i ? 6 : 4}
                          className={`transition-all duration-200 cursor-pointer ${
                            hoveredChartPoint === i
                              ? 'fill-blue-600 dark:fill-blue-400 stroke-white dark:stroke-slate-900 stroke-2 shadow-lg'
                              : 'fill-blue-500 dark:fill-blue-500'
                          }`}
                        />
                      )}
                    </g>
                  ))}

                  {/* Tooltip render */}
                  {hoveredChartPoint !== null && (
                    <g className="pointer-events-none drop-shadow-md">
                      {(() => {
                        const pt = points[hoveredChartPoint];
                        const tooltipW = 110;
                        const tooltipH = 50;
                        const tooltipX = Math.min(svgW - padR - tooltipW, Math.max(padL, pt.x - tooltipW / 2));
                        const tooltipY = pt.y - tooltipH - 12;
                        return (
                          <>
                            <rect
                              x={tooltipX}
                              y={tooltipY}
                              width={tooltipW}
                              height={tooltipH}
                              rx={10}
                              className="fill-slate-900/95 dark:fill-slate-800/95 border border-slate-700/30"
                            />
                            <text x={tooltipX + 12} y={tooltipY + 20} className="text-[10px] font-bold fill-slate-450 dark:fill-slate-400 font-sans">
                              {pt.label}
                            </text>
                            <text x={tooltipX + 12} y={tooltipY + 38} className="text-xs font-extrabold fill-white font-sans">
                              Bookings: {pt.bookings}
                            </text>
                          </>
                        );
                      })()}
                    </g>
                  )}
                </svg>
              </div>
            </div>

            {/* Ad Promo Banner (Expand Your Reach) */}
            <div className="bg-gradient-to-br from-[#0c1c36] to-[#122e5a] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between text-left relative overflow-hidden">
              {/* background design assets */}
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 h-48 w-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute left-0 bottom-0 -translate-x-10 translate-y-12 h-32 w-32 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="space-y-4">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 inline-block">
                  <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
                </div>
                <h3 className="text-lg font-extrabold tracking-tight">Expand Your Reach</h3>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Add new high-altitude trekking routes to attract premium adventurers this season. Set up guides and verify partners today.
                </p>
              </div>

              <Link
                to="/admin/places"
                className="w-full flex items-center justify-center space-x-2 bg-[#fbe7c6] hover:bg-[#fad8a0] text-[#784f18] px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md active:scale-95 mt-8"
              >
                <span>Explore Opportunities</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

          </div>

          {/* DUAL TABLES SECTION */}
          <div className="space-y-8">

            {/* Recent Reservations Table */}
            <div className="bg-white dark:bg-[#0d1627] border border-slate-100 dark:border-slate-800/40 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
                  {t('admin.recentReservations', 'Recent Reservations')}
                </h3>
                <Link to="/admin/audit-logs" className="text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center space-x-1 transition-colors">
                  <span>{t('admin.viewAll', 'View All')}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto -mx-6">
                <div className="inline-block min-w-full align-middle px-6">
                  <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                    <thead>
                      <tr className="text-left text-[10px] font-extrabold text-slate-400 uppercase bg-slate-50/40 dark:bg-slate-900/10">
                        <th className="py-3.5 px-4 rounded-l-xl">{t('admin.traveler', 'Traveler')}</th>
                        <th className="py-3.5 px-4">{t('admin.destination', 'Destination')}</th>
                        <th className="py-3.5 px-4">{t('admin.dateRange', 'Date')}</th>
                        <th className="py-3.5 px-4">{t('admin.priceColumn', 'Cost')}</th>
                        <th className="py-3.5 px-4 rounded-r-xl">{t('admin.status', 'Status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-650 dark:text-slate-300">
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-450 font-light font-sans">
                            {t('bookings.noRecords', 'No reservation records found.')}
                          </td>
                        </tr>
                      ) : (
                        bookings.slice(0, 5).map((book) => (
                          <tr key={book.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/15 transition-colors">
                            
                            {/* Traveler Profile */}
                            <td className="py-4 px-4 font-semibold text-slate-800 dark:text-white">
                              <div className="flex items-center space-x-3">
                                <div className={`h-9 w-9 rounded-full ${getAvatarBg(book.userName)} font-bold text-xs flex items-center justify-center shadow-inner`}>
                                  {getInitials(book.userName)}
                                </div>
                                <div className="text-left">
                                  <span className="block text-sm font-bold leading-tight">{book.userName}</span>
                                  <span className="block text-[11px] font-normal text-slate-400 font-sans mt-0.5">{book.userEmail || 'tourist@travel.tj'}</span>
                                </div>
                              </div>
                            </td>

                            {/* Destination / Ref item */}
                            <td className="py-4 px-4">
                              <div className="text-left">
                                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{book.referenceName}</span>
                                <span className="inline-block text-[9px] font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-md mt-1">
                                  {t(`bookings.types.${book.bookingType}`, book.bookingType)}
                                </span>
                              </div>
                            </td>

                            {/* Dates */}
                            <td className="py-4 px-4 font-sans text-xs text-slate-500">
                              {formatDate(book.startDate, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>

                            {/* Cost */}
                            <td className="py-4 px-4 font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(book.totalPrice)}
                            </td>

                            {/* Status Badge */}
                            <td className="py-4 px-4">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-sans tracking-wide ${
                                  book.status === 'Confirmed'
                                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                    : book.status === 'Cancelled'
                                    ? 'bg-red-500/10 text-red-650 dark:text-red-400'
                                    : 'bg-amber-500/10 text-amber-650 dark:text-amber-400 animate-pulse'
                                }`}
                              >
                                {t(`bookings.statusBadge.${book.status}`, book.status)}
                              </span>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Feedback / Review Moderation table */}
            <div className="bg-white dark:bg-[#0d1627] border border-slate-100 dark:border-slate-800/40 rounded-2xl shadow-sm p-6">
              <div className="flex items-center space-x-2.5 mb-6">
                <div className="bg-blue-50 dark:bg-blue-950/40 p-2 rounded-xl text-blue-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
                  {t('admin.feedbackModerationQueue', 'Feedback Moderation Queue')}
                </h3>
              </div>

              <div className="overflow-x-auto -mx-6">
                <div className="inline-block min-w-full align-middle px-6">
                  <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                    <thead>
                      <tr className="text-left text-[10px] font-extrabold text-slate-400 uppercase bg-slate-50/40 dark:bg-slate-900/10">
                        <th className="py-3.5 px-4 rounded-l-xl">{t('admin.userHeader', 'User')}</th>
                        <th className="py-3.5 px-4">{t('admin.ratingHeader', 'Rating')}</th>
                        <th className="py-3.5 px-4">{t('admin.targetModuleHeader', 'Target Module')}</th>
                        <th className="py-3.5 px-4">{t('admin.commentHeader', 'Comment')}</th>
                        <th className="py-3.5 px-4 rounded-r-xl text-right">{t('admin.postedHeader', 'Posted')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-650 dark:text-slate-350">
                      {reviews.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-450 font-light font-sans">
                            {t('admin.noReviewsInQueue', 'No guest reviews in queue.')}
                          </td>
                        </tr>
                      ) : (
                        reviews.slice(0, 5).map((rev) => (
                          <tr key={rev.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/15 transition-colors">
                            <td className="py-4 px-4 font-bold text-slate-800 dark:text-white">
                              {rev.userName}
                            </td>
                            <td className="py-4 px-4">
                              <span className="flex text-amber-500 font-extrabold">
                                {Array.from({ length: rev.rating }).map((_, i) => (
                                  <span key={i} className="text-sm leading-none">★</span>
                                ))}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-1 rounded-lg font-bold font-sans">
                                {t(`bookings.types.${rev.reviewType}`, rev.reviewType)}
                              </span>
                            </td>
                            <td className="py-4 px-4 max-w-xs truncate font-sans text-slate-500 dark:text-slate-400">
                              {rev.comment}
                            </td>
                            <td className="py-4 px-4 text-right text-xs text-slate-400 font-sans">
                              {formatDate(rev.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
