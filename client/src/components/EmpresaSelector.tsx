import { useEmpresas } from '@/hooks/useEmpresas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Componente de Seletor de Empresas
 * Exibe um dropdown com lista de empresas e permite seleção
 */
export function EmpresaSelector() {
  const { empresas, empresaSelecionada, selecionarEmpresa, loading, error } =
    useEmpresas();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md">
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Carregando empresas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (empresas.length === 0) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Nenhuma empresa disponível</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg">
      <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
      <div className="flex-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Empresa Selecionada
        </label>
        <Select
          value={empresaSelecionada?.id.toString() || ''}
          onValueChange={(value) => {
            const empresa = empresas.find((e) => e.id.toString() === value);
            if (empresa) {
              selecionarEmpresa(empresa);
            }
          }}
        >
          <SelectTrigger className="w-full mt-1 border-0 bg-background text-base font-medium">
            <SelectValue placeholder="Selecione uma empresa" />
          </SelectTrigger>
          <SelectContent>
            {empresas.map((empresa) => (
              <SelectItem key={empresa.id} value={empresa.id.toString()}>
                <div className="flex flex-col">
                  <span className="font-medium">{empresa.nomeFantasia}</span>
                  <span className="text-xs text-muted-foreground">
                    {empresa.cnpj}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {empresaSelecionada && (
        <div className="text-right text-xs">
          <div className="font-semibold text-foreground">
            {empresaSelecionada.nomeFantasia}
          </div>
          <div className="text-muted-foreground">
            {empresaSelecionada.cnpj}
          </div>
        </div>
      )}
    </div>
  );
}
