import React from 'react';
import { Lead } from '@/types/lead';
import { getDevice, extractDDD, topNQual, getGeoFromIP } from '@/utils/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Props {
  leads: Lead[];
}

const COLORS = ['#A855F7', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#64748B'];

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

  // Geo (States)
  const stateRaw = leads.reduce((acc, lead) => {
    const geo = getGeoFromIP(lead.ip_address);
    if (geo.state === 'Não Identificado') return acc;
    if (!acc[geo.state]) acc[geo.state] = { total: 0, qualificados: 0 };
    acc[geo.state].total += 1;
    if (lead.conversion === 'Qualificado') acc[geo.state].qualificados += 1;
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

  const renderHorizontalBar = (data: any[], title: string, fillTotal: string, fillQual: string) => (
    <div className="liquid-glass p-6 rounded-[2rem] border border-white/10 flex flex-col h-[350px]">
      <h3 className="text-lg font-medium text-white mb-6 shrink-0">{title}</h3>
      <div className="flex-1 min-h-0 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 12}} />
              <YAxis dataKey="nome" type="category" stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 11}} width={40} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="qualificados" name="Qualificados" fill={fillQual} radius={[0, 4, 4, 0]} barSize={12} />
              <Bar dataKey="total" name="Total" fill={fillTotal} radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">Sem dados suficientes</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Distribuição por Dispositivo */}
        <div className="liquid-glass p-6 rounded-[2rem] border border-white/10 h-[350px]">
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
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">Sem dados suficientes</div>
            )}
          </div>
        </div>

        {/* Top Estados */}
        {renderHorizontalBar(topStates, "Top Estados (Performance)", "#3B82F6", "#A855F7")}
        
        {/* Top DDDs */}
        {renderHorizontalBar(topDDD, "Top DDDs (Volume e Qualificação)", "#3B82F6", "#10B981")}

        {/* Gênero */}
        {renderHorizontalBar(topGenders, "Gênero", "#F59E0B", "#10B981")}

        {/* Idade */}
        {renderHorizontalBar(topAges, "Idade", "#EF4444", "#3B82F6")}
      </div>
    </div>
  );
};
