import React from 'react';
import { Lead } from '@/types/lead';
import { parseEventTime, getPeriodOfDay } from '@/utils/analytics';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

interface Props { leads: Lead[]; }

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,10,12,0.90)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px',
      padding: '10px 14px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      minWidth: '130px',
    }}>
      {label && (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {label}
        </p>
      )}
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: i < payload.length - 1 ? '5px' : 0 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{entry.name}</span>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600, marginLeft: 'auto', paddingLeft: '12px' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export const TimeReport = ({ leads }: Props) => {
  let weekdaysTotal = 0, weekdaysQual = 0;
  let weekendsTotal = 0, weekendsQual = 0;

  const hourDataRaw = Array.from({ length: 24 }).map((_, i) => ({ hour: i, total: 0, qualificados: 0 }));
  const periodDataRaw: Record<string, { total: number, qualificados: number }> = {
    'Madrugada': { total: 0, qualificados: 0 },
    'Manhã':     { total: 0, qualificados: 0 },
    'Tarde':     { total: 0, qualificados: 0 },
    'Noite':     { total: 0, qualificados: 0 },
  };

  leads.forEach(lead => {
    const isQual = lead.conversion === 'Qualificado';
    const dt = parseEventTime(lead.event_time);

    let hour = -1;
    let weekday = -1;

    if (lead.hora_min) {
      const hStr = lead.hora_min.split(':')[0];
      if (hStr) hour = parseInt(hStr, 10);
    } else if (dt) {
      hour = dt.getHours();
    }

    if (dt) weekday = dt.getDay();

    if (hour >= 0 && hour < 24) {
      hourDataRaw[hour].total += 1;
      if (isQual) hourDataRaw[hour].qualificados += 1;
      const period = getPeriodOfDay(hour);
      periodDataRaw[period].total += 1;
      if (isQual) periodDataRaw[period].qualificados += 1;
    }

    if (weekday !== -1) {
      if (weekday >= 1 && weekday <= 5) {
        weekdaysTotal += 1;
        if (isQual) weekdaysQual += 1;
      } else {
        weekendsTotal += 1;
        if (isQual) weekendsQual += 1;
      }
    }
  });

  const hourData = hourDataRaw.map(d => ({
    time: `${String(d.hour).padStart(2, '0')}:00`,
    qualificados: d.qualificados,
    naoQualificados: d.total - d.qualificados,
    total: d.total,
  }));

  const periodData = Object.entries(periodDataRaw).map(([nome, val]) => ({
    nome,
    qualificados: val.qualificados,
    naoQualificados: val.total - val.qualificados,
    total: val.total,
  }));

  const weekdaysRate = weekdaysTotal ? (weekdaysQual / weekdaysTotal) * 100 : 0;
  const weekendsRate = weekendsTotal ? (weekendsQual / weekendsTotal) * 100 : 0;

  const cursorStyle = { fill: 'rgba(255,255,255,0.03)' };

  return (
    <div className="space-y-6">

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="liquid-glass p-6 rounded-xl border border-white/10 flex flex-col gap-2">
          <span className="font-medium tracking-wide uppercase text-xs text-muted-foreground">Dias Úteis (Seg–Sex)</span>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-light text-white">{weekdaysRate.toFixed(1)}%</span>
            <span className="text-sm text-muted-foreground mb-1">Qualificados</span>
          </div>
          <span className="text-xs text-muted-foreground mt-2">{weekdaysQual} de {weekdaysTotal} leads</span>
        </div>
        <div className="liquid-glass p-6 rounded-xl border border-white/10 flex flex-col gap-2">
          <span className="font-medium tracking-wide uppercase text-xs text-muted-foreground">Finais de Semana (Sáb–Dom)</span>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-light text-white">{weekendsRate.toFixed(1)}%</span>
            <span className="text-sm text-muted-foreground mb-1">Qualificados</span>
          </div>
          <span className="text-xs text-muted-foreground mt-2">{weekendsQual} de {weekendsTotal} leads</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Conversão por Período */}
        <div className="liquid-glass p-6 rounded-xl border border-white/10 lg:col-span-1 h-[350px] flex flex-col">
          <h3 className="text-lg font-medium text-white mb-6 shrink-0">Conversão por Período</h3>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={periodData} layout="vertical" margin={{ top: 0, right: 8, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="nome" type="category" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} width={80} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<ChartTooltip />} cursor={cursorStyle} />
                <Bar dataKey="qualificados" name="Qualificados" fill="#38A169" radius={[0, 0, 0, 0]} barSize={18} stackId="a" animationDuration={900} animationEasing="ease-out" />
                <Bar dataKey="naoQualificados" name="Não Qualificados" fill="rgba(255,255,255,0.06)" radius={[0, 4, 4, 0]} barSize={18} stackId="a" animationDuration={900} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Picos por Hora */}
        <div className="liquid-glass p-6 rounded-xl border border-white/10 lg:col-span-2 h-[350px] flex flex-col">
          <h3 className="text-lg font-medium text-white mb-6 shrink-0">Picos de Captação (Hora do Dia)</h3>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<ChartTooltip />} cursor={cursorStyle} />
                <Bar dataKey="qualificados" name="Qualificados" fill="#6829c0" radius={[0, 0, 0, 0]} stackId="a" animationDuration={900} animationEasing="ease-out" />
                <Bar dataKey="naoQualificados" name="Não Qualificados" fill="#06b6d4" radius={[4, 4, 0, 0]} stackId="a" animationDuration={900} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
