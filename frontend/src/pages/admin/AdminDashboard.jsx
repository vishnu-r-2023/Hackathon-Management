import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { hackathonAPI } from '../../services/endpoints';
import { Card, Button } from '../../components/FormElements';
import { LoadingSkeleton } from '../../components/CommonComponents';
import { useUIStore } from '../../store/store';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, FileText, Award, TrendingUp } from 'lucide-react';

export const AdminDashboard = () => {
  const darkMode = useUIStore((s) => s.darkMode);
  const { data: hackathons, isLoading } = useQuery(
    'hackathons',
    () => hackathonAPI.getAll({ limit: 100 }),
    { select: (res) => res.data.hackathons }
  );

  const axisTick = { fill: darkMode ? '#94a3b8' : '#475569', fontSize: 12 };
  const gridStroke = darkMode ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.08)';
  const tooltipContentStyle = {
    backgroundColor: darkMode ? 'rgba(2,6,23,0.92)' : 'rgba(255,255,255,0.92)',
    border: darkMode ? '1px solid rgba(51,65,85,0.8)' : '1px solid rgba(226,232,240,0.8)',
    borderRadius: 12,
    boxShadow: darkMode ? '0 16px 40px rgba(0,0,0,0.35)' : '0 16px 40px rgba(2,6,23,0.10)',
  };
  const tooltipLabelStyle = { color: darkMode ? '#e2e8f0' : '#0f172a', fontWeight: 600 };
  const tooltipItemStyle = { color: darkMode ? '#cbd5e1' : '#334155' };

  const [analyticsData] = useState([
    { name: 'Hackathon 1', registrations: 120, submissions: 45, participants: 89 },
    { name: 'Hackathon 2', registrations: 200, submissions: 78, participants: 156 },
    { name: 'Hackathon 3', registrations: 150, submissions: 62, participants: 125 },
  ]);

  const statsCards = [
    {
      icon: TrendingUp,
      label: 'Total Hackathons',
      value: hackathons?.length || 0,
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Users,
      label: 'Total Registrations',
      value: hackathons?.reduce((sum, h) => sum + (h.registrationCount || 0), 0) || 0,
      color: 'from-green-500 to-green-600',
    },
    {
      icon: FileText,
      label: 'Total Submissions',
      value: hackathons?.reduce((sum, h) => sum + (h.submissionCount || 0), 0) || 0,
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Award,
      label: 'Total Participants',
      value: hackathons?.reduce((sum, h) => sum + (h.participantCount || 0), 0) || 0,
      color: 'from-pink-500 to-pink-600',
    },
  ];

  if (isLoading) return <LoadingSkeleton count={4} />;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-soft ring-1 ring-white/10`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <stat.icon size={40} className="opacity-30" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Submissions by Hackathon
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData}>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={axisTick}
                axisLine={{ stroke: gridStroke }}
                tickLine={{ stroke: gridStroke }}
              />
              <YAxis
                tick={axisTick}
                axisLine={{ stroke: gridStroke }}
                tickLine={{ stroke: gridStroke }}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
              />
              <Bar dataKey="submissions" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Participant Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData}
                dataKey="participants"
                nameKey="name"
                cx="50%"
                cy="50%"
                fill="#6366f1"
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Hackathons */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Recent Hackathons
        </h3>
        <div className="space-y-3">
          {hackathons?.slice(0, 5).map((hackathon) => (
            <motion.div
              key={hackathon._id}
              whileHover={{ x: 4 }}
              className="p-4 bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{hackathon.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{hackathon.status}</p>
              </div>
              <Button variant="ghost">View</Button>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
};
