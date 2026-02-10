import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Nota {
  numero: string;
  chaveAcesso: string;
  dataEmissao: string;
  dataVencimento?: string;
  valor: number;
  descricao: string;
  status: string;
  cnpj?: string;
  inscricaoMunicipal?: string;
}

export interface NotasResponse {
  success: boolean;
  data?: {
    notas: Nota[];
    total: number;
    pagina: number;
    itensPorPagina: number;
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
}

const API_BASE_URL = '';

export function useNotas({
  tipo,
  dataInicio,
  dataFim,
  pagina = 1,
  itensPorPagina = 50,
}: UseNotasParams) {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (dataInicio) params.append('dataInicio', dataInicio);
        if (dataFim) params.append('dataFim', dataFim);
        params.append('pagina', pagina.toString());
        params.append('itensPorPagina', itensPorPagina.toString());

        const url = `${API_BASE_URL}/api/notas/${tipo}?${params.toString()}`;
        const response = await axios.get<NotasResponse>(url);

        if (response.data.success && response.data.data) {
          setNotas(response.data.data.notas);
          setTotal(response.data.data.total);
        } else {
          setError(response.data.message || 'Erro ao buscar notas');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao buscar notas';
        setError(message);
        console.error('Erro ao buscar notas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotas();
  }, [tipo, dataInicio, dataFim, pagina, itensPorPagina]);

  return { notas, total, loading, error };
}

export async function fetchNotasResume() {
  try {
    const [emitidas, recebidas] = await Promise.all([
      axios.get<NotasResponse>(`${API_BASE_URL}/api/notas/emitidas?itensPorPagina=1`),
      axios.get<NotasResponse>(`${API_BASE_URL}/api/notas/recebidas?itensPorPagina=1`),
    ]);

    return {
      totalEmitidas: emitidas.data.data?.total || 0,
      totalRecebidas: recebidas.data.data?.total || 0,
      valorTotalEmitidas: emitidas.data.data?.notas.reduce((sum, n) => sum + n.valor, 0) || 0,
      valorTotalRecebidas: recebidas.data.data?.notas.reduce((sum, n) => sum + n.valor, 0) || 0,
    };
  } catch (err) {
    console.error('Erro ao buscar resumo de notas:', err);
    return {
      totalEmitidas: 0,
      totalRecebidas: 0,
      valorTotalEmitidas: 0,
      valorTotalRecebidas: 0,
    };
  }
}
