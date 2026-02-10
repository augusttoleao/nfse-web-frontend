import { useState } from 'react';

interface Certificado {
  id: number;
  empresaId: number;
  cnpj: string;
  razaoSocial: string;
  nomeArquivo: string;
  dataValidade: string;
  dataInclusao: string;
  dataAlteracao: string;
  numeroSerie: string;
}

interface UseCertificadosReturn {
  certificados: Certificado[];
  loading: boolean;
  error: string | null;
  uploadCertificado: (file: File, empresaId: number, cnpj: string, razaoSocial: string, senha: string) => Promise<void>;
  validarCertificado: (file: File, senha: string) => Promise<boolean>;
  listarCertificados: (empresaId: number) => Promise<void>;
  deletarCertificado: (certificadoId: number) => Promise<void>;
}

const API_BASE_URL = '/api';

/**
 * Hook para gerenciar certificados digitais
 */
export function useCertificados(): UseCertificadosReturn {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadCertificado = async (
    file: File,
    empresaId: number,
    cnpj: string,
    razaoSocial: string,
    senha: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('certificado', file);
      formData.append('empresaId', empresaId.toString());
      formData.append('cnpj', cnpj);
      formData.append('razaoSocial', razaoSocial);
      formData.append('senha', senha);

      const response = await fetch(`${API_BASE_URL}/certificados/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || 'Erro ao fazer upload do certificado');
      }

      // Recarregar lista
      await listarCertificados(empresaId);
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(mensagem);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validarCertificado = async (file: File, senha: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('certificado', file);
      formData.append('senha', senha);

      const response = await fetch(`${API_BASE_URL}/certificados/validar`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao validar certificado');
      }
      return data.valido === true;
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(mensagem);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const listarCertificados = async (empresaId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/certificados/empresa/${empresaId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setCertificados(data.data);
      } else {
        setCertificados([]);
      }
    } catch (err) {
      // Não quebrar a tela se der erro - apenas mostrar lista vazia
      setCertificados([]);
      console.error('Erro ao listar certificados:', err);
    } finally {
      setLoading(false);
    }
  };

  const deletarCertificado = async (certificadoId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/certificados/${certificadoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar certificado');
      }

      setCertificados(prev => prev.filter(c => c.id !== certificadoId));
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(mensagem);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    certificados,
    loading,
    error,
    uploadCertificado,
    validarCertificado,
    listarCertificados,
    deletarCertificado,
  };
}
