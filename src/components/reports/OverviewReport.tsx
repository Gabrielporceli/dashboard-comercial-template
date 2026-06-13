import React from 'react';
import { Lead } from '@/types/lead';
import { DollarSign, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  leads: Lead[];
}

const toMoney = (v: any): number => {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  // suporta "1.500,50" (BR) e "1500.50" (EN)
  const s = String(v).trim();
  const cleaned = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
};

export const OverviewReport = ({ leads }: Props) => {
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l => l.conversion === "Qualificado");
  const revenueTotal = qualifiedLeads.reduce((acc, l) => acc + toMoney(l.conversion_value), 0);
  const averageTicket = qualifiedLeads.length > 0 ? revenueTotal / qualifiedLeads.length : 0;
  const conversionRate = totalLeads > 0 ? (qualifiedLeads.length / totalLeads) * 100 : 0;

  // Evolution Data
  const leadsByDate = leads.reduce((acc, lead) => {
    if (!lead.event_time) return acc;
    const dateStr = lead.event_time.split(' ')[0] || lead.event_time.split('T')[0];
    if (!acc[dateStr]) acc[dateStr] = { date: dateStr, total: 0, qualificados: 0 };
    acc[dateStr].total += 1;
    if (lead.conversion === "Qualificado") {
      acc[dateStr].qualificados += 1;
    }
    return acc;
  }, {} as Record<string, any>);

  const evolutionData = Object.values(leadsByDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      ...item,
      formattedDate: format(new Date(item.date), 'dd/MM', { locale: ptBR })
    }));

  // Duplicate Check
  const phonesSeen: Record<string, number> = {};
  const emailsSeen: Record<string, number> = {};
  
  leads.forEach(l => {
    if (l.phone_number && l.phone_number !== 'Sem Info') {
      const p = l.phone_number.replace(/\D/g, '');
      if (p) phonesSeen[p] = (phonesSeen[p] || 0) + 1;
    }
    if (l.email && l.email !== 'Sem Info') {
      const e = l.email.toLowerCase().trim();
      if (e) emailsSeen[e] = (emailsSeen[e] || 0) + 1;
    }
  });

  const duplicatePhones = Object.values(phonesSeen).filter(c => c > 1).length;
  const duplicateEmails = Object.values(emailsSeen).filter(c => c > 1).length;
  const hasAnomalies = duplicatePhones > 0 || duplicateEmails > 0;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="liquid-glass p-6 rounded-xl border border-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-muted-foreground mb-2">
            <div className="p-2 bg-goat-purple/10 rounded-xl">
              <DollarSign className="w-5 h-5 text-goat-purple" />
            </div>
            <span className="font-medium tracking-wide uppercase text-xs">Receita Total</span>
          </div>
          <span className="text-4xl font-light text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revenueTotal)}
          </span>
        </div>

        <div className="liquid-glass p-6 rounded-xl border border-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-muted-foreground mb-2">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <span className="font-medium tracking-wide uppercase text-xs">Ticket Médio</span>
          </div>
          <span className="text-4xl font-light text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(averageTicket)}
          </span>
        </div>

        <div className="liquid-glass p-6 rounded-xl border border-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-muted-foreground mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="font-medium tracking-wide uppercase text-xs">Taxa de Conversão</span>
          </div>
          <span className="text-4xl font-light text-white">
            {conversionRate.toFixed(1)}%
          </span>
        </div>
      </div>

      {hasAnomalies && (
        <div className="liquid-glass p-4 rounded-[1.5rem] border border-orange-500/30 flex items-start gap-4">
          <AlertTriangle className="text-orange-500 w-6 h-6 shrink-0 mt-1" />
          <div>
            <h4 className="text-orange-500 font-medium mb-1">Atenção: Dados Duplicados Detectados</h4>
            <p className="text-sm text-muted-foreground">
              Foram encontrados <strong>{duplicatePhones} telefones</strong> e <strong>{duplicateEmails} emails</strong> repetidos. Isso pode indicar dupla submissão de formulário ou erro na integração.
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="liquid-glass p-6 rounded-xl border border-white/10">
        <h3 className="text-lg font-medium text-white mb-6">Evolução de Captação</h3>
        <div className="h-[350px] w-full">
          {evolutionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorQual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6829c0" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6829c0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="formattedDate" stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 12}} />
                <YAxis stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="total" name="Total de Leads" stroke="#06b6d4" fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="qualificados" name="Leads Qualificados" stroke="#6829c0" fillOpacity={1} fill="url(#colorQual)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">Sem dados suficientes</div>
          )}
        </div>
      </div>
    </div>
  );
};
