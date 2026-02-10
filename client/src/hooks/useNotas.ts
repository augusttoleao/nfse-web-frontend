import { useState, useEffect, useMemo } from 'react';

export interface Pessoa {
  cnpj: string;
  cpf?: string;
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoMunicipal?: string;
  email?: string;
  telefone?: string;
}

export interface Nota {
  numero: string;
  chaveAcesso: string;
  dataEmissao: string;
  competencia?: string;
  valor: number;
  valorDeducoes?: number;
  valorIss?: number;
  aliquota?: number;
  descricao: string;
  codigoServico?: string;
  status: string;
  motivo?: string;
  prestador?: Pessoa;
  tomador?: Pessoa;
  xmlOriginal?: string;
}

export interface NotasResponse {
  success: boolean;
  data?: {
    notas: Nota[];
    total: number;
    pagina: number;
    itensPorPagina: number;
    totalPaginas?: number;
  };
  message?: string;
  error?: string;
}

interface UseNotasParams {
  tipo: 'emitidas' | 'recebidas';
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  itensPorPagina?: number;
  empresaId?: number;
}

/**
 * Hook para consultar notas fiscais via ADN (Ambiente de Dados Nacional)
 * Envia empresaId para o backend buscar CNPJ/IM e certificado do banco
 * Só faz a requisição quando há datas de filtro e empresa selecionada
 */
export function useNotas({
  tipo,
  dataInicio,
  dataFim,
  pagina = 1,
  itensPorPagina = 10,
  empresaId,
}: UseNotasParams) {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estabilizar parâmetros
  const stableParams = useMemo(() => ({
    tipo, dataInicio, dataFim, pagina, itensPorPagina, empresaId
  }), [tipo, dataInicio, dataFim, pagina, itensPorPagina, empresaId]);

  useEffect(() => {
    // Não buscar se não tem datas definidas ou empresa selecionada
    if (!stableParams.dataInicio || !stableParams.dataFim || !stableParams.empresaId) {
      setNotas([]);
      setTotal(0);
      setTotalPaginas(0);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchNotas = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('empresaId', stableParams.empresaId!.toString());
        params.append('dataInicio', stableParams.dataInicio!);
        params.append('dataFim', stableParams.dataFim!);
        params.append('pagina', stableParams.pagina.toString());
        params.append('itensPorPagina', stableParams.itensPorPagina.toString());

        const url = `/api/notas/${stableParams.tipo}?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Erro ${response.status}: ${response.statusText}`);
        }

        const data: NotasResponse = await response.json();

        if (data.success && data.data) {
          setNotas(data.data.notas || []);
          setTotal(data.data.total || 0);
          setTotalPaginas(data.data.totalPaginas || 0);
        } else {
          setNotas([]);
          setTotal(0);
          setTotalPaginas(0);
          if (data.message) {
            setError(data.message);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao buscar notas';
        setError(message);
        setNotas([]);
        setTotal(0);
        setTotalPaginas(0);
        console.error('Erro ao buscar notas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotas();
  }, [stableParams]);

  return { notas, total, totalPaginas, loading, error };
}

/**
 * Buscar resumo de notas para o Dashboard
 */
export async function fetchNotasResume() {
  return {
    totalEmitidas: 0,
    totalRecebidas: 0,
    valorTotalEmitidas: 0,
    valorTotalRecebidas: 0,
  };
}
