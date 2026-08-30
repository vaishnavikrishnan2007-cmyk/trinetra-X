import React from 'react';
import { ScreeningCase } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Activity, ShieldAlert, CheckCircle2, Clock, BarChart3, TrendingUp, Sparkles, Filter } from 'lucide-react';

interface AnalyticsScreenProps {
  cases: ScreeningCase[];
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ cases }) => {
  // Operational Metrics
  const total = cases.length;
  const clear = cases.filter(c => c.status === 'CLEAR').length;
  const reviews = cases.filter(c => c.status === 'SECONDARY_REVIEW' || c.status === 'PENDING_REVIEW').length;
  const highRisk = cases.filter(c => c.status === 'ESCALATED' || c.risk.level === 'HIGH').length;

  const hourlyTrends = [
    { hour: '06:00', screenings: 42, flagged: 3, latencySec: 4.1 },
    { hour: '08:00', screenings: 118, flagged: 9, latencySec: 4.3 },
    { hour: '10:00', screenings: 215, flagged: 18, latencySec: 4.6 },
    { hour: '12:00', screenings: 184, flagged: 14, latencySec: 4.2 },
    { hour: '14:00', screenings: 240, flagged: 22, latencySec: 4.5 },
    { hour: '16:00', screenings: 195, flagged: 15, latencySec: 4.0 },
    { hour: '18:00', screenings: 130, flagged: 8, latencySec: 3.9 },
    { hour: '20:00', screenings: 65, flagged: 4, latencySec: 3.8 },
  ];

  const riskDistribution = [
    { name: 'Clear / Passed', value: clear || 18, color: '#10b981' },
    { name: 'Secondary Review', value: reviews || 6, color: '#f59e0b' },
    { name: 'High Risk Escalated', value: highRisk || 4, color: '#ef4444' },
  ];

  const anomalyCategories = [
    { category: 'DOB Font / Text Alteration', count: 19, fill: '#ef4444' },
    { category: 'Photo Splice / Replaced Headshot', count: 14, fill: '#f97316' },
    { category: 'ICAO MRZ Checksum Mismatch', count: 16, fill: '#eab308' },
    { category: 'Cross-Doc Biographical Mismatch', count: 11, fill: '#a855f7' },
    { category: 'Metadata / Compression Variance', count: 8, fill: '#06b6d4' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold font-mono text-white">
              Border Forensics Analytics & Throughput Telemetry
            </h1>
            <span className="px-1.5 py-0.2 text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 rounded font-semibold">
              ICP RAXAUL METRICS
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            Operational screening volume, anomaly pattern clusters, latency profiles, and decision accuracy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#0D1117] border border-[#1E293B] rounded text-xs font-mono text-slate-300">
            Window: <strong>Last 24 Hours</strong>
          </span>
        </div>
      </div>

      {/* KPI Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg">
          <div className="text-slate-400 text-[10px] font-mono uppercase">Total Processed Today</div>
          <div className="text-xl font-bold font-mono text-white mt-0.5">1,189</div>
          <div className="text-[9px] text-emerald-400 font-mono mt-0.5">+14.2% vs yesterday</div>
        </div>

        <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg">
          <div className="text-slate-400 text-[10px] font-mono uppercase">Flag Rate (Secondary/Escalate)</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">7.8%</div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5">93 cases flagged for review</div>
        </div>

        <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg">
          <div className="text-slate-400 text-[10px] font-mono uppercase">Mean Decision Latency</div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-0.5">4.2s</div>
          <div className="text-[9px] text-emerald-400 font-mono mt-0.5">58% faster than manual screening</div>
        </div>

        <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg">
          <div className="text-slate-400 text-[10px] font-mono uppercase">ICAO 9303 Compliance</div>
          <div className="text-xl font-bold font-mono text-purple-400 mt-0.5">100%</div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5">TD1 / TD2 / TD3 Support</div>
        </div>
      </div>

      {/* Primary Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Screening Volume Trend (Hourly) */}
        <div className="lg:col-span-8 p-3.5 bg-[#161B22] border border-[#1E293B] rounded-lg shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <h2 className="font-mono font-bold text-xs text-white uppercase">
                Hourly Screening Volume vs. Flagged Anomalies
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Peak: 14:00 IST</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScreenings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0C10', borderColor: '#1E293B', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="screenings" name="Total Screenings" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={1} fill="url(#colorScreenings)" />
                <Area type="monotone" dataKey="flagged" name="Flagged Cases" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorFlagged)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Donut */}
        <div className="lg:col-span-4 p-3.5 bg-[#161B22] border border-[#1E293B] rounded-lg shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <h2 className="font-mono font-bold text-xs text-white uppercase">
                Risk Classification Mix
              </h2>
            </div>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0C10', borderColor: '#1E293B', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 pt-1 font-mono text-xs">
            {riskDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-300 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Anomaly Breakdown Bar Chart */}
      <div className="p-3.5 bg-[#161B22] border border-[#1E293B] rounded-lg shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <h2 className="font-mono font-bold text-xs text-white uppercase">
              Primary Fraud & Tampering Vectors Detected
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Forensic Anomaly Distribution</span>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={anomalyCategories} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" fontSize={10} fontFamily="monospace" />
              <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={10} fontFamily="monospace" width={180} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0A0C10', borderColor: '#1E293B', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }}
              />
              <Bar dataKey="count" name="Detected Incidents" radius={[0, 2, 2, 0]}>
                {anomalyCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
