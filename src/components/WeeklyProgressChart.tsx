import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export interface ChartDataPoint {
  day: string;
  minutes: number;
}

export interface WeeklyProgressChartProps {
  data?: ChartDataPoint[];
}

const defaultData: ChartDataPoint[] = [
  { day: 'Lun', minutes: 25 },
  { day: 'Mar', minutes: 40 },
  { day: 'Mié', minutes: 60 },
  { day: 'Jue', minutes: 35 },
  { day: 'Vie', minutes: 50 },
  { day: 'Sáb', minutes: 45 },
  { day: 'Dom', minutes: 70 },
];

export const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({
  data = defaultData,
}) => {
  return (
    <div className="w-full h-full min-h-[260px] bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            📊 Progreso de Aprendizaje (Últimos 7 Días)
          </h3>
          <p className="text-xs text-slate-300">Minutos dedicados por día</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Recharts
        </span>
      </div>

      <div className="w-full h-48 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '14px',
                color: '#f8fafc',
                fontSize: '12px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
              formatter={(value: number) => [`${value} min`, 'Tiempo Estudiado']}
            />
            <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
              {data.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    index === data.length - 1
                      ? '#818cf8'
                      : index % 2 === 0
                      ? '#6366f1'
                      : '#a855f7'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyProgressChart;
