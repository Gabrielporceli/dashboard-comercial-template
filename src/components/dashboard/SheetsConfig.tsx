import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WebhookConfig {
  fetchUrl: string;
  updateUrl: string;
}

interface SheetsConfigProps {
  onConfigSave: (config: WebhookConfig) => void;
  autoSyncEnabled: boolean;
  syncInterval: number;
  onToggleAutoSync: () => void;
  onUpdateInterval: (minutes: number) => void;
}

const PASSWORD = "Abc@010203";

export const SheetsConfig = ({ 
  onConfigSave, 
  autoSyncEnabled, 
  syncInterval, 
  onToggleAutoSync, 
  onUpdateInterval 
}: SheetsConfigProps) => {
  const [fetchUrl, setFetchUrl] = useState("");
  const [updateUrl, setUpdateUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const { toast } = useToast();

  // Resetar autenticação e campos quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setIsAuthenticated(false);
      setPassword("");
      setPasswordError("");
      // Limpar os campos ao abrir o modal
      setFetchUrl("");
      setUpdateUrl("");
    }
  }, [isOpen]);

  // Carregar dados salvos apenas após autenticação bem-sucedida
  useEffect(() => {
    if (isAuthenticated) {
      const saved = localStorage.getItem("n8n-webhook-config");
      if (saved) {
        try {
          const config = JSON.parse(saved);
          setFetchUrl(config.fetchUrl || "");
          setUpdateUrl(config.updateUrl || "");
        } catch (error) {
          console.error("Erro ao carregar configuração:", error);
        }
      }
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = () => {
    if (password === PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError("");
      toast({
        title: "Acesso autorizado",
        description: "Você pode agora fazer alterações na configuração",
        className: "bg-success text-success-foreground"
      });
    } else {
      setPasswordError("Senha incorreta");
      toast({
        title: "Erro",
        description: "Senha incorreta. Acesso negado.",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      toast({
        title: "Acesso negado",
        description: "É necessário inserir a senha para salvar alterações",
        variant: "destructive"
      });
      return;
    }

    if (!fetchUrl || !updateUrl) {
      toast({
        title: "Erro",
        description: "Preencha todas as URLs dos webhooks",
        variant: "destructive"
      });
      return;
    }

    const config = { fetchUrl, updateUrl };
    localStorage.setItem("n8n-webhook-config", JSON.stringify(config));
    onConfigSave(config);
    setIsOpen(false);
    
    toast({
      title: "Configuração Salva",
      description: "URLs dos webhooks configuradas com sucesso",
      className: "bg-success text-success-foreground"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="liquid-glass border-white/20 bg-white/5 hover:bg-white/10">
          <Settings className="h-4 w-4 mr-2" />
          Configurar n8n
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configuração n8n</DialogTitle>
          <DialogDescription>
            Cole as URLs dos webhooks criados no n8n
          </DialogDescription>
        </DialogHeader>
        
        {!isAuthenticated ? (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Senha de Administrador
                </Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite a senha de administrador"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePasswordSubmit();
                  }
                }}
                className={passwordError ? "border-destructive" : ""}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  É necessário inserir a senha de administrador para acessar esta configuração
                </p>
                <Button onClick={handlePasswordSubmit} className="w-full">
                  Verificar Senha
                </Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Fechar
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fetch">Webhook para Buscar Leads</Label>
                <Input
                  id="fetch"
                  placeholder="https://seu-n8n.app.n8n.cloud/webhook/buscar-leads"
                  value={fetchUrl}
                  onChange={(e) => setFetchUrl(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <p className="text-xs text-muted-foreground">
                  Este webhook deve retornar todos os leads da planilha
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="update">Webhook para Atualizar Status</Label>
                <Input
                  id="update"
                  placeholder="https://seu-n8n.app.n8n.cloud/webhook/atualizar-lead"
                  value={updateUrl}
                  onChange={(e) => setUpdateUrl(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <p className="text-xs text-muted-foreground">
                  Este webhook deve receber o ID e novo status do lead
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Salvar Configuração
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sincronização Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Atualizar leads automaticamente
                  </p>
                </div>
                <Switch
                  checked={autoSyncEnabled}
                  onCheckedChange={onToggleAutoSync}
                />
              </div>

              {autoSyncEnabled && (
                <div className="space-y-2">
                  <Label>Intervalo de Sincronização</Label>
                  <Select 
                    value={String(syncInterval)} 
                    onValueChange={(value) => onUpdateInterval(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minuto</SelectItem>
                      <SelectItem value="5">5 minutos</SelectItem>
                      <SelectItem value="10">10 minutos</SelectItem>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
