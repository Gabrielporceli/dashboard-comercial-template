import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Lead } from "@/types/lead";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare, 
  ExternalLink,
  Globe,
  Fingerprint,
  Activity,
  Target
} from "lucide-react";

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LeadDetailModal = ({ lead, isOpen, onClose }: LeadDetailModalProps) => {
  if (!lead) return null;

  const openWhatsApp = () => {
    if (lead.whatsapp_link) {
      window.open(lead.whatsapp_link, '_blank');
    }
  };

  const DetailRow = ({ icon: Icon, label, value }: { icon: any, label: string, value?: string | number }) => {
    if (!value) return null;
    
    return (
      <div className="flex items-start gap-3 py-3">
        <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-sm font-medium text-foreground mt-1">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Detalhes do Lead
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Informações Principais */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Informações Principais</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">{lead.name}</span>
                <Badge variant="outline" className={
                  lead.conversion === "Qualificado" 
                    ? "bg-success/20 text-success border-success/30" 
                    : lead.conversion === "Desqualificado"
                    ? "bg-destructive/20 text-destructive border-destructive/30"
                    : "bg-muted/50 text-foreground/60 border-border"
                }>
                  {lead.conversion}
                </Badge>
              </div>
              
              <DetailRow 
                icon={Calendar} 
                label="Data e Hora" 
                value={format(new Date(lead.event_time), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })} 
              />
              
              <DetailRow icon={Globe} label="Plataforma" value={lead.platform} />
              
              {lead.phone_number && (
                <div className="flex items-start gap-3 py-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-medium">{lead.phone_number}</p>
                      {lead.whatsapp_link && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7"
                          onClick={openWhatsApp}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          WhatsApp
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <DetailRow icon={Mail} label="E-mail" value={lead.email} />
              <DetailRow icon={Fingerprint} label="Atendimento N°" value={lead.attendance_number} />
            </div>
          </div>

          <Separator />

          {/* Mensagem */}
          {lead.message && (
            <>
              <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
              <MessageSquare className="w-5 h-5" />
              Mensagem Original
            </h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-foreground">{lead.message}</p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Campanha e Anúncio */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
              <Target className="w-5 h-5" />
              Campanha e Anúncio
            </h3>
            <div className="space-y-2">
              <DetailRow icon={Activity} label="Campanha" value={lead.campaign} />
              <DetailRow icon={Activity} label="Conjunto de Anúncios" value={lead.ad_set} />
              <DetailRow icon={Activity} label="Anúncio" value={lead.ad} />
              <DetailRow icon={Activity} label="Source ID" value={lead.source_id} />
            </div>
          </div>

          <Separator />

          {/* Dados Técnicos */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Dados Técnicos</h3>
            <div className="space-y-2">
              <DetailRow icon={Globe} label="Endereço IP" value={lead.ip_address} />
              <DetailRow icon={Activity} label="User Agent" value={lead.user_agent} />
              <DetailRow icon={Activity} label="Atributos de Sessão" value={lead.session_attributes} />
              <DetailRow icon={Fingerprint} label="GCLID" value={lead.gclid} />
              <DetailRow icon={Fingerprint} label="GBRAID" value={lead.gbraid} />
              <DetailRow icon={Fingerprint} label="WBRAID" value={lead.wbraid} />
              <DetailRow icon={Fingerprint} label="CTWACLID" value={lead.ctwaclid} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
