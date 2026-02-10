import { useState, useEffect } from 'react';

interface Empresa {
  id: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  inscricaoMunicipal: string;
  ativo: boolean;
  dataAtualizacao: string;
}

interface UseEmpresasReturn {
  empresas: Empresa[];
  empresaSelecionada: Empresa | null;
  selecionarEmpresa: (empresa: Empresa) => void;
  loading: boolean;
  error: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://nfse.easytecsis.com.br/api';

/**
 * Hook para gerenciar lista de empresas e seleção
 * Persiste a empresa selecionada no localStorage
 */
export function useEmpresas(): UseEmpresasReturn {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar empresas da API
  useEffect(() => {
    const carregarEmpresas = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/empresas`);
        
        if (!response.ok) {
          throw new Error(`Erro ao carregar empresas: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setEmpresas(data.data);

          // Restaurar empresa selecionada do localStorage
          const empresaSalva = localStorage.getItem('empresaSelecionada');
          if (empresaSalva) {
            try {
              const empresa = JSON.parse(empresaSalva);
              // Verificar se a empresa ainda existe
              const empresaExiste = data.data.find((e: Empresa) => e.id === empresa.id);
              if (empresaExiste) {
                setEmpresaSelecionada(empresaExiste);
              } else {
                // Se não existe, selecionar a primeira
                setEmpresaSelecionada(data.data[0] || null);
              }
            } catch (e) {
              setEmpresaSelecionada(data.data[0] || null);
            }
          } else {
            // Se nenhuma foi salva, selecionar a primeira
            setEmpresaSelecionada(data.data[0] || null);
          }
        }
      } catch (err) {
        const mensagem = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(mensagem);
        console.error('Erro ao carregar empresas:', err);
      } finally {
        setLoading(false);
      }
    };

    carregarEmpresas();
  }, []);

  // Função para selecionar empresa
  const selecionarEmpresa = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa);
    // Persistir no localStorage
    localStorage.setItem('empresaSelecionada', JSON.stringify(empresa));
  };

  return {
    empresas,
    empresaSelecionada,
    selecionarEmpresa,
    loading,
    error,
  };
}
