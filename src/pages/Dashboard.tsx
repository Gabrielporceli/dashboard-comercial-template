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

const Dashboard = () => {
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
        // Tenta fazer parse do JSON
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Erro ao fazer parse do JSON:", parseError);
        throw new Error("Resposta não é JSON válido. Verifique se o webhook está retornando JSON corretamente.");
      }
      
      // Debug: log do que foi recebido
      console.log("🔍 DEBUG - Dados recebidos do webhook:", {
        tipo: typeof data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'N/A',
        keys: data && typeof data === 'object' && !Array.isArray(data) ? Object.keys(data) : null,
        preview: Array.isArray(data) ? `Array com ${data.length} itens` : JSON.stringify(data).substring(0, 500),
        rawData: data // Log completo para debug
      });
      
      // Validação: verifica se é um array, objeto com propriedade leads, ou objeto único
      let leadsData: Lead[] = [];
      if (Array.isArray(data)) {
        // Formato 1: Array direto de leads
        leadsData = data;
        console.log(`✅ Array recebido com ${leadsData.length} lead(s)`);
        console.log("📋 IDs dos leads recebidos:", leadsData.map(l => l.id).join(", "));
      } else if (data && typeof data === 'object' && Array.isArray(data.leads)) {
        // Formato 2: Objeto com propriedade 'leads' que é um array
        leadsData = data.leads;
        console.log(`✅ Objeto com propriedade 'leads' recebido com ${leadsData.length} lead(s)`);
        console.log("📋 IDs dos leads recebidos:", leadsData.map(l => l.id).join(", "));
      } else if (data && typeof data === 'object' && data.id && data.platform) {
        // Formato 3: Objeto único (um lead) - converte para array
        console.log("⚠️ Recebido objeto único, convertendo para array");
        console.log("📋 ID do lead recebido:", data.id);
        leadsData = [data];
      } else {
        const errorDetails = `Tipo recebido: ${typeof data}, É array: ${Array.isArray(data)}, Chaves: ${data && typeof data === 'object' ? Object.keys(data).join(', ') : 'N/A'}`;
        console.error("❌ Formato inválido:", errorDetails, data);
        throw new Error(`Formato de dados inválido: esperado array, objeto com propriedade 'leads', ou objeto único de lead. ${errorDetails}`);
      }

      // Validação adicional: verifica se todos os leads têm os campos obrigatórios
      console.log(`🔍 Validando ${leadsData.length} lead(s)...`);
      const validLeads = leadsData.filter((lead, index) => {
        const isValid = lead && 
          typeof lead.id === 'string' && 
          typeof lead.platform === 'string' && 
          typeof lead.name === 'string' && 
          typeof lead.phone_number === 'string';
        if (!isValid) {
          console.warn(`❌ Lead ${index + 1} inválido ignorado:`, lead);
        } else {
          console.log(`✅ Lead ${index + 1} válido:`, lead.id, lead.name);
        }
        return isValid;
      });

      if (validLeads.length !== leadsData.length) {
        console.warn(`⚠️ ${leadsData.length - validLeads.length} lead(s) inválido(s) foram ignorados`);
      }

      console.log(`📊 Total de leads válidos: ${validLeads.length}`);
      console.log(`📋 IDs dos leads válidos:`, validLeads.map(l => l.id).join(", "));
      console.log(`💾 Salvando ${validLeads.length} lead(s) no estado...`);
      setLeads(validLeads);
      setLastSync(new Date());
      
      toast({
        title: "Sincronizado",
        description: `${leadsData.length} lead(s) atualizado(s) com sucesso`,
        className: "bg-success text-success-foreground"
      });
    } catch (error) {
      console.error("Erro na sincronização:", error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível buscar os leads";
      
      // Verifica se o erro é "No item to return was found" - significa que não há leads
      const isNoItemsError = errorMessage.includes("No item to return was found") || 
                             errorMessage.includes("500");
      
      if (isNoItemsError) {
        // Trata como sucesso com 0 leads
        setLeads([]);
        setLastSync(new Date());
        toast({
          title: "Sincronizado",
          description: "Nenhum lead encontrado na planilha no momento.",
          className: "bg-muted text-foreground"
        });
      } else {
        toast({
          title: "Erro na sincronização",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsSyncing(false);
    }
  }, [webhookConfig, toast]);

  // Sincronização automática ao carregar a página pela primeira vez
  useEffect(() => {
    if (!webhookConfig?.fetchUrl || hasInitialSync) return;
    
    console.log("🔄 Sincronização automática ao carregar a página...");
    const timer = setTimeout(() => {
      try {
        if (webhookConfig?.fetchUrl && syncWithSheets) {
          syncWithSheets();
          setHasInitialSync(true);
        }
      } catch (error) {
        console.error("Erro na sincronização automática:", error);
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
    if (!webhookConfig?.updateUrl) {
      console.warn("Webhook de atualização não configurado");
      return;
    }

    try {
      const response = await fetch(webhookConfig.updateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, conversion: status })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Erro desconhecido");
        throw new Error(`Erro ao atualizar no n8n: ${response.status} - ${errorText}`);
      }

      console.log(`✅ Status do lead ${leadId} atualizado para "${status}" no n8n`);
    } catch (error) {
      console.error("Erro ao atualizar no n8n:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status do lead no n8n. Verifique a configuração do webhook.",
        variant: "destructive"
      });
      throw error; // Re-throw para que o handleQualify/handleDisqualify saibam que falhou
    }
  };

  const handleQualify = async (leadId: string) => {
    // Atualiza localmente primeiro para feedback imediato
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, conversion: "Qualificado" as ConversionStatus } : lead
    ));
    
    try {
      await updateLeadStatus(leadId, "Qualificado");
      toast({
        title: "Lead Qualificado",
        description: "O lead foi marcado como qualificado e atualizado no n8n com sucesso.",
        className: "bg-success text-success-foreground"
      });
    } catch (error) {
      // Reverte a mudança local se falhar
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, conversion: lead.conversion } : lead
      ));
    }
  };

  const handleDisqualify = async (leadId: string) => {
    // Atualiza localmente primeiro para feedback imediato
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, conversion: "Desqualificado" as ConversionStatus } : lead
    ));
    
    try {
      await updateLeadStatus(leadId, "Desqualificado");
      toast({
        title: "Lead Desqualificado",
        description: "O lead foi marcado como desqualificado e atualizado no n8n com sucesso.",
        className: "bg-success text-success-foreground"
      });
    } catch (error) {
      // Reverte a mudança local se falhar
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, conversion: lead.conversion } : lead
      ));
      toast({
        title: "Erro ao Desqualificar",
        description: "Não foi possível atualizar o status do lead. Tente novamente.",
        variant: "destructive"
      });
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
    
    toast({
      title: newValue ? "Auto-sync ativado" : "Auto-sync desativado",
      description: newValue ? `Sincronizando a cada ${syncInterval} minutos` : "Sincronização automática desativada",
      className: newValue ? "bg-success text-success-foreground" : ""
    });
  };

  const updateSyncInterval = (minutes: number) => {
    setSyncInterval(minutes);
    localStorage.setItem("sync-interval", String(minutes));
    
    if (autoSyncEnabled) {
      toast({
        title: "Intervalo atualizado",
        description: `Sincronização a cada ${minutes} minutos`,
        className: "bg-success text-success-foreground"
      });
    }
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
    <div className="relative min-h-screen">
      {/* Background Liquid Effect Container */}
      <div className="liquid-container" aria-hidden="true" />
      
      <div className="container relative mx-auto py-10 px-6 z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-4xl font-bold tracking-tight gradient-text">Painel Comercial | Porceli Tracking</h1>
            
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
        <TiltWrapper intensity={8} className="mt-6">
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
