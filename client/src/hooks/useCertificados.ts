import { useState } from 'react';

interface Certificado {
  id: number;
  empresaId: number;
  cnpj: string;
  razaoSocial: string;
  numeroSerie: string;
  dataVencimento: string;
  assunto: string;
  emissor: string;
  dataProcessamento: string;
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

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Hook para gerenciar certificados digitais
 */
export function useCertificados(): UseCertificadosReturn {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fazer upload de certificado
   */
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao fazer upload do certificado');
      }

      const data = await response.json();
      
      if (data.success) {
        // Recarregar lista de certificados
        await listarCertificados(empresaId);
      }
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(mensagem);
      console.error('Erro ao fazer upload:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validar certificado sem salvar
   */
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao validar certificado');
      }

      const data = await response.json();
      return data.valido === true;
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(mensagem);
      console.error('Erro ao validar:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Listar certificados de uma empresa
   */
  const listarCertificados = async (empresaId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/certificados/empresa/${empresaId}`);

      if (!response.ok) {
        throw new Error('Erro ao listar certificados');
      }

      const data = await response.json();

      if (data.success && data.data) {
        setCertificados(data.data);
      }
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(mensagem);
      console.error('Erro ao listar certificados:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletar certificado
   */
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

      // Remover da lista local
      setCertificados(certificados.filter(c => c.id !== certificadoId));
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(mensagem);
      console.error('Erro ao deletar:', err);
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
