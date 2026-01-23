import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Platform, ConversionStatus } from "@/types/lead";

interface LeadFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  platformFilter: Platform | "Todos";
  onPlatformChange: (value: Platform | "Todos") => void;
  statusFilter: ConversionStatus | "Todos";
  onStatusChange: (value: ConversionStatus | "Todos") => void;
}

export const LeadFilters = ({
  searchTerm,
  onSearchChange,
  platformFilter,
  onPlatformChange,
  statusFilter,
  onStatusChange
}: LeadFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
    </div>
  );
};
