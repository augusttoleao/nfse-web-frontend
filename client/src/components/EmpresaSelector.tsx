import { useEmpresas } from '@/hooks/useEmpresas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Loader2 } from 'lucide-react';

/**
 * Componente de Seletor de Empresas - Header compacto
 * Exibe dropdown com nome fantasia no canto superior direito
 */
export function EmpresaSelector() {
  const { empresas, empresaSelecionada, selecionarEmpresa, loading, error } =
    useEmpresas();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <Building2 className="w-4 h-4" />
        <span className="text-xs">Erro ao carregar empresas</span>
      </div>
    );
  }

  if (empresas.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Building2 className="w-4 h-4" />
        <span className="text-sm">Nenhuma empresa</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
      <Select
        value={empresaSelecionada?.id.toString() || ''}
        onValueChange={(value) => {
          const empresa = empresas.find((e) => e.id.toString() === value);
          if (empresa) {
            selecionarEmpresa(empresa);
          }
        }}
      >
        <SelectTrigger className="w-[280px] h-9 border-border bg-background text-sm font-medium">
          <SelectValue placeholder="Selecione uma empresa" />
        </SelectTrigger>
        <SelectContent>
          {empresas.map((empresa) => (
            <SelectItem key={empresa.id} value={empresa.id.toString()}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{empresa.nomeFantasia || empresa.razaoSocial}</span>
                <span className="text-xs text-muted-foreground">
                  ({empresa.cnpj})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
