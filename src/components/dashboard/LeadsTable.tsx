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

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Plataforma</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Atendimento N°</TableHead>
            <TableHead>Anúncio</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow 
              key={lead.id} 
              className="cursor-pointer hover:bg-foreground/5 transition-colors duration-150"
              onClick={() => onLeadClick(lead)}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(lead.conversion)}
                  {getStatusBadge(lead.conversion)}
                </div>
              </TableCell>
              <TableCell>{getPlatformText(lead.platform)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(lead.event_time), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </TableCell>
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell className="text-sm">{lead.phone_number}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{lead.attendance_number}</TableCell>
              <TableCell className="text-sm max-w-[150px] truncate">{lead.ad}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-success border-success/50 hover:bg-success hover:text-success-foreground"
                    onClick={() => onQualify(lead.id)}
                    disabled={lead.conversion === "Qualificado"}
                  >
                    Qualificar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/50 hover:bg-destructive hover:text-destructive-foreground"
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
