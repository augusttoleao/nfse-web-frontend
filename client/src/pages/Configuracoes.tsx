import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Info } from 'lucide-react';

export default function Configuracoes() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da aplicação</p>
      </div>

      {/* Informações da API */}
      <Card className="p-6 bg-card border border-border mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Informações da API</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">URL da API</label>
            <Input
              type="text"
              value="https://nfse.easytecsis.com.br"
              disabled
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">CNPJ</label>
            <Input
              type="text"
              value="00766728000129"
              disabled
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Inscrição Municipal</label>
            <Input
              type="text"
              value="7165801"
              disabled
              className="bg-secondary border-border text-foreground"
            />
          </div>
        </div>
      </Card>

      {/* Configurações Gerais */}
      <Card className="p-6 bg-card border border-border mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Configurações Gerais</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Itens por página</label>
            <select className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground">
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 rounded border-border" defaultChecked />
              <span className="text-sm text-foreground">Atualizar dados automaticamente</span>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 rounded border-border" defaultChecked />
              <span className="text-sm text-foreground">Mostrar notificações</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Botões de Ação */}
      <div className="flex gap-4">
        <Button className="bg-primary text-primary-foreground hover:bg-blue-800">
          Salvar Alterações
        </Button>
        <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
          Cancelar
        </Button>
      </div>

      {/* Informações */}
      <Card className="mt-6 p-6 bg-blue-50 border border-blue-200">
        <div className="flex gap-4">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Versão da Aplicação</h4>
            <p className="text-sm text-blue-800">
              NFSe Web Frontend v1.0.0 | API Backend v1.0.0
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
