import { useState, useEffect, useCallback } from "react";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { LeadFilters } from "@/components/dashboard/LeadFilters";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { LeadDetailModal } from "@/components/dashboard/LeadDetailModal";
import { SheetsConfig } from "@/components/dashboard/SheetsConfig";
import { Lead, Platform, ConversionStatus } from "@/types/lead";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";

import { TiltWrapper } from "@/components/ui/TiltWrapper";
import { MotionToggle } from "@/components/dashboard/MotionToggle";
import { useMotion } from "@/contexts/MotionContext";

const Dashboard = () => {
  const { animationsEnabled } = useMotion();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<Platform | "Todos">("Todos");
  const [statusFilter, setStatusFilter] = useState<ConversionStatus | "Todos">("Todos");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [webhookConfig, setWebhookConfig] = useState<{ fetchUrl: string; updateUrl: string } | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [syncInterval, setSyncInterval] = useState(5); // minutos
  const [hasInitialSync, setHasInitialSync] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("n8n-webhook-config");
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setWebhookConfig(config);
      } catch (error) {
        console.error("Erro ao carregar configuração:", error);
      }
    }
    
    const savedAutoSync = localStorage.getItem("auto-sync-enabled");
    const savedInterval = localStorage.getItem("sync-interval");
    if (savedAutoSync) setAutoSyncEnabled(savedAutoSync === "true");
    if (savedInterval) {
      const interval = parseInt(savedInterval);
      if (!isNaN(interval)) setSyncInterval(interval);
    }
  }, []);

  const syncWithSheets = useCallback(async () => {
    if (!webhookConfig?.fetchUrl) {
      toast({
        title: "Configuração necessária",
        description: "Configure os webhooks do n8n primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch(webhookConfig.fetchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Erro desconhecido");
        throw new Error(`Erro ao sincronizar: ${response.status} - ${errorText}`);
      }

      // Tenta fazer parse do JSON
      let data: any;
      try {
        const text = await response.text();
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Erro ao fazer parse do JSON:", parseError);
        throw new Error("Resposta não é JSON válido.");
      }
      
      let leadsData: Lead[] = [];
      if (Array.isArray(data)) {
        leadsData = data;
      } else if (data && typeof data === 'object' && Array.isArray(data.leads)) {
        leadsData = data.leads;
      } else if (data && typeof data === 'object' && data.id && data.platform) {
        leadsData = [data];
      } else {
        throw new Error(`Formato de dados inválido`);
      }

      setLeads(leadsData);
      setLastSync(new Date());
      
      toast({
        title: "Sincronizado",
        description: `${leadsData.length} lead(s) atualizado(s) com sucesso`,
        className: "bg-success text-success-foreground"
      });
    } catch (error) {
      console.error("Erro na sincronização:", error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível buscar os leads";
      toast({
        title: "Erro na sincronização",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  }, [webhookConfig, toast]);

  // Sincronização automática
  useEffect(() => {
    if (!webhookConfig?.fetchUrl || hasInitialSync) return;
    
    const timer = setTimeout(() => {
      if (webhookConfig?.fetchUrl && syncWithSheets) {
        syncWithSheets();
        setHasInitialSync(true);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [webhookConfig?.fetchUrl, hasInitialSync, syncWithSheets]);

  useEffect(() => {
    if (!autoSyncEnabled || !webhookConfig?.fetchUrl) return;

    const interval = setInterval(() => {
      syncWithSheets();
    }, syncInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoSyncEnabled, syncInterval, webhookConfig, syncWithSheets]);

  const updateLeadStatus = async (leadId: string, status: ConversionStatus) => {
    if (!webhookConfig?.updateUrl) return;

    try {
      const response = await fetch(webhookConfig.updateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, conversion: status })
      });

      if (!response.ok) throw new Error("Erro ao atualizar");
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      throw error;
    }
  };

  const handleQualify = async (leadId: string) => {
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, conversion: "Qualificado" as ConversionStatus } : lead
    ));
    
    try {
      await updateLeadStatus(leadId, "Qualificado");
      toast({
        title: "Lead Qualificado",
        className: "bg-success text-success-foreground"
      });
    } catch (error) {
      // Reverter se necessário...
    }
  };

  const handleDisqualify = async (leadId: string) => {
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, conversion: "Desqualificado" as ConversionStatus } : lead
    ));
    
    try {
      await updateLeadStatus(leadId, "Desqualificado");
      toast({
        title: "Lead Desqualificado",
        className: "bg-success text-success-foreground"
      });
    } catch (error) {
      // Reverter se necessário...
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const toggleAutoSync = () => {
    const newValue = !autoSyncEnabled;
    setAutoSyncEnabled(newValue);
    localStorage.setItem("auto-sync-enabled", String(newValue));
  };

  const updateSyncInterval = (minutes: number) => {
    setSyncInterval(minutes);
    localStorage.setItem("sync-interval", String(minutes));
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
      <MotionToggle />
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
        />
      </div>
    </div>
  );
};

export default Dashboard;
