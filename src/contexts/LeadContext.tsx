import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Lead, ConversionStatus } from "@/types/lead";
import { useToast } from "@/hooks/use-toast";

interface WebhookConfig {
  fetchUrl: string;
  updateUrl: string;
  backupFetchUrl?: string;
}

interface LeadContextProps {
  leads: Lead[];
  allLeads: Lead[];
  isSyncing: boolean;
  isBackupSyncing: boolean;
  lastSync: Date | null;
  lastBackupSync: Date | null;
  webhookConfig: WebhookConfig | null;
  autoSyncEnabled: boolean;
  syncInterval: number;
  syncWithSheets: () => Promise<void>;
  syncAllLeads: () => Promise<void>;
  setWebhookConfig: (config: WebhookConfig | null) => void;
  toggleAutoSync: () => void;
  updateSyncInterval: (minutes: number) => void;
  handleUpdateLead: (leadId: string, updates: Partial<Lead>) => Promise<void>;
  handleQualify: (leadId: string) => Promise<void>;
  handleDisqualify: (leadId: string) => Promise<void>;
}

const LeadContext = createContext<LeadContextProps | undefined>(undefined);

export const LeadProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBackupSyncing, setIsBackupSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [lastBackupSync, setLastBackupSync] = useState<Date | null>(null);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [syncInterval, setSyncInterval] = useState(5); // minutos
  const [hasInitialSync, setHasInitialSync] = useState(false);
  const [hasInitialBackupSync, setHasInitialBackupSync] = useState(false);
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

  const syncAllLeads = useCallback(async () => {
    if (!webhookConfig?.backupFetchUrl) {
      toast({
        title: "Configuração necessária",
        description: "Configure o webhook de backup do n8n primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsBackupSyncing(true);
    try {
      const response = await fetch(webhookConfig.backupFetchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Erro desconhecido");
        throw new Error(`Erro ao sincronizar backup: ${response.status} - ${errorText}`);
      }

      let data: any;
      try {
        const text = await response.text();
        data = JSON.parse(text);
      } catch {
        throw new Error("Resposta não é JSON válido.");
      }

      let leadsData: Lead[] = [];
      if (Array.isArray(data)) {
        leadsData = data;
      } else if (data && typeof data === 'object' && Array.isArray(data.leads)) {
        leadsData = data.leads;
      }

      setAllLeads(leadsData);
      setLastBackupSync(new Date());

      toast({
        title: "Relatórios sincronizados",
        description: `${leadsData.length} lead(s) histórico(s) carregado(s)`,
        className: "bg-success text-success-foreground"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Não foi possível buscar o histórico";
      toast({
        title: "Erro no backup",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsBackupSyncing(false);
    }
  }, [webhookConfig, toast]);

  // Sincronização automática inicial
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

  // Sincronização inicial do backup (relatórios)
  useEffect(() => {
    if (!webhookConfig?.backupFetchUrl || hasInitialBackupSync) return;

    const timer = setTimeout(() => {
      syncAllLeads();
      setHasInitialBackupSync(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [webhookConfig?.backupFetchUrl, hasInitialBackupSync, syncAllLeads]);

  // Sincronização por intervalo
  useEffect(() => {
    if (!autoSyncEnabled || !webhookConfig?.fetchUrl) return;

    const interval = setInterval(() => {
      syncWithSheets();
    }, syncInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoSyncEnabled, syncInterval, webhookConfig, syncWithSheets]);

  const updateLead = async (leadId: string, updates: Partial<Lead>) => {
    if (!webhookConfig?.updateUrl) {
      throw new Error("URL de atualização não configurada. Configure o webhook de atualização nas configurações do n8n.");
    }

    const fullLead = leads.find(l => l.id === leadId);
    const payload = fullLead ? { ...fullLead, ...updates } : { id: leadId, ...updates };

    console.log("[updateLead] Enviando payload:", payload);

    const response = await fetch(webhookConfig.updateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text().catch(() => "");
    console.log("[updateLead] Resposta:", response.status, responseText);

    if (!response.ok) throw new Error(`Erro ao atualizar no servidor (${response.status}): ${responseText}`);
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    const previousLeads = [...leads];
    setLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, ...updates } : lead));

    try {
      await updateLead(leadId, updates);
      toast({
        title: "Lead Atualizado",
        description: "Informações salvas na planilha com sucesso.",
        className: "bg-success text-success-foreground"
      });
    } catch (error) {
      setLeads(previousLeads);
      const msg = error instanceof Error ? error.message : "Não foi possível atualizar o lead.";
      toast({
        title: "Erro ao Salvar",
        description: msg,
        variant: "destructive"
      });
    }
  };

  const handleQualify = async (leadId: string) => {
    const previousLeads = [...leads];
    setLeads(prev => prev.map(lead =>
      lead.id === leadId ? { ...lead, conversion: "Qualificado" as ConversionStatus } : lead
    ));

    try {
      await updateLead(leadId, { conversion: "Qualificado" });
      toast({ title: "Lead Qualificado", className: "bg-success text-success-foreground" });
    } catch (error) {
      setLeads(previousLeads);
      const msg = error instanceof Error ? error.message : "Não foi possível qualificar o lead.";
      toast({ title: "Erro ao Qualificar", description: msg, variant: "destructive" });
    }
  };

  const handleDisqualify = async (leadId: string) => {
    const previousLeads = [...leads];
    setLeads(prev => prev.map(lead =>
      lead.id === leadId ? { ...lead, conversion: "Desqualificado" as ConversionStatus } : lead
    ));

    try {
      await updateLead(leadId, { conversion: "Desqualificado" });
      toast({ title: "Lead Desqualificado", className: "bg-success text-success-foreground" });
    } catch (error) {
      setLeads(previousLeads);
      const msg = error instanceof Error ? error.message : "Não foi possível desqualificar o lead.";
      toast({ title: "Erro ao Desqualificar", description: msg, variant: "destructive" });
    }
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

  return (
    <LeadContext.Provider
      value={{
        leads,
        allLeads,
        isSyncing,
        isBackupSyncing,
        lastSync,
        lastBackupSync,
        webhookConfig,
        autoSyncEnabled,
        syncInterval,
        syncWithSheets,
        syncAllLeads,
        setWebhookConfig,
        toggleAutoSync,
        updateSyncInterval,
        handleUpdateLead,
        handleQualify,
        handleDisqualify,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error("useLeads deve ser usado dentro de um LeadProvider");
  }
  return context;
};
