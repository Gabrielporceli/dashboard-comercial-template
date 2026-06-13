import React from 'react';
import { useLeads } from '@/contexts/LeadContext';
import { useMotion } from '@/contexts/MotionContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { OverviewReport } from '@/components/reports/OverviewReport';
import { AdsReport } from '@/components/reports/AdsReport';
import { TimeReport } from '@/components/reports/TimeReport';
import { DemographicsReport } from '@/components/reports/DemographicsReport';
import { CommercialReport } from '@/components/reports/CommercialReport';

const Reports = () => {
  const { allLeads, leads, isBackupSyncing, lastBackupSync, syncAllLeads, webhookConfig } = useLeads();
  const { animationsEnabled } = useMotion();
  const navigate = useNavigate();

  // Use backup data when available, otherwise fall back to active leads
  const reportLeads = allLeads.length > 0 ? allLeads : leads;

  return (
    <div className={`relative min-h-screen pb-20 ${!animationsEnabled ? 'disable-motion' : ''}`}>
      <div className="liquid-container" aria-hidden="true" />
      
      <div className="container relative mx-auto py-10 px-6 z-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="btn-spring h-11 w-11 rounded-2xl liquid-glass border-white/5 flex items-center justify-center hover:-translate-y-0.5 hover:scale-105 hover:bg-white/[0.02] shrink-0"
              onClick={() => navigate('/')}
              title="Voltar"
            >
              <ArrowLeft className="w-4 h-4 text-white/70" />
            </button>
            <h1 className="text-4xl font-light tracking-tight text-white whitespace-nowrap">Inteligência do Negocio | Porceli Tracking</h1>
          </div>
          <div className="flex items-center gap-3">
            {lastBackupSync && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 text-xs text-muted-foreground">
                <Clock className="w-3 h-3 text-goat-purple" />
                Backup: {lastBackupSync.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                <span className="text-goat-purple font-medium">{reportLeads.length} leads</span>
              </div>
            )}
            {webhookConfig?.backupFetchUrl && (
              <button
                onClick={syncAllLeads}
                disabled={isBackupSyncing}
                title="Sincronizar Histórico"
                className="btn-spring h-11 w-11 rounded-2xl liquid-glass border-white/5 flex items-center justify-center hover:-translate-y-0.5 hover:scale-105 hover:bg-white/[0.02] disabled:opacity-40 disabled:pointer-events-none"
              >
                <RefreshCw className={`w-4 h-4 transition-colors ${isBackupSyncing ? 'animate-spin text-primary' : 'text-white/70'}`} />
              </button>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="liquid-glass bg-transparent mb-8 p-1 rounded-xl h-auto flex flex-wrap justify-start gap-1 w-full">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-goat-purple data-[state=active]:text-white px-4 py-2">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="ads" className="rounded-xl data-[state=active]:bg-goat-purple data-[state=active]:text-white px-4 py-2">
              Tráfego Pago
            </TabsTrigger>
            <TabsTrigger value="time" className="rounded-xl data-[state=active]:bg-goat-purple data-[state=active]:text-white px-4 py-2">
              Horários & Sazonalidade
            </TabsTrigger>
            <TabsTrigger value="demo" className="rounded-xl data-[state=active]:bg-goat-purple data-[state=active]:text-white px-4 py-2">
              Geografia & Demografia
            </TabsTrigger>
            <TabsTrigger value="commercial" className="rounded-xl data-[state=active]:bg-goat-purple data-[state=active]:text-white px-4 py-2">
              Perfil Comercial
            </TabsTrigger>
          </TabsList>

          <div className="animate-fade-in">
            <TabsContent value="overview" className="mt-0 outline-none">
              <OverviewReport leads={reportLeads} />
            </TabsContent>

            <TabsContent value="ads" className="mt-0 outline-none">
              <AdsReport leads={reportLeads} />
            </TabsContent>

            <TabsContent value="time" className="mt-0 outline-none">
              <TimeReport leads={reportLeads} />
            </TabsContent>

            <TabsContent value="demo" className="mt-0 outline-none">
              <DemographicsReport leads={reportLeads} />
            </TabsContent>

            <TabsContent value="commercial" className="mt-0 outline-none">
              <CommercialReport leads={reportLeads} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
