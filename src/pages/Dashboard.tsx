import { useState } from "react";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { LeadFilters, DatePreset } from "@/components/dashboard/LeadFilters";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { LeadDetailModal } from "@/components/dashboard/LeadDetailModal";
import { SheetsConfig } from "@/components/dashboard/SheetsConfig";
import { Lead, Platform, ConversionStatus } from "@/types/lead";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock, Download } from "lucide-react";
import { parseEventTime } from "@/utils/analytics";

import { MotionToggle } from "@/components/dashboard/MotionToggle";
import { ReportsButton } from "@/components/dashboard/ReportsButton";
import { useMotion } from "@/contexts/MotionContext";
import { useLeads } from "@/contexts/LeadContext";

function getDateRange(
  preset: DatePreset,
  customStart: string,
  customEnd: string
): { start: Date | null; end: Date | null } {
  const now = new Date();

  if (preset === 'todos') return { start: null, end: null };

  if (preset === 'hoje') {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
      end:   new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
    };
  }

  if (preset === 'semana') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return {
      start,
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
    };
  }

  if (preset === 'mes') {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0),
      end:   new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
    };
  }

  if (preset === 'mes_passado') {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0),
      end:   new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
    };
  }

  if (preset === 'custom' && customStart && customEnd) {
    const [sy, sm, sd] = customStart.split('-').map(Number);
    const [ey, em, ed] = customEnd.split('-').map(Number);
    return {
      start: new Date(sy, sm - 1, sd, 0, 0, 0),
      end:   new Date(ey, em - 1, ed, 23, 59, 59),
    };
  }

  return { start: null, end: null };
}

