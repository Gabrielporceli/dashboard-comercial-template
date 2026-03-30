import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { Lead, ConversionStatus } from "@/types/lead";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LeadsTableProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onQualify: (leadId: string) => void;
  onDisqualify: (leadId: string) => void;
}

export const LeadsTable = ({ leads, onLeadClick, onQualify, onDisqualify }: LeadsTableProps) => {
  const getStatusIcon = (status: ConversionStatus) => {
    switch (status) {
      case "Qualificado":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "Desqualificado":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <HelpCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ConversionStatus) => {
    const variants = {
      "Qualificado": "bg-success/20 text-success hover:bg-success/30 border-success/30",
      "Desqualificado": "bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/30",
      "Sem Info": "bg-muted/50 text-foreground/60 border-border"
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {status}
      </Badge>
    );
  };

  const getPlatformText = (platform: string) => {
    const colors = {
      "Google": "text-red-600",
      "Meta": "text-blue-600",
      "Sem Info": "text-muted-foreground"
    };

    return (
      <span className={colors[platform as keyof typeof colors]}>
        {platform}
      </span>
    );
  };

  if (leads.length === 0) {
    return (
      <div className="liquid-glass p-20 text-center border-white/10 shadow-2xl">
        <div className="flex flex-col items-center gap-5">
          <HelpCircle className="w-16 h-16 text-goat-purple/50 animate-pulse-soft" />
          <h3 className="text-2xl font-bold text-foreground tracking-tight">Nenhum lead encontrado</h3>
          <p className="text-base text-muted-foreground max-w-md mx-auto">
            A sua base de dados parece estar vazia. Sincronize com sua planilha para importar novos leads ou aguarde novas entradas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="liquid-glass border border-white/10 shadow-2xl">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="hover:bg-transparent border-white/10">
            <TableHead className="font-bold text-foreground">Status</TableHead>
            <TableHead className="font-bold text-foreground">Plataforma</TableHead>
            <TableHead className="font-bold text-foreground">Data</TableHead>
            <TableHead className="font-bold text-foreground">Hora:Min</TableHead>
            <TableHead className="font-bold text-foreground">Nome</TableHead>
            <TableHead className="font-bold text-foreground">Telefone</TableHead>
            <TableHead className="font-bold text-foreground">Atendimento N°</TableHead>
            <TableHead className="font-bold text-foreground">Anúncio</TableHead>
            <TableHead className="text-right font-bold text-foreground">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow 
              key={lead.id} 
              className="cursor-pointer hover:bg-white/5 transition-colors duration-150 border-white/5"
              onClick={() => onLeadClick(lead)}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(lead.conversion)}
                  {getStatusBadge(lead.conversion)}
                </div>
              </TableCell>
              <TableCell className="font-semibold">{getPlatformText(lead.platform)}</TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {format(new Date(lead.event_time), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap font-mono tracking-tighter">
                {lead.hora_min || (lead as any)["hora/min"] || "00:00"}
              </TableCell>
              <TableCell className="font-medium text-foreground">{lead.name}</TableCell>
              <TableCell className="text-sm font-mono tracking-tighter">{lead.phone_number}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{lead.attendance_number}</TableCell>
              <TableCell className="text-sm max-w-[150px] truncate italic text-muted-foreground">{lead.ad}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all hover:scale-105 active:scale-95"
                    onClick={() => onQualify(lead.id)}
                    disabled={lead.conversion === "Qualificado"}
                  >
                    Qualificar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold text-rose-400 border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all hover:scale-105 active:scale-95"
                    onClick={() => onDisqualify(lead.id)}
                    disabled={lead.conversion === "Desqualificado"}
                  >
                    Desqualificar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
