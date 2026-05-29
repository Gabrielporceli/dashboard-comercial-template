import { useState } from "react";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { LeadFilters } from "@/components/dashboard/LeadFilters";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { LeadDetailModal } from "@/components/dashboard/LeadDetailModal";
import { SheetsConfig } from "@/components/dashboard/SheetsConfig";
import { Lead, Platform, ConversionStatus } from "@/types/lead";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";

import { TiltWrapper } from "@/components/ui/TiltWrapper";
import { MotionToggle } from "@/components/dashboard/MotionToggle";
import { ReportsButton } from "@/components/dashboard/ReportsButton";
import { useMotion } from "@/contexts/MotionContext";
import { useLeads } from "@/contexts/LeadContext";

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

  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<Platform | "Todos">("Todos");
  const [statusFilter, setStatusFilter] = useState<ConversionStatus | "Todos">("Todos");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone_number.includes(searchTerm) ||
      lead.campaign.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlatform = platformFilter === "Todos" || lead.platform === platformFilter;
    const matchesStatus = statusFilter === "Todos" || lead.conversion === statusFilter;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  return (
    <div className={`relative min-h-screen ${!animationsEnabled ? 'disable-motion' : ''}`}>
      <div className="fixed top-8 left-8 z-[100] flex flex-col gap-4">
        <MotionToggle />
        <ReportsButton />
      </div>
      {/* Background Liquid Effect Container */}
      <div className="liquid-container" aria-hidden="true" />
      
      <div className="container relative mx-auto py-10 px-6 z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-4xl font-light tracking-tight gradient-text">Painel Comercial | Porceli Tracking</h1>
            
            <div className="flex items-center flex-wrap gap-4">
              {lastSync && (
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm text-sm font-medium">
                  <Clock className="h-4 w-4 text-goat-purple" />
                  <span className="text-muted-foreground">Última Atualização: <span className="text-foreground">{lastSync.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></span>
                  {autoSyncEnabled && (
                    <span className="flex items-center gap-1.5 text-[10px] bg-goat-purple/20 text-goat-purple px-2 py-0.5 rounded-full border border-goat-purple/30">
                      <span className="w-1 h-1 bg-goat-purple rounded-full animate-pulse" />
                      AUTO {syncInterval}MIN
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={syncWithSheets}
                  disabled={isSyncing || !webhookConfig}
                  className="liquid-glass bg-goat-purple/60 hover:bg-goat-purple/80 border-white/20"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sincronizar
                </Button>
                
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

        {/* Metrics Section */}
        <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <MetricsCards leads={filteredLeads} />
        </section>

        {/* Content Section */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="liquid-glass p-1 rounded-[2rem]">
            <LeadFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              platformFilter={platformFilter}
              onPlatformChange={setPlatformFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
            />
          </div>
        </div>

        {/* Table */}
        <TiltWrapper className="mt-6">
          <LeadsTable
            leads={filteredLeads}
            onLeadClick={handleLeadClick}
            onQualify={handleQualify}
            onDisqualify={handleDisqualify}
          />
        </TiltWrapper>

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
