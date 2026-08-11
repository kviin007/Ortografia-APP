import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export interface PerformanceMetricPoint {
  date: string;
  speedWpm: number;
  accuracyPct: number;
  vocabularyCount: number;
}

export interface MultiMetricProgressChartProps {
  data?: PerformanceMetricPoint[];
}

const defaultPerformanceData: PerformanceMetricPoint[] = [
  { date: '15 Jul', speedWpm: 28, accuracyPct: 72, vocabularyCount: 15 },
  { date: '17 Jul', speedWpm: 32, accuracyPct: 78, vocabularyCount: 22 },
  { date: '19 Jul', speedWpm: 38, accuracyPct: 84, vocabularyCount: 30 },
  { date: '21 Jul', speedWpm: 42, accuracyPct: 88, vocabularyCount: 38 },
  { date: '23 Jul', speedWpm: 45, accuracyPct: 91, vocabularyCount: 45 },
  { date: '25 Jul', speedWpm: 49, accuracyPct: 94, vocabularyCount: 52 },
  { date: '27 Jul', speedWpm: 54, accuracyPct: 96, vocabularyCount: 64 },
];

export const MultiMetricProgressChart: React.FC<MultiMetricProgressChartProps> = ({
  data = defaultPerformanceData,
}) => {
  const [activeMetric, setActiveMetric] = useState<'all' | 'speed' | 'accuracy' | 'vocab'>('all');

  return (
    <div className="w-full h-full bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            📈 Evolución de Habilidades (Velocidad, Precisión y Vocabulario)
          </h3>
          <p className="text-xs text-slate-300">Rendimiento continuo de autoestudio a lo largo del tiempo</p>
        </div>

        {/* Filter Selector Pills */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveMetric('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeMetric === 'all'
                ? 'bg-indigo-500 text-white font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveMetric('speed')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeMetric === 'speed'
                ? 'bg-amber-500 text-white font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            ⚡ Velocidad
          </button>
          <button
            onClick={() => setActiveMetric('accuracy')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeMetric === 'accuracy'
                ? 'bg-emerald-500 text-white font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            🎯 Precisión
          </button>
          <button
            onClick={() => setActiveMetric('vocab')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeMetric === 'vocab'
                ? 'bg-cyan-500 text-white font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            📚 Vocabulario
          </button>
        </div>
      </div>

      <div className="w-full h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis
              yAxisId="left"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#38bdf8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                color: '#f8fafc',
                fontSize: '12px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'speedWpm') return [`${value} PPM`, 'Velocidad de Escritura'];
                if (name === 'accuracyPct') return [`${value}%`, 'Precisión Gramatical'];
                if (name === 'vocabularyCount') return [`${value} Palabras`, 'Vocabulario Guardado'];
                return [value, name];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '11px', color: '#cbd5e1' }}
              formatter={(value) => {
                if (value === 'speedWpm') return 'Velocidad (PPM)';
                if (value === 'accuracyPct') return 'Precisión (%)';
                if (value === 'vocabularyCount') return 'Vocabulario Dominado';
                return value;
              }}
            />

            {(activeMetric === 'all' || activeMetric === 'vocab') && (
              <Bar
                yAxisId="right"
                dataKey="vocabularyCount"
                fill="#38bdf8"
                opacity={0.35}
                radius={[6, 6, 0, 0]}
                barSize={18}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'speed') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="speedWpm"
                stroke="#fbbf24"
                strokeWidth={3}
                dot={{ r: 4, fill: '#fbbf24', strokeWidth: 2, stroke: '#0f172a' }}
                activeDot={{ r: 7 }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'accuracy') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="accuracyPct"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }}
                activeDot={{ r: 7 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MultiMetricProgressChart;
