import { useState, useEffect } from 'react';

export interface Empresa {
  id: number;
  idEmpresa: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  ativo: string | null;
  bairro: string | null;
  endereco: string | null;
  enderecoNumero: string | null;
  enderecoComplemento: string | null;
  cep: string | null;
  cidade: string | null;
  uf: string | null;
  inscricaoMunicipal: string | null;
  inscricaoEstadual: string | null;
  telefone: string | null;
  telefoneDdd: string | null;
  email: string | null;
  cnae: string | null;
  tipoInscricao: string | null;
  dataInclusao: string | null;
  dataAlteracao: string | null;
  codigoIbge: number | null;
  logradouro: string | null;
  tipoLogradouro: string | null;
  nfseTokenEmissao: string | null;
}

interface UseEmpresasReturn {
  empresas: Empresa[];
  empresaSelecionada: Empresa | null;
  selecionarEmpresa: (empresa: Empresa) => void;
  loading: boolean;
  error: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Hook para gerenciar lista de empresas e seleção
 * Busca apenas empresas ativas (ATIVO = 'S')
 * Persiste a empresa selecionada no localStorage
 */
export function useEmpresas(): UseEmpresasReturn {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar empresas ativas da API
  useEffect(() => {
    const carregarEmpresas = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar apenas empresas ativas (ATIVO = 'S')
        const response = await fetch(`${API_BASE_URL}/empresas/ativas`);
        
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
              // Verificar se a empresa ainda existe na lista de ativas
              const empresaExiste = data.data.find((e: Empresa) => e.id === empresa.id);
              if (empresaExiste) {
                setEmpresaSelecionada(empresaExiste);
              } else {
                setEmpresaSelecionada(data.data[0] || null);
              }
            } catch {
              setEmpresaSelecionada(data.data[0] || null);
            }
          } else {
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
