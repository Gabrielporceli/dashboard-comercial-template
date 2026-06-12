import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Platform, ConversionStatus } from "@/types/lead";

export type DatePreset = 'todos' | 'hoje' | 'semana' | 'mes' | 'mes_passado' | 'custom';

interface LeadFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  platformFilter: Platform | "Todos";
  onPlatformChange: (value: Platform | "Todos") => void;
  statusFilter: ConversionStatus | "Todos";
  onStatusChange: (value: ConversionStatus | "Todos") => void;
  datePreset: DatePreset;
  onDatePresetChange: (value: DatePreset) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (value: string) => void;
  onCustomEndChange: (value: string) => void;
}

export const LeadFilters = ({
  searchTerm,
  onSearchChange,
  platformFilter,
  onPlatformChange,
  statusFilter,
  onStatusChange,
  datePreset,
  onDatePresetChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
}: LeadFiltersProps) => {
  return (
    <div className="space-y-2 p-2">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nome, telefone ou anuncio..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>

        <Select value={platformFilter} onValueChange={onPlatformChange}>
          <SelectTrigger className="font-normal text-muted-foreground">
            <SelectValue placeholder="Filtrar por plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todas as plataformas</SelectItem>
            <SelectItem value="Google">Google</SelectItem>
            <SelectItem value="Meta">Meta</SelectItem>
            <SelectItem value="Sem Info">Sem Info</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="font-normal text-muted-foreground">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos os status</SelectItem>
            <SelectItem value="Qualificado">Qualificado</SelectItem>
            <SelectItem value="Desqualificado">Desqualificado</SelectItem>
            <SelectItem value="Sem Info">Sem Info</SelectItem>
          </SelectContent>
        </Select>

        <Select value={datePreset} onValueChange={onDatePresetChange}>
          <SelectTrigger className="font-normal text-muted-foreground">
            <SelectValue placeholder="Filtrar por período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todo o período</SelectItem>
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="semana">Últimos 7 dias</SelectItem>
            <SelectItem value="mes">Este mês</SelectItem>
            <SelectItem value="mes_passado">Mês passado</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {datePreset === 'custom' && (
        <div className="grid grid-cols-2 gap-3 px-0.5 pt-1">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">De</label>
            <Input
              type="date"
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Até</label>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => onCustomEndChange(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};
