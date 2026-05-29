import React from 'react';
import { useLeads } from '@/contexts/LeadContext';
import { useMotion } from '@/contexts/MotionContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { OverviewReport } from '@/components/reports/OverviewReport';
import { AdsReport } from '@/components/reports/AdsReport';
import { TimeReport } from '@/components/reports/TimeReport';
import { DemographicsReport } from '@/components/reports/DemographicsReport';

const Reports = () => {
  const { leads } = useLeads();
  const { animationsEnabled } = useMotion();
  const navigate = useNavigate();

  return (
    <div className={`relative min-h-screen pb-20 ${!animationsEnabled ? 'disable-motion' : ''}`}>
      <div className="liquid-container" aria-hidden="true" />
      
      <div className="container relative mx-auto py-10 px-6 z-10">
        <div className="mb-8 flex items-start justify-between">
          <Button 
            variant="ghost" 
            className="liquid-glass rounded-full w-12 h-12 p-0 flex items-center justify-center border border-white/10 hover:bg-white/10 hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5 text-goat-purple" />
          </Button>
          <div className="text-right">
            <h1 className="text-4xl font-light tracking-tight gradient-text whitespace-nowrap">Relatórios Avançados</h1>
            <p className="text-muted-foreground mt-1 text-sm">Central de Business Intelligence</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="liquid-glass mb-8 border border-white/10 p-1.5 rounded-2xl h-auto flex flex-wrap justify-center sm:justify-start gap-1">
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
          </TabsList>

          <div className="animate-fade-in">
            <TabsContent value="overview" className="mt-0 outline-none">
              <OverviewReport leads={leads} />
            </TabsContent>

            <TabsContent value="ads" className="mt-0 outline-none">
              <AdsReport leads={leads} />
            </TabsContent>

            <TabsContent value="time" className="mt-0 outline-none">
              <TimeReport leads={leads} />
            </TabsContent>

            <TabsContent value="demo" className="mt-0 outline-none">
              <DemographicsReport leads={leads} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
