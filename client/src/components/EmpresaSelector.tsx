import { useState, useEffect, useRef } from 'react';
import { useEmpresas, Empresa } from '@/hooks/useEmpresas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Componente de Seletor de Empresas - Header compacto
 * Exibe dropdown com nome fantasia e indicador de certificado
 */
export function EmpresaSelector() {
  const { empresas, empresaSelecionada, selecionarEmpresa, loading, error } =
    useEmpresas();
  
  // Cache de status de certificado por empresa
  const [certStatus, setCertStatus] = useState<Record<number, { temCert: boolean; valido: boolean; vencimento?: string }>>({});
  
  // Ref para evitar chamadas duplicadas
  const fetchedRef = useRef(false);
  const empresasIdsRef = useRef('');

  // Buscar status de certificado para todas as empresas (apenas uma vez)
  useEffect(() => {
    const currentIds = empresas.map(e => e.id).sort().join(',');
    
    // Só buscar se as empresas mudaram e não foi buscado ainda
    if (empresas.length === 0 || currentIds === empresasIdsRef.current) return;
    
    empresasIdsRef.current = currentIds;

    const fetchCertStatus = async () => {
      const statusMap: Record<number, { temCert: boolean; valido: boolean; vencimento?: string }> = {};
      
      // Buscar em paralelo mas com controle
      const promises = empresas.map(async (empresa) => {
        try {
          const response = await fetch(`/api/certificados/empresa/${empresa.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data && data.data.length > 0) {
              const cert = data.data[0];
              const vencido = cert.dataValidade ? new Date(cert.dataValidade) < new Date() : false;
              statusMap[empresa.id] = {
                temCert: true,
                valido: !vencido,
                vencimento: cert.dataValidade,
              };
            } else {
              statusMap[empresa.id] = { temCert: false, valido: false };
            }
          } else {
            statusMap[empresa.id] = { temCert: false, valido: false };
          }
        } catch {
          statusMap[empresa.id] = { temCert: false, valido: false };
        }
      });

      await Promise.all(promises);
      setCertStatus(statusMap);
    };

    fetchCertStatus();
  }, [empresas]);

  const getCertIcon = (empresaId: number) => {
    const status = certStatus[empresaId];
    if (!status || !status.temCert) {
      return <ShieldAlert className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />;
    }
    if (!status.valido) {
      return <ShieldAlert className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />;
    }
    return <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />;
  };

  const getCertTooltip = (empresaId: number) => {
    const status = certStatus[empresaId];
    if (!status || !status.temCert) return 'Sem certificado digital';
    if (!status.valido) return 'Certificado vencido';
    const venc = status.vencimento ? new Date(status.vencimento).toLocaleDateString('pt-BR') : '';
    return `Certificado válido${venc ? ` (vence em ${venc})` : ''}`;
  };

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
      {/* Indicador de certificado da empresa selecionada */}
      {empresaSelecionada && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              {getCertIcon(empresaSelecionada.id)}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{getCertTooltip(empresaSelecionada.id)}</p>
          </TooltipContent>
        </Tooltip>
      )}

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
        <SelectTrigger className="w-[300px] h-9 border-border bg-background text-sm font-medium">
          <SelectValue placeholder="Selecione uma empresa" />
        </SelectTrigger>
        <SelectContent>
          {empresas.map((empresa) => (
            <SelectItem key={empresa.id} value={empresa.id.toString()}>
              <div className="flex items-center gap-2">
                {getCertIcon(empresa.id)}
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
