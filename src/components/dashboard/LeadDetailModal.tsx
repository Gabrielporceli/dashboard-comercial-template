import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

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
  Target,
  Edit2,
  Check,
  X,
  DollarSign
} from "lucide-react";

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (leadId: string, updates: Partial<Lead>) => Promise<void>;
}

export const LeadDetailModal = ({ lead, isOpen, onClose, onUpdate }: LeadDetailModalProps) => {
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [activeField, setActiveField] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        phone_number: lead.phone_number
      });
      setActiveField(null);
    }
  }, [lead]);

  if (!lead) return null;

  const EditableField = ({ 
    value, 
    onSave, 
    className, 
    placeholder 
  }: { 
    value: string, 
    onSave: (val: string) => Promise<void>, 
    className?: string,
    placeholder: string
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      setCurrentValue(value);
    }, [value]);

    const handleSave = async () => {
      if (currentValue === value) {
        setIsEditing(false);
        return;
      }
      setIsLoading(true);
      try {
        await onSave(currentValue);
        setIsEditing(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (isEditing) {
      return (
        <div className="flex items-center gap-1.5 animate-in fade-in duration-200 w-full max-w-[280px]">
          <Input 
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="h-8 bg-white/5 border-white/10 focus-visible:ring-primary/30 flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') {
                setCurrentValue(value);
                setIsEditing(false);
              }
            }}
          />
          <div className="flex items-center gap-0.5 shrink-0">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-success hover:text-success hover:bg-success/20" onClick={handleSave} disabled={isLoading}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/20" onClick={() => setIsEditing(false)} disabled={isLoading}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div 
        className={`group relative cursor-pointer hover:bg-white/5 p-1 rounded-md transition-all -ml-1 ${!value ? 'italic text-muted-foreground' : ''}`}
        onClick={() => setIsEditing(true)}
      >
        <span className={className}>{value || placeholder}</span>
        <Edit2 className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
      </div>
    );
  };

  const openWhatsApp = () => {
    if (lead.whatsapp_link) {
      window.open(lead.whatsapp_link, '_blank');
    }
  };

  const DetailRow = ({ icon: Icon, label, value }: { icon: any, label: string, value?: string | number }) => {
    if (!value || value === "undefined" || value === "null") return null;

    const strValue = value.toString();
    const isLong = strValue.length > 50;

    return (
      <div className="flex items-start gap-3 py-3">
        <Icon className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`mt-1 break-all ${isLong ? "text-xs font-mono text-white/40 leading-relaxed" : "text-sm font-medium text-foreground"}`}>
            {strValue}
          </p>
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
            <h3 className="text-lg font-semibold mb-4 text-foreground">Informações Principais</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <EditableField
                      value={formData.name || lead.name || ""}
                      onSave={(val) => {
                        const updates = { ...formData, name: val };
                        setFormData(updates);
                        return onUpdate(lead.id, updates);
                      }}
                      className="text-2xl font-bold text-foreground"
                      placeholder="Nome não informado"
                    />
                  </div>
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
                  value={`${format(new Date(lead.event_time), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às ${lead.hora_min || (lead as any)["hora/min"] || "00:00"}`} 
                />
                
                <DetailRow icon={Globe} label="Plataforma" value={lead.platform} />
                
                <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <div className="mt-1">
                      <EditableField
                        value={formData.phone_number || lead.phone_number || ""}
                        onSave={(val) => {
                          const updates = { ...formData, phone_number: val };
                          setFormData(updates);
                          return onUpdate(lead.id, updates);
                        }}
                        className="text-sm font-medium"
                        placeholder="Telefone não informado"
                      />
                      {lead.whatsapp_link && lead.phone_number && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 mt-2"
                          onClick={openWhatsApp}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          WhatsApp
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <EditableField
                      value={formData.email || lead.email || ""}
                      onSave={(val) => {
                        const updates = { ...formData, email: val };
                        setFormData(updates);
                        return onUpdate(lead.id, updates);
                      }}
                      className="text-sm font-medium mt-1"
                      placeholder="E-mail não informado"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                  <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Valor da Conversão (R$)</p>
                    <EditableField
                      value={
                        (() => {
                          const v = formData.conversion_value ?? lead.conversion_value;
                          if (v == null || v === '') return '';
                          const n = Number(v);
                          return isNaN(n) ? String(v) : n.toFixed(2).replace('.', ',');
                        })()
                      }
                      onSave={async (val) => {
                        // aceita "1.500,50" (BR) ou "1500.50" (EN)
                        const cleaned = val.trim()
                          .replace(/\./g, '')   // remove pontos de milhar
                          .replace(',', '.');    // vírgula → ponto decimal
                        const numVal = cleaned ? parseFloat(cleaned) : undefined;
                        const updates = { ...formData, conversion_value: numVal };
                        setFormData(updates);
                        return onUpdate(lead.id, updates);
                      }}
                      className="text-sm font-medium mt-1 text-white"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Gênero</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        {
                          value: 'Sem Info',
                          label: 'Sem Info',
                          active:   'bg-white/15 text-white/80 border border-white/20',
                          inactive: 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/60',
                        },
                        {
                          value: 'Homem',
                          label: 'Homem',
                          active:   'bg-blue-500/20 text-blue-300 border border-blue-500/30',
                          inactive: 'bg-blue-500/5 text-blue-400/60 border border-blue-500/15 hover:bg-blue-500/15 hover:text-blue-300',
                        },
                        {
                          value: 'Mulher',
                          label: 'Mulher',
                          active:   'bg-pink-500/20 text-pink-300 border border-pink-500/30',
                          inactive: 'bg-pink-500/5 text-pink-400/60 border border-pink-500/15 hover:bg-pink-500/15 hover:text-pink-300',
                        },
                      ].map((opt) => {
                        const current = formData.gender || lead.gender;
                        const isActive = current === opt.value || (!current && opt.value === 'Sem Info');
                        return (
                          <button
                            key={opt.value}
                            onClick={async () => {
                              const updates = { ...formData, gender: opt.value };
                              setFormData(updates);
                              return onUpdate(lead.id, updates);
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${isActive ? opt.active : opt.inactive}`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Idade</p>
                    <EditableField
                      value={formData.age?.toString() || lead.age?.toString() || ""}
                      onSave={async (val) => {
                        const updates = { ...formData, age: val };
                        setFormData(updates);
                        return onUpdate(lead.id, updates);
                      }}
                      className="text-sm font-medium mt-1"
                      placeholder="Ex: 35"
                    />
                  </div>
                </div>

                {lead.conversion === 'Desqualificado' && (
                  <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                    <X className="w-5 h-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Motivo da Perda (Obs)</p>
                      <EditableField
                        value={formData.obs || lead.obs || ""}
                        onSave={async (val) => {
                          const updates = { ...formData, obs: val };
                          setFormData(updates);
                          return onUpdate(lead.id, updates);
                        }}
                        className="text-sm font-medium mt-1 text-destructive"
                        placeholder="Ex: Achou caro, Concorrente, etc."
                      />
                    </div>
                  </div>
                )}
                
                <DetailRow icon={Fingerprint} label="Atendimento N°" value={lead.attendance_number} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Mensagem */}
          {lead.message && (
            <>
              <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
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
