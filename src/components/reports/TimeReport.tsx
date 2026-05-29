import React from 'react';
import { Lead } from '@/types/lead';
import { parseEventTime, getPeriodOfDay } from '@/utils/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface Props {
  leads: Lead[];
}

export const TimeReport = ({ leads }: Props) => {
  // Time processing
  let weekdaysTotal = 0, weekdaysQual = 0;
  let weekendsTotal = 0, weekendsQual = 0;
  
  const hourDataRaw = Array.from({ length: 24 }).map((_, i) => ({ hour: i, total: 0, qualificados: 0 }));
  const periodDataRaw: Record<string, { total: number, qualificados: number }> = {
    'Madrugada': { total: 0, qualificados: 0 },
    'Manhã': { total: 0, qualificados: 0 },
    'Tarde': { total: 0, qualificados: 0 },
    'Noite': { total: 0, qualificados: 0 },
  };

  leads.forEach(lead => {
    const isQual = lead.conversion === 'Qualificado';
    const dt = parseEventTime(lead.event_time);
    
    // Also support 'hora_min' if parsed from n8n (format HH:mm)
    let hour = -1;
    let weekday = -1;

    if (dt) {
      hour = dt.getHours();
      weekday = dt.getDay(); // 0 is Sunday
    } else if (lead.hora_min) {
      const hStr = lead.hora_min.split(':')[0];
      if (hStr) hour = parseInt(hStr, 10);
      // We can't know weekday from just time, so we skip it if no event_time
    }

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
    ...d
  }));

  const periodData = Object.entries(periodDataRaw).map(([nome, val]) => ({
    nome,
    ...val
  }));

  const weekdaysRate = weekdaysTotal ? (weekdaysQual / weekdaysTotal) * 100 : 0;
  const weekendsRate = weekendsTotal ? (weekendsQual / weekendsTotal) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* Cards - Weekdays vs Weekends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="liquid-glass p-6 rounded-[2rem] border border-white/10 flex flex-col gap-2">
          <span className="font-medium tracking-wide uppercase text-xs text-muted-foreground">Dias Úteis (Seg-Sex)</span>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-light text-white">{weekdaysRate.toFixed(1)}%</span>
            <span className="text-sm text-muted-foreground mb-1">Qualificados</span>
          </div>
          <span className="text-xs text-muted-foreground mt-2">{weekdaysQual} de {weekdaysTotal} leads</span>
        </div>

        <div className="liquid-glass p-6 rounded-[2rem] border border-white/10 flex flex-col gap-2">
          <span className="font-medium tracking-wide uppercase text-xs text-muted-foreground">Finais de Semana (Sáb-Dom)</span>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-light text-white">{weekendsRate.toFixed(1)}%</span>
            <span className="text-sm text-muted-foreground mb-1">Qualificados</span>
          </div>
          <span className="text-xs text-muted-foreground mt-2">{weekendsQual} de {weekendsTotal} leads</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Period of Day */}
        <div className="liquid-glass p-6 rounded-[2rem] border border-white/10 lg:col-span-1 h-[350px] flex flex-col">
          <h3 className="text-lg font-medium text-white mb-6 shrink-0">Conversão por Período</h3>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={periodData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis type="number" stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 12}} />
                <YAxis dataKey="nome" type="category" stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 11}} width={80} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="qualificados" name="Qualificados" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="total" name="Total" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Distribution */}
        <div className="liquid-glass p-6 rounded-[2rem] border border-white/10 lg:col-span-2 h-[350px] flex flex-col">
          <h3 className="text-lg font-medium text-white mb-6 shrink-0">Picos de Captação (Hora do Dia)</h3>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 10}} />
                <YAxis stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 11}} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="qualificados" name="Qualificados" fill="#A855F7" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="total" name="Não Qualificados" fill="#3B82F6" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
