import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEmpresas } from '@/hooks/useEmpresas';
import { Settings, Info, AlertCircle } from 'lucide-react';

export default function Configuracoes() {
  const { empresaSelecionada } = useEmpresas();

  if (!empresaSelecionada) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Selecione uma empresa no canto superior direito.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">Informações da aplicação e empresa selecionada</p>
      </div>

      {/* Informações da API */}
      <Card className="p-4 bg-card border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Informações da API</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">URL da API</label>
            <Input type="text" value="https://nfse.easytecsis.com.br/api" disabled className="h-9 text-sm bg-secondary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">API SEFIN Nacional</label>
            <Input type="text" value="https://sefin.nfse.gov.br/SefinNacional" disabled className="h-9 text-sm bg-secondary" />
          </div>
        </div>
      </Card>

      {/* Dados da Empresa Selecionada */}
      <Card className="p-4 bg-card border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Empresa Selecionada</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Razão Social</label>
            <Input type="text" value={empresaSelecionada.razaoSocial} disabled className="h-9 text-sm bg-secondary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Nome Fantasia</label>
            <Input type="text" value={empresaSelecionada.nomeFantasia || '-'} disabled className="h-9 text-sm bg-secondary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">CNPJ</label>
            <Input type="text" value={empresaSelecionada.cnpj} disabled className="h-9 text-sm bg-secondary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Inscrição Municipal</label>
            <Input type="text" value={empresaSelecionada.inscricaoMunicipal || '-'} disabled className="h-9 text-sm bg-secondary" />
          </div>
        </div>
      </Card>

      {/* Versão */}
      <Card className="p-4 bg-blue-50 border border-blue-200">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 text-sm">Versão da Aplicação</h4>
            <p className="text-xs text-blue-800 mt-1">
              NFSe Web Frontend v1.0.0 | API Backend v1.0.0
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
