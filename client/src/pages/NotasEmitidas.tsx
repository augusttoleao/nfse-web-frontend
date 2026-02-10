import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotas, Nota } from '@/hooks/useNotas';
import { Search, Filter, Download, Eye } from 'lucide-react';

export default function NotasEmitidas() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroValor, setFiltroValor] = useState('');
  const [filtroBusca, setFiltroBusca] = useState('');
  const [pagina, setPagina] = useState(1);

  const { notas, total, loading, error } = useNotas({
    tipo: 'emitidas',
    dataInicio,
    dataFim,
    pagina,
    itensPorPagina: 10,
  });

  const notasFiltradas = notas.filter((nota) => {
    const matchBusca = nota.numero.includes(filtroBusca) || 
                       nota.chaveAcesso.includes(filtroBusca) ||
                       nota.descricao.toLowerCase().includes(filtroBusca.toLowerCase());
    
    const matchValor = filtroValor === '' || 
                       (filtroValor === 'baixo' && nota.valor < 1000) ||
                       (filtroValor === 'medio' && nota.valor >= 1000 && nota.valor < 5000) ||
                       (filtroValor === 'alto' && nota.valor >= 5000);
    
    return matchBusca && matchValor;
  });

  const totalPaginas = Math.ceil(total / 10);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Notas Emitidas</h1>
        <p className="text-muted-foreground">Consulte as notas fiscais emitidas pela sua empresa</p>
      </div>

      {/* Filtros */}
      <Card className="p-6 bg-card border border-border mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número ou chave..."
              value={filtroBusca}
              onChange={(e) => {
                setFiltroBusca(e.target.value);
                setPagina(1);
              }}
              className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Data Início */}
          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => {
              setDataInicio(e.target.value);
              setPagina(1);
            }}
            className="bg-input border-border text-foreground"
          />

          {/* Data Fim */}
          <Input
            type="date"
            value={dataFim}
            onChange={(e) => {
              setDataFim(e.target.value);
              setPagina(1);
            }}
            className="bg-input border-border text-foreground"
          />

          {/* Filtro Valor */}
          <select
            value={filtroValor}
            onChange={(e) => {
              setFiltroValor(e.target.value);
              setPagina(1);
            }}
            className="px-3 py-2 rounded-lg border border-border bg-input text-foreground"
          >
            <option value="">Todos os valores</option>
            <option value="baixo">Até R$ 1.000</option>
            <option value="medio">R$ 1.000 - R$ 5.000</option>
            <option value="alto">Acima de R$ 5.000</option>
          </select>

          {/* Botão Limpar */}
          <Button
            variant="outline"
            onClick={() => {
              setDataInicio('');
              setDataFim('');
              setFiltroValor('');
              setFiltroBusca('');
              setPagina(1);
            }}
            className="border-border text-foreground hover:bg-secondary"
          >
            Limpar Filtros
          </Button>
        </div>
      </Card>

      {/* Tabela */}
      <Card className="bg-card border border-border overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-800">
            <p className="text-sm">Erro ao carregar notas: {error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Número</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Data Emissão</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Descrição</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Valor</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Carregando notas...
                  </td>
                </tr>
              ) : notasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Nenhuma nota encontrada
                  </td>
                </tr>
              ) : (
                notasFiltradas.map((nota) => (
                  <tr key={nota.numero} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{nota.numero}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(nota.dataEmissao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground truncate max-w-xs">{nota.descricao}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground text-right">
                      R$ {nota.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {nota.status || 'Autorizado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-secondary rounded-lg transition-colors" title="Visualizar">
                          <Eye className="w-4 h-4 text-primary" />
                        </button>
                        <button className="p-2 hover:bg-secondary rounded-lg transition-colors" title="Baixar">
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
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {notasFiltradas.length} de {total} notas
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={pagina === 1}
                onClick={() => setPagina(pagina - 1)}
                className="border-border text-foreground hover:bg-secondary disabled:opacity-50"
              >
                Anterior
              </Button>
              <span className="px-4 py-2 text-sm text-foreground">
                Página {pagina} de {totalPaginas}
              </span>
              <Button
                variant="outline"
                disabled={pagina === totalPaginas}
                onClick={() => setPagina(pagina + 1)}
                className="border-border text-foreground hover:bg-secondary disabled:opacity-50"
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
