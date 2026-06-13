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
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "Desqualificado":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ConversionStatus) => {
    const variants = {
      "Qualificado":    "bg-success/10 text-success border-success/20",
      "Desqualificado": "bg-destructive/10 text-destructive border-destructive/20",
      "Sem Info":       "bg-white/5 text-white/40 border-white/10",
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {status}
      </Badge>
    );
  };

  const getPlatformText = (platform: string) => {
    const colors: Record<string, string> = {
      "Google": "text-red-500",
      "Meta":   "text-blue-400",
      "Sem Info": "text-muted-foreground",
    };
    return (
      <span className={colors[platform] ?? "text-muted-foreground"}>
        {platform}
      </span>
    );
  };

  if (leads.length === 0) {
    return (
      <div className="liquid-glass p-20 text-center border border-white/10 shadow-2xl rounded-xl">
        <div className="flex flex-col items-center gap-5">
          <HelpCircle className="w-16 h-16 text-goat-purple/50 animate-pulse-soft" />
          <h3 className="text-xl font-medium text-foreground tracking-tight">Nenhum lead encontrado</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            A sua base de dados parece estar vazia. Sincronize com sua planilha para importar novos leads ou aguarde novas entradas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="liquid-glass border border-white/10 shadow-2xl rounded-xl overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="hover:bg-transparent border-white/10">
            <TableHead className="text-white/50 text-xs font-medium uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-white/50 text-xs font-medium uppercase tracking-wider">Plataforma</TableHead>
            <TableHead className="text-white/50 text-xs font-medium uppercase tracking-wider">Data</TableHead>
            <TableHead className="text-white/50 text-xs font-medium uppercase tracking-wider">Hora</TableHead>
            <TableHead className="text-white/50 text-xs font-medium uppercase tracking-wider">Nome</TableHead>
            <TableHead className="text-white/50 text-xs font-medium uppercase tracking-wider">Telefone</TableHead>
            <TableHead className="text-right text-white/50 text-xs font-medium uppercase tracking-wider">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              className="cursor-pointer hover:bg-white/[0.03] transition-colors duration-150 border-white/5"
              onClick={() => onLeadClick(lead)}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(lead.conversion)}
                  {getStatusBadge(lead.conversion)}
                </div>
              </TableCell>
              <TableCell className="text-sm">{getPlatformText(lead.platform)}</TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {format(new Date(lead.event_time), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap font-mono tracking-tighter">
                {lead.hora_min || (lead as any)["hora/min"] || "—"}
              </TableCell>
              <TableCell className="text-sm text-foreground">{lead.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground font-mono tracking-tighter">{lead.phone_number}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="h-7 px-3 text-xs rounded-md border border-[#38A169]/30 text-[#38A169] hover:bg-[#38A169]/10 hover:border-[#38A169]/50 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    onClick={() => onQualify(lead.id)}
                    disabled={lead.conversion === "Qualificado"}
                  >
                    Qualificar
                  </button>
                  <button
                    className="h-7 px-3 text-xs rounded-md border border-[#C53030]/30 text-[#C53030] hover:bg-[#C53030]/10 hover:border-[#C53030]/50 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    onClick={() => onDisqualify(lead.id)}
                    disabled={lead.conversion === "Desqualificado"}
                  >
                    Desqualificar
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
