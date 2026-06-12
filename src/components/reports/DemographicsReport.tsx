import React from 'react';
import { Lead } from '@/types/lead';
import { getDevice, extractDDD, topNQual, getStateFromDDD } from '@/utils/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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
      minWidth: '140px',
    }}>
      {label && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</p>}
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

interface Props {
  leads: Lead[];
}

const COLORS = ['#6829c0', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#64748b'];

export const DemographicsReport = ({ leads }: Props) => {
  
  // Device
  const deviceDataRaw = leads.reduce((acc, lead) => {
    const dev = getDevice(lead.user_agent);
    if (!acc[dev]) acc[dev] = 0;
    acc[dev] += 1;
    return acc;
  }, {} as Record<string, number>);

  const deviceData = Object.entries(deviceDataRaw)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // DDD
  const dddRaw = leads.reduce((acc, lead) => {
    const d = extractDDD(lead.phone_number);
    if (d === 'Não Identificado') return acc;
    if (!acc[d]) acc[d] = { total: 0, qualificados: 0 };
    acc[d].total += 1;
    if (lead.conversion === 'Qualificado') acc[d].qualificados += 1;
    return acc;
  }, {} as Record<string, { total: number, qualificados: number }>);
  
  const topDDD = topNQual(dddRaw, 10);

  // Geo (States via DDD)
  const stateRaw = leads.reduce((acc, lead) => {
    const state = getStateFromDDD(lead.phone_number);
    if (state === 'Não Identificado') return acc;
    if (!acc[state]) acc[state] = { total: 0, qualificados: 0 };
    acc[state].total += 1;
    if (lead.conversion === 'Qualificado') acc[state].qualificados += 1;
    return acc;
  }, {} as Record<string, { total: number, qualificados: number }>);

  const topStates = topNQual(stateRaw, 5);

  // Gender
  const genderRaw = leads.reduce((acc, lead) => {
    const g = lead.gender || 'Não Identificado';
    if (!acc[g]) acc[g] = { total: 0, qualificados: 0 };
    acc[g].total += 1;
    if (lead.conversion === 'Qualificado') acc[g].qualificados += 1;
    return acc;
  }, {} as Record<string, { total: number, qualificados: number }>);
  const topGenders = topNQual(genderRaw, 5);

  // Age
  const ageRaw = leads.reduce((acc, lead) => {
    const a = lead.age ? String(lead.age) : 'Não Identificado';
    if (!acc[a]) acc[a] = { total: 0, qualificados: 0 };
    acc[a].total += 1;
    if (lead.conversion === 'Qualificado') acc[a].qualificados += 1;
    return acc;
  }, {} as Record<string, { total: number, qualificados: number }>);
  const topAges = topNQual(ageRaw, 10);

  const renderHorizontalBar = (data: any[], title: string, _fillTotal: string, fillQual: string) => {
    const chartData = data.map(d => ({
      ...d,
      naoQualificados: (d.total || 0) - (d.qualificados || 0),
    }));
    return (
      <div className="liquid-glass p-6 rounded-xl border border-white/10 flex flex-col h-[350px]">
        <h3 className="text-lg font-medium text-white mb-6 shrink-0">{title}</h3>
        <div className="flex-1 min-h-0 w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 8, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="nome" type="category" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} width={40} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="qualificados" name="Qualificados" fill={fillQual} radius={[0, 0, 0, 0]} barSize={12} stackId="a" animationDuration={900} animationEasing="ease-out" />
                <Bar dataKey="naoQualificados" name="Não Qualificados" fill="rgba(255,255,255,0.06)" radius={[0, 4, 4, 0]} barSize={12} stackId="a" animationDuration={900} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">Sem dados suficientes</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Distribuição por Dispositivo */}
        <div className="liquid-glass p-6 rounded-xl border border-white/10 h-[350px]">
          <h3 className="text-lg font-medium text-white mb-6">Dispositivos</h3>
          <div className="h-[250px] w-full">
            {deviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">Sem dados suficientes</div>
            )}
          </div>
        </div>

        {/* Top Estados */}
        {renderHorizontalBar(topStates, "Top Estados (Performance)", "#06b6d4", "#6829c0")}

        {/* Top DDDs */}
        {renderHorizontalBar(topDDD, "Top DDDs (Volume e Qualificação)", "#06b6d4", "#22c55e")}

        {/* Gênero */}
        {renderHorizontalBar(topGenders, "Gênero", "#f59e0b", "#22c55e")}

        {/* Idade */}
        {renderHorizontalBar(topAges, "Idade", "#ef4444", "#06b6d4")}
      </div>
    </div>
  );
};