function formatDateBR(raw?: string | null): string {
  if (!raw) return '';
  const d = parseEventTime(raw);
  if (!d) return raw;
  const dd   = String(d.getDate()).padStart(2, '0');
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function csvClean(val?: string | number | null): string {
  if (val === null || val === undefined) return '';
  const s = String(val).trim();
  if (s === '' || s.toLowerCase() === 'sem info') return '';
  return s.replace(/[\r\n]+/g, ' ');
}

function exportToCSV(leads: Lead[]) {
  const SEP = ';'; // Excel pt-BR usa ponto-e-vírgula

  const headers = [
    'Data', 'Hora', 'Nome', 'Telefone', 'Email', 'Plataforma',
    'Campanha', 'Conjunto de Anúncio', 'Anúncio', 'Status',
    'Atendimento N°', 'Produto', 'Observação', 'Gênero', 'Idade',
    'Valor de Conversão', 'Moeda',
  ];

  const rows = leads.map(l => [
    formatDateBR(l.event_time),
    csvClean(l.hora_min),
    csvClean(l.name),
    csvClean(l.phone_number),
    csvClean(l.email),
    csvClean(l.platform),
    csvClean(l.campaign),
    csvClean(l.ad_set),
    csvClean(l.ad),
    csvClean(l.conversion),
    csvClean(l.attendance_number),
    csvClean(l.product),
    csvClean(l.obs),
    csvClean(l.gender),
    l.age != null && l.age !== '' ? String(l.age) : '',
    l.conversion_value != null ? String(l.conversion_value).replace('.', ',') : '',
    csvClean(l.currency_code),
  ]);

  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;

  const csvContent = [headers, ...rows]
    .map(row => row.map(escape).join(SEP))
    .join('\r\n');

  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `leads_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const Dashboard = () => {
  const { animationsEnabled } = useMotion();
  const {
    leads,
    isSyncing,
    lastSync,
    webhookConfig,
    autoSyncEnabled,
    syncInterval,
    syncWithSheets,
    setWebhookConfig,
    toggleAutoSync,
    updateSyncInterval,
    handleUpdateLead,
    handleQualify,
    handleDisqualify,
  } = useLeads();

  const [searchTerm, setSearchTerm]       = useState("");
  const [platformFilter, setPlatformFilter] = useState<Platform | "Todos">("Todos");
  const [statusFilter, setStatusFilter]   = useState<ConversionStatus | "Todos">("Todos");
  const [datePreset, setDatePreset]       = useState<DatePreset>('todos');
  const [customStart, setCustomStart]     = useState('');
  const [customEnd, setCustomEnd]         = useState('');
  const [selectedLead, setSelectedLead]   = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen]     = useState(false);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const { start: dateStart, end: dateEnd } = getDateRange(datePreset, customStart, customEnd);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone_number.includes(searchTerm) ||
      lead.campaign.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlatform = platformFilter === "Todos" || lead.platform === platformFilter;
    const matchesStatus   = statusFilter   === "Todos" || lead.conversion === statusFilter;

    let matchesDate = true;
    if (dateStart && dateEnd) {
      const leadDate = parseEventTime(lead.event_time);
      matchesDate = leadDate !== null && leadDate >= dateStart && leadDate <= dateEnd;
    }

    return matchesSearch && matchesPlatform && matchesStatus && matchesDate;
  });

  return (
    <div className={`relative min-h-screen ${!animationsEnabled ? 'disable-motion' : ''}`}>
      <div className="fixed top-8 left-8 z-[100] flex flex-col gap-4">
        <MotionToggle />
        <ReportsButton />
      </div>

      <div className="liquid-container" aria-hidden="true" />

      <div className="container relative mx-auto py-10 px-6 z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-4xl font-light tracking-tight text-white">Painel Comercial | Porceli Tracking</h1>

            <div className="flex items-center flex-wrap gap-4">
              {lastSync && (
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm text-sm font-medium">
                  <Clock className="h-4 w-4 text-goat-purple" />
                  <span className="text-muted-foreground">
                    Última Atualização:{" "}
                    <span className="text-foreground">
                      {lastSync.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                  {autoSyncEnabled && (
                    <span className="flex items-center gap-1.5 text-[10px] bg-goat-purple/20 text-goat-purple px-2 py-0.5 rounded-full border border-goat-purple/30">
                      <span className="w-1 h-1 bg-goat-purple rounded-full animate-pulse" />
                      AUTO {syncInterval}MIN
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={syncWithSheets}
                  disabled={isSyncing || !webhookConfig}
                  title="Sincronizar"
                  className="btn-spring h-11 w-11 rounded-2xl liquid-glass border-white/5 flex items-center justify-center hover:-translate-y-0.5 hover:scale-105 hover:bg-white/[0.02] disabled:opacity-40 disabled:pointer-events-none"
                >
                  <RefreshCw className={`h-4 w-4 transition-colors ${isSyncing ? 'animate-spin text-primary' : 'text-white/70'}`} />
                </button>

                <SheetsConfig
                  onConfigSave={setWebhookConfig}
                  autoSyncEnabled={autoSyncEnabled}
                  syncInterval={syncInterval}
                  onToggleAutoSync={toggleAutoSync}
                  onUpdateInterval={updateSyncInterval}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <MetricsCards leads={filteredLeads} />
        </section>

        {/* Filters */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="liquid-glass p-1 rounded-xl">
            <LeadFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              platformFilter={platformFilter}
              onPlatformChange={setPlatformFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              datePreset={datePreset}
              onDatePresetChange={setDatePreset}
              customStart={customStart}
              customEnd={customEnd}
              onCustomStartChange={setCustomStart}
              onCustomEndChange={setCustomEnd}
            />
          </div>
        </div>

        {/* Table toolbar */}
        <div className="flex items-center justify-between mt-6 mb-2 px-1">
          <span className="text-sm text-muted-foreground">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} encontrado{filteredLeads.length !== 1 ? 's' : ''}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(filteredLeads)}
            disabled={filteredLeads.length === 0}
            className="liquid-glass border-white/10 hover:bg-white/10 text-sm gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Table */}
          <LeadsTable
            leads={filteredLeads}
            onLeadClick={handleLeadClick}
            onQualify={handleQualify}
            onDisqualify={handleDisqualify}
          />

        {/* Detail Modal */}
        <LeadDetailModal
          lead={selectedLead}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateLead}
        />
      </div>
    </div>
  );
};

export default Dashboard;
