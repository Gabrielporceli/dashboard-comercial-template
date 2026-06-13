import React from 'react';
import { Lead } from '@/types/lead';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { norm } from '@/utils/analytics';

interface Props {
  leads: Lead[];
}

const COLORS = ['#6829c0', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#64748b'];

function getAgeBracket(age?: string | number | null): string {
  if (age === null || age === undefined || age === '') return 'Não Identificado';
  const n = Number(age);
  if (isNaN(n)) return 'Não Identificado';
  if (n < 18) return '< 18';
  if (n <= 24) return '18–24';
  if (n <= 34) return '25–34';
  if (n <= 44) return '35–44';
  if (n <= 54) return '45–54';
  return '55+';
}

const AGE_ORDER = ['< 18', '18–24', '25–34', '35–44', '45–54', '55+'];

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const toMoney = (v: any): number => {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  const s = String(v).trim().replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
};

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

const cursorStyle = { fill: 'rgba(255,255,255,0.03)' };
const axisProps = { stroke: 'transparent', tick: { fill: 'rgba(255,255,255,0.35)', fontSize: 11 }, axisLine: false, tickLine: false } as const;
const gridProps = { strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.05)' } as const;

export const CommercialReport = ({ leads }: Props) => {
  const total       = leads.length;
  const treated     = leads.filter(l => l.conversion !== 'Sem Info').length;
  const qualified   = leads.filter(l => l.conversion === 'Qualificado').length;
  const disqualified = leads.filter(l => l.conversion === 'Desqualificado').length;
  const untreated   = total - treated;

  // ── Gender ────────────────────────────────────────────────────────────
  const genderMap: Record<string, { total: number; qual: number }> = {};
  leads.forEach(l => {
    const g = norm(l.gender, 'Não Identificado');
    if (!genderMap[g]) genderMap[g] = { total: 0, qual: 0 };
    genderMap[g].total++;
    if (l.conversion === 'Qualificado') genderMap[g].qual++;
  });
  const genderData = Object.entries(genderMap)
    .map(([name, d]) => ({
      name,
      total: d.total,
      qualificados: d.qual,
      taxa: d.total ? +((d.qual / d.total) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // ── Age brackets ──────────────────────────────────────────────────────
  const ageMap: Record<string, { total: number; qual: number }> = {};
  leads.forEach(l => {
    const bracket = getAgeBracket(l.age);
    if (!ageMap[bracket]) ageMap[bracket] = { total: 0, qual: 0 };
    ageMap[bracket].total++;
    if (l.conversion === 'Qualificado') ageMap[bracket].qual++;
  });
  const ageData = AGE_ORDER
    .filter(b => ageMap[b])
    .map(b => ({
      name: b,
      total: ageMap[b].total,
      qualificados: ageMap[b].qual,
      taxa: ageMap[b].total ? +((ageMap[b].qual / ageMap[b].total) * 100).toFixed(1) : 0,
    }));

  // ── Product ───────────────────────────────────────────────────────────
  const productMap: Record<string, { total: number; qual: number; revenue: number }> = {};
  leads.forEach(l => {
    const p = norm(l.product, 'Não Identificado');
    if (!productMap[p]) productMap[p] = { total: 0, qual: 0, revenue: 0 };
    productMap[p].total++;
    if (l.conversion === 'Qualificado') {
      productMap[p].qual++;
      productMap[p].revenue += toMoney(l.conversion_value);
    }
  });
  const productData = Object.entries(productMap)
    .map(([name, d]) => ({
      name,
      total: d.total,
      qualificados: d.qual,
      receita: d.revenue,
      ticketMedio: d.qual > 0 ? +(d.revenue / d.qual).toFixed(2) : 0,
      taxa: d.total ? +((d.qual / d.total) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const productWithTicket = productData.filter(p => p.ticketMedio > 0);

  // ── Loss reasons ──────────────────────────────────────────────────────
  const lossMap: Record<string, number> = {};
  leads.filter(l => l.conversion === 'Desqualificado').forEach(l => {
    const r = norm(l.obs, 'Sem motivo');
    lossMap[r] = (lossMap[r] || 0) + 1;
  });
  const lossData = Object.entries(lossMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // ── Gender × Product matrix ───────────────────────────────────────────
  const topProducts = productData.slice(0, 5).map(p => p.name);
  const topGenders  = genderData.slice(0, 3).map(g => g.name);

  const genderProductMatrix: Record<string, Record<string, number>> = {};
  leads.forEach(l => {
    const g = norm(l.gender, 'Não Identificado');
    const p = norm(l.product, 'Não Identificado');
    if (!topGenders.includes(g) || !topProducts.includes(p)) return;
    if (!genderProductMatrix[g]) genderProductMatrix[g] = {};
    genderProductMatrix[g][p] = (genderProductMatrix[g][p] || 0) + 1;
  });

  // ── Age × Product matrix ──────────────────────────────────────────────
  const topAges = ageData.slice(0, 4).map(a => a.name);

  const ageProductMatrix: Record<string, Record<string, number>> = {};
  leads.forEach(l => {
    const a = getAgeBracket(l.age);
    const p = norm(l.product, 'Não Identificado');
    if (!topAges.includes(a) || !topProducts.includes(p)) return;
    if (!ageProductMatrix[a]) ageProductMatrix[a] = {};
    ageProductMatrix[a][p] = (ageProductMatrix[a][p] || 0) + 1;
  });

  // ── Helpers ───────────────────────────────────────────────────────────
  const treatedPct   = total > 0 ? (treated   / total) * 100 : 0;
  const qualifiedPct = total > 0 ? (qualified / total) * 100 : 0;

  const MatrixTable = ({
    title,
    rows,
    cols,
    matrix,
  }: {
    title: string;
    rows: string[];
    cols: string[];
    matrix: Record<string, Record<string, number>>;
  }) => (
    <div className="liquid-glass p-6 rounded-xl border border-white/10">
      <h3 className="text-lg font-medium text-white mb-6">{title}</h3>
      {rows.length > 0 && cols.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-muted-foreground font-medium pb-3 pr-4">Produto</th>
                {cols.map(c => (
                  <th key={c} className="text-center text-muted-foreground font-medium pb-3 px-2 whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, pi) => (
                <tr key={row} className="border-t border-white/5">
                  <td className="py-2.5 pr-4 text-white font-medium max-w-[120px] truncate" title={row}>
                    {row}
                  </td>
                  {cols.map(col => {
                    const val = matrix[col]?.[row] || 0;
                    return (
                      <td key={col} className="text-center py-2.5 px-2">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: val > 0 ? `${COLORS[pi % COLORS.length]}33` : 'transparent',
                            color: val > 0 ? COLORS[pi % COLORS.length] : '#ffffff30',
                          }}
                        >
                          {val > 0 ? val : '—'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
          Sem dados suficientes
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Funil ─────────────────────────────────────────────────────── */}
      <div className="liquid-glass p-6 rounded-xl border border-white/10">
        <h3 className="text-lg font-medium text-white mb-6">Funil de Conversão</h3>
        <div className="space-y-5">
          {[
            { label: 'Total de Leads captados', value: total,     pct: 100,          color: '#06b6d4' },
            { label: 'Tratados (classificados)', value: treated,   pct: treatedPct,   color: '#6829c0' },
            { label: 'Qualificados',             value: qualified, pct: qualifiedPct, color: '#22c55e' },
          ].map(step => (
            <div key={step.label} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{step.label}</span>
                <span className="font-semibold text-white">
                  {step.value}
                  <span className="text-xs text-muted-foreground font-normal ml-1.5">
                    ({step.pct.toFixed(1)}%)
                  </span>
                </span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${step.pct}%`, backgroundColor: step.color, transition: 'width 0.7s ease' }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap gap-6 text-xs text-muted-foreground">
          <span>Desqualificados: <strong className="text-white">{disqualified}</strong></span>
          <span>Sem tratamento: <strong className="text-white">{untreated}</strong></span>
          <span>
            Taxa de aproveitamento:{' '}
            <strong className="text-white">
              {treated > 0 ? ((qualified / treated) * 100).toFixed(1) : '0'}%
            </strong>
            <span className="ml-1">(qualif. / tratados)</span>
          </span>
        </div>
      </div>

      {/* ── Gênero + Faixa Etária ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="liquid-glass p-6 rounded-xl border border-white/10 h-[320px] flex flex-col">
          <h3 className="text-lg font-medium text-white mb-1 shrink-0">Taxa de Conversão por Gênero</h3>
          <p className="text-xs text-muted-foreground mb-4 shrink-0">% de leads qualificados dentro de cada gênero</p>
          <div className="flex-1 min-h-0">
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genderData} layout="vertical" margin={{ top: 0, right: 50, left: 10, bottom: 0 }}>
                  <CartesianGrid {...gridProps} horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} unit="%" {...axisProps} />
                  <YAxis dataKey="name" type="category" {...axisProps} width={90} />
                  <RechartsTooltip content={<ChartTooltip />} cursor={cursorStyle} formatter={(v: any) => [`${v}%`, 'Taxa de Conversão']} />
                  <Bar dataKey="taxa" name="Taxa" radius={[0, 6, 6, 0]} barSize={26} animationDuration={900} animationEasing="ease-out" label={{ position: 'right', fill: 'rgba(255,255,255,0.5)', fontSize: 11, formatter: (v: number) => `${v}%` }}>
                    {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Sem dados de gênero</div>
            )}
          </div>
        </div>

        <div className="liquid-glass p-6 rounded-xl border border-white/10 h-[320px] flex flex-col">
          <h3 className="text-lg font-medium text-white mb-1 shrink-0">Taxa de Conversão por Faixa Etária</h3>
          <p className="text-xs text-muted-foreground mb-4 shrink-0">% de qualificados por faixa de idade</p>
          <div className="flex-1 min-h-0">
            {ageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid {...gridProps} vertical={false} />
                  <XAxis dataKey="name" {...axisProps} />
                  <YAxis domain={[0, 100]} unit="%" {...axisProps} />
                  <RechartsTooltip content={<ChartTooltip />} cursor={cursorStyle} formatter={(v: any, name: string) => name === 'taxa' ? [`${v}%`, 'Taxa de Conversão'] : [v, name]} />
                  <Bar dataKey="taxa" name="taxa" radius={[6, 6, 0, 0]} barSize={36} animationDuration={900} animationEasing="ease-out" label={{ position: 'top', fill: 'rgba(255,255,255,0.5)', fontSize: 11, formatter: (v: number) => v > 0 ? `${v}%` : '' }}>
                    {ageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Sem dados de idade</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Volume + Ticket Médio por Produto ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="liquid-glass p-6 rounded-xl border border-white/10 h-[350px] flex flex-col">
          <h3 className="text-lg font-medium text-white mb-1 shrink-0">Volume e Qualificação por Produto</h3>
          <p className="text-xs text-muted-foreground mb-4 shrink-0">Total de leads e qualificados por produto</p>
          <div className="flex-1 min-h-0">
            {productData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData.map(d => ({ ...d, naoQualificados: d.total - d.qualificados }))} layout="vertical" margin={{ top: 0, right: 8, left: 10, bottom: 0 }}>
                  <CartesianGrid {...gridProps} horizontal={false} />
                  <XAxis type="number" {...axisProps} />
                  <YAxis dataKey="name" type="category" {...axisProps} width={95} />
                  <RechartsTooltip content={<ChartTooltip />} cursor={cursorStyle} />
                  <Bar dataKey="qualificados" name="Qualificados" fill="#38A169" radius={[0, 0, 0, 0]} barSize={10} stackId="a" animationDuration={900} animationEasing="ease-out" />
                  <Bar dataKey="naoQualificados" name="Não Qualificados" fill="rgba(255,255,255,0.06)" radius={[0, 4, 4, 0]} barSize={10} stackId="a" animationDuration={900} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Sem dados de produto</div>
            )}
          </div>
        </div>

        <div className="liquid-glass p-6 rounded-xl border border-white/10 h-[350px] flex flex-col">
          <h3 className="text-lg font-medium text-white mb-1 shrink-0">Ticket Médio por Produto</h3>
          <p className="text-xs text-muted-foreground mb-4 shrink-0">Valor médio dos leads qualificados com valor de conversão</p>
          <div className="flex-1 min-h-0">
            {productWithTicket.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productWithTicket} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid {...gridProps} horizontal={false} />
                  <XAxis type="number" {...axisProps} tickFormatter={v => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`} />
                  <YAxis dataKey="name" type="category" {...axisProps} width={95} />
                  <RechartsTooltip content={<ChartTooltip />} cursor={cursorStyle} formatter={(v: any) => [fmtCurrency(Number(v)), 'Ticket Médio']} />
                  <Bar dataKey="ticketMedio" name="Ticket Médio" radius={[0, 6, 6, 0]} barSize={20} animationDuration={900} animationEasing="ease-out">
                    {productWithTicket.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Nenhum valor de conversão registrado
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Motivos de Perda ──────────────────────────────────────────── */}
      <div className="liquid-glass p-6 rounded-xl border border-white/10 h-[300px] flex flex-col">
        <h3 className="text-lg font-medium text-white mb-1 shrink-0">Top Motivos de Perda</h3>
        <p className="text-xs text-muted-foreground mb-4 shrink-0">Observações registradas nos leads desqualificados</p>
        <div className="flex-1 min-h-0">
          {lossData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lossData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid {...gridProps} horizontal={false} />
                <XAxis type="number" {...axisProps} />
                <YAxis dataKey="name" type="category" {...axisProps} width={150} />
                <RechartsTooltip content={<ChartTooltip />} cursor={cursorStyle} formatter={(v: any) => [v, 'Leads']} />
                <Bar dataKey="value" name="Leads" radius={[0, 6, 6, 0]} barSize={16} animationDuration={900} animationEasing="ease-out">
                  {lossData.map((_, i) => (
                    <Cell key={i} fill={`rgba(197,48,48,${Math.max(0.35, 1 - i * 0.08)})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Nenhum motivo de perda registrado
            </div>
          )}
        </div>
      </div>

      {/* ── Matrizes cruzadas ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MatrixTable
          title="Gênero × Produto"
          rows={topProducts}
          cols={topGenders}
          matrix={genderProductMatrix}
        />
        <MatrixTable
          title="Faixa Etária × Produto"
          rows={topProducts}
          cols={topAges}
          matrix={ageProductMatrix}
        />
      </div>

    </div>
  );
};
