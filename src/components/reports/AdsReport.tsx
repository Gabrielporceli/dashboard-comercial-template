import React from 'react';
import { Lead } from '@/types/lead';
import { topNQual, norm } from '@/utils/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LabelList } from 'recharts';

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

function toNumber(v?: string | number | null): number {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  // suporta "1.500,50" (BR) e "1500.50" (EN)
  const s = String(v).trim().replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function fmtBRL(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

interface Props {
  leads: Lead[];
}

const COLORS = ['#6829c0', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'];

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

  // ── Retorno por Palavra-Chave ──────────────────────────────────────────────
  // Inclui todos os leads com keyword preenchida (Google e outros)
  type KwRow = { nome: string; leads: number; qualificados: number; taxa: number; receita: number; ticketMedio: number; };

  const kwMap = leads.reduce((acc, lead) => {
    const kw = lead.keyword ? String(lead.keyword).trim() : '';
    if (!kw || kw.toLowerCase() === 'sem info') return acc;
    if (!acc[kw]) acc[kw] = { leads: 0, qualificados: 0, receita: 0 };
    acc[kw].leads += 1;
    if (lead.conversion === 'Qualificado') acc[kw].qualificados += 1;
    acc[kw].receita += toNumber(lead.conversion_value);
    return acc;
  }, {} as Record<string, { leads: number; qualificados: number; receita: number }>);

  const kwRows: KwRow[] = Object.entries(kwMap)
    .map(([nome, v]) => ({
      nome,
      leads: v.leads,
      qualificados: v.qualificados,
      taxa: v.leads > 0 ? (v.qualificados / v.leads) * 100 : 0,
      receita: v.receita,
      ticketMedio: v.qualificados > 0 ? v.receita / v.qualificados : 0,
    }))
    .sort((a, b) => b.receita - a.receita || b.leads - a.leads);

  // Top 8 por receita para o gráfico (apenas kws com receita > 0)
  const kwChartData = kwRows
    .filter(r => r.receita > 0)
    .slice(0, 8)
    .map(r => ({ ...r, nome: r.nome.length > 22 ? r.nome.slice(0, 20) + '…' : r.nome }));

  const totalReceita = kwRows.reduce((s, r) => s + r.receita, 0);

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
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 8, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="nome" type="category" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} width={100} axisLine={false} tickLine={false} />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Distribuição por Plataforma */}
        <div className="liquid-glass p-6 rounded-xl border border-white/10 h-[350px]">
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
                  <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">Sem dados suficientes</div>
            )}
          </div>
        </div>

        {/* Top Keywords Google */}
        {renderHorizontalBar(topGoogleKeywords, "Top Palavras-Chave (Google)", "#06b6d4", "#6829c0")}

        {/* Top Campaigns Meta */}
        {renderHorizontalBar(topMetaCamp, "Top Campanhas (Meta)", "#06b6d4", "#6829c0")}

        {/* Top Ads Meta */}
        {renderHorizontalBar(topMetaAds, "Top Anúncios / Criativos (Meta)", "#06b6d4", "#22c55e")}

      </div>

      {/* ── Retorno por Palavra-Chave ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-medium text-white">Retorno por Palavra-Chave</h2>
          {totalReceita > 0 && (
            <span className="text-sm text-muted-foreground">
              Total rastreado: <span className="text-green-400 font-semibold">{fmtBRL(totalReceita)}</span>
            </span>
          )}
        </div>

        {kwRows.length === 0 ? (
          <div className="liquid-glass p-8 rounded-xl border border-white/10 flex items-center justify-center text-muted-foreground">
            Sem palavras-chave com dados suficientes
          </div>
        ) : (
          <>
            {/* Gráfico de receita por keyword */}
            {kwChartData.length > 0 && (
              <div className="liquid-glass p-6 rounded-xl border border-white/10 h-[360px] flex flex-col">
                <h3 className="text-base font-medium text-white mb-4 shrink-0">Receita Total por Keyword (top 8)</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kwChartData} layout="vertical" margin={{ top: 0, right: 80, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis
                        type="number"
                        stroke="transparent"
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`}
                      />
                      <YAxis
                        dataKey="nome"
                        type="category"
                        stroke="transparent"
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={130}
                      />
                      <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} formatter={(value: number) => [fmtBRL(value), 'Receita']} />
                      <Bar dataKey="receita" name="Receita" fill="#38A169" radius={[0, 6, 6, 0]} barSize={22} animationDuration={900} animationEasing="ease-out">
                        <LabelList
                          dataKey="receita"
                          position="right"
                          style={{ fill: 'rgba(56,161,105,0.8)', fontSize: 11, fontWeight: 600 }}
                          formatter={(v: number) => fmtBRL(v)}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Tabela detalhada */}
            <div className="liquid-glass rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Palavra-Chave</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Leads</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qualificados</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Taxa Conv.</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Receita Total</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ticket Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kwRows.map((row, i) => (
                      <tr key={row.nome} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i === 0 && row.receita > 0 ? 'bg-green-500/5' : ''}`}>
                        <td className="px-5 py-3 font-medium text-white max-w-[200px]">
                          <span className="truncate block" title={row.nome}>{row.nome}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{row.leads}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={row.qualificados > 0 ? 'text-green-400 font-medium' : 'text-muted-foreground'}>
                            {row.qualificados}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            row.taxa >= 50 ? 'bg-green-500/20 text-green-400' :
                            row.taxa >= 25 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-white/10 text-muted-foreground'
                          }`}>
                            {row.taxa.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={row.receita > 0 ? 'text-green-400 font-semibold' : 'text-muted-foreground'}>
                            {row.receita > 0 ? fmtBRL(row.receita) : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-muted-foreground">
                          {row.ticketMedio > 0 ? fmtBRL(row.ticketMedio) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {kwRows.length > 1 && totalReceita > 0 && (
                    <tfoot>
                      <tr className="border-t border-white/10 bg-white/5">
                        <td className="px-5 py-3 font-semibold text-white">Total</td>
                        <td className="px-4 py-3 text-center text-muted-foreground font-medium">{kwRows.reduce((s, r) => s + r.leads, 0)}</td>
                        <td className="px-4 py-3 text-center text-green-400 font-medium">{kwRows.reduce((s, r) => s + r.qualificados, 0)}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">—</td>
                        <td className="px-5 py-3 text-right text-green-400 font-bold">{fmtBRL(totalReceita)}</td>
                        <td className="px-5 py-3 text-right text-muted-foreground">—</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
