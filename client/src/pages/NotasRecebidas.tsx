import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNotas } from '@/hooks/useNotas';
import { useEmpresas } from '@/hooks/useEmpresas';
import { Search, Filter, Download, Eye, AlertCircle, FileText } from 'lucide-react';

export default function NotasRecebidas() {
  const { empresaSelecionada } = useEmpresas();
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroBusca, setFiltroBusca] = useState('');
  const [pagina, setPagina] = useState(1);

  const { notas, total, loading, error } = useNotas({
    tipo: 'recebidas',
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
    pagina,
    itensPorPagina: 10,
    empresaId: empresaSelecionada?.id,
  });

  const notasFiltradas = notas.filter((nota) => {
    if (!filtroBusca) return true;
    const busca = filtroBusca.toLowerCase();
    return (
      (nota.numero && nota.numero.toLowerCase().includes(busca)) ||
      (nota.chaveAcesso && nota.chaveAcesso.toLowerCase().includes(busca)) ||
      (nota.descricao && nota.descricao.toLowerCase().includes(busca)) ||
      (nota.cnpj && nota.cnpj.includes(filtroBusca))
    );
  });

  const totalPaginas = Math.max(1, Math.ceil(total / 10));

  if (!empresaSelecionada) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Selecione uma empresa no canto superior direito para consultar notas recebidas.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notas Recebidas</h1>
        <p className="text-sm text-muted-foreground">
          Consulte as notas fiscais recebidas por {empresaSelecionada.nomeFantasia || empresaSelecionada.razaoSocial}
        </p>
      </div>

      {/* Filtros */}
      <Card className="p-4 bg-card border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>

          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => { setDataInicio(e.target.value); setPagina(1); }}
            className="h-9 text-sm"
          />

          <Input
            type="date"
            value={dataFim}
            onChange={(e) => { setDataFim(e.target.value); setPagina(1); }}
            className="h-9 text-sm"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => { setDataInicio(''); setDataFim(''); setFiltroBusca(''); setPagina(1); }}
          >
            Limpar
          </Button>
        </div>

        {(!dataInicio || !dataFim) && (
          <p className="text-xs text-muted-foreground mt-2">
            Informe a data de início e fim para consultar as notas recebidas.
          </p>
        )}
      </Card>

      {/* Tabela */}
      <Card className="bg-card border border-border overflow-hidden">
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-red-800">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Número</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Emitente (CNPJ)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Data Emissão</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Descrição</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-foreground">Valor</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-foreground">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Carregando notas...
                  </td>
                </tr>
              ) : !dataInicio || !dataFim ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Informe o período para consultar
                  </td>
                </tr>
              ) : notasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Nenhuma nota encontrada no período
                  </td>
                </tr>
              ) : (
                notasFiltradas.map((nota, idx) => (
                  <tr key={nota.chaveAcesso || idx} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{nota.numero}</td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {nota.cnpj ? formatCnpj(nota.cnpj) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {new Date(nota.dataEmissao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground truncate max-w-xs">{nota.descricao}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground text-right">
                      R$ {(nota.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {nota.status || 'Autorizado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 hover:bg-secondary rounded transition-colors" title="Visualizar">
                          <Eye className="w-4 h-4 text-primary" />
                        </button>
                        <button className="p-1.5 hover:bg-secondary rounded transition-colors" title="Baixar">
                          <Download className="w-4 h-4 text-primary" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {!loading && notasFiltradas.length > 0 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Mostrando {notasFiltradas.length} de {total} notas
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>
                Anterior
              </Button>
              <span className="px-3 py-1.5 text-xs text-foreground">
                {pagina} / {totalPaginas}
              </span>
              <Button variant="outline" size="sm" disabled={pagina >= totalPaginas} onClick={() => setPagina(pagina + 1)}>
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function formatCnpj(cnpj: string): string {
  if (!cnpj || cnpj.length !== 14) return cnpj || '-';
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}
