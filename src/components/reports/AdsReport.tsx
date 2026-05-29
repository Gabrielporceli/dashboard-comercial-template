import React from 'react';
import { Lead } from '@/types/lead';
import { topNQual, norm } from '@/utils/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Props {
  leads: Lead[];
}

const COLORS = ['#A855F7', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export const AdsReport = ({ leads }: Props) => {
  const metaLeads = leads.filter(l => norm(l.platform) === 'Meta');
  const googleLeads = leads.filter(l => norm(l.platform) === 'Google');
  
  // Platform Split
  const platformData = [
    { name: 'Meta', value: metaLeads.length },
    { name: 'Google', value: googleLeads.length },
    { name: 'Outros', value: leads.length - metaLeads.length - googleLeads.length }
  ].filter(d => d.value > 0);

  // Meta Analysis
  const metaCamp = metaLeads.reduce((acc, lead) => {
    const c = norm(lead.campaign, 'Sem campanha');
    if (!acc[c]) acc[c] = { total: 0, qualificados: 0 };
    acc[c].total += 1;
    if (lead.conversion === 'Qualificado') acc[c].qualificados += 1;
    return acc;
  }, {} as Record<string, { total: number, qualificados: number }>);
  
  const metaAds = metaLeads.reduce((acc, lead) => {
    const a = norm(lead.ad, 'Sem anúncio');
    if (!acc[a]) acc[a] = { total: 0, qualificados: 0 };
    acc[a].total += 1;
    if (lead.conversion === 'Qualificado') acc[a].qualificados += 1;
    return acc;
  }, {} as Record<string, { total: number, qualificados: number }>);

  const topMetaCamp = topNQual(metaCamp, 5);
  const topMetaAds = topNQual(metaAds, 5);

  // Google Analysis
  const googleKeywords = googleLeads.reduce((acc, lead) => {
    const k = norm(lead.keyword, 'Sem keyword');
    if (!acc[k]) acc[k] = { total: 0, qualificados: 0 };
    acc[k].total += 1;
    if (lead.conversion === 'Qualificado') acc[k].qualificados += 1;
    return acc;
  }, {} as Record<string, { total: number, qualificados: number }>);

  const topGoogleKeywords = topNQual(googleKeywords, 5);

  const renderHorizontalBar = (data: any[], title: string, fillTotal: string, fillQual: string) => (
    <div className="liquid-glass p-6 rounded-[2rem] border border-white/10 flex flex-col h-[350px]">
      <h3 className="text-lg font-medium text-white mb-6 shrink-0">{title}</h3>
      <div className="flex-1 min-h-0 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 12}} />
              <YAxis dataKey="nome" type="category" stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 11}} width={100} />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Distribuição por Plataforma */}
        <div className="liquid-glass p-6 rounded-[2rem] border border-white/10 h-[350px]">
          <h3 className="text-lg font-medium text-white mb-6">Volume por Plataforma</h3>
          <div className="h-[250px] w-full">
            {platformData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {platformData.map((entry, index) => (
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

        {/* Top Keywords Google */}
        {renderHorizontalBar(topGoogleKeywords, "Top Palavras-Chave (Google)", "#3B82F6", "#A855F7")}
        
        {/* Top Campaigns Meta */}
        {renderHorizontalBar(topMetaCamp, "Top Campanhas (Meta)", "#3B82F6", "#A855F7")}

        {/* Top Ads Meta */}
        {renderHorizontalBar(topMetaAds, "Top Anúncios / Criativos (Meta)", "#3B82F6", "#10B981")}

      </div>
    </div>
  );
};
