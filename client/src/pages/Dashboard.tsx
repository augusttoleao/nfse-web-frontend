import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { fetchNotasResume } from '@/hooks/useNotas';

interface ResumoDados {
  totalEmitidas: number;
  totalRecebidas: number;
  valorTotalEmitidas: number;
  valorTotalRecebidas: number;
}

export default function Dashboard() {
  const [resumo, setResumo] = useState<ResumoDados>({
    totalEmitidas: 0,
    totalRecebidas: 0,
    valorTotalEmitidas: 0,
    valorTotalRecebidas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResumo = async () => {
      const dados = await fetchNotasResume();
      setResumo(dados);
      setLoading(false);
    };
    loadResumo();
  }, []);

  const chartData = [
    { name: 'Emitidas', valor: resumo.totalEmitidas },
    { name: 'Recebidas', valor: resumo.totalRecebidas },
  ];

  const pieData = [
    { name: 'Emitidas', value: resumo.valorTotalEmitidas },
    { name: 'Recebidas', value: resumo.valorTotalRecebidas },
  ];

  const COLORS = ['#1976d2', '#42a5f5'];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Resumo de Notas Fiscais de Serviço</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Emitidas */}
        <Card className="p-6 bg-card border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notas Emitidas</p>
              <p className="text-3xl font-bold text-foreground">
                {loading ? '-' : resumo.totalEmitidas}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Total Recebidas */}
        <Card className="p-6 bg-card border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notas Recebidas</p>
              <p className="text-3xl font-bold text-foreground">
                {loading ? '-' : resumo.totalRecebidas}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Valor Emitidas */}
        <Card className="p-6 bg-card border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Valor Emitido</p>
              <p className="text-3xl font-bold text-foreground">
                {loading ? '-' : `R$ ${resumo.valorTotalEmitidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Valor Recebidas */}
        <Card className="p-6 bg-card border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Valor Recebido</p>
              <p className="text-3xl font-bold text-foreground">
                {loading ? '-' : `R$ ${resumo.valorTotalRecebidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras */}
        <Card className="p-6 bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quantidade de Notas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#757575" />
              <YAxis stroke="#757575" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}
                labelStyle={{ color: '#212121' }}
              />
              <Bar dataKey="valor" fill="#1976d2" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Gráfico de Pizza */}
        <Card className="p-6 bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição de Valores</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}
                labelStyle={{ color: '#212121' }}
                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Informações */}
      <Card className="mt-6 p-6 bg-blue-50 border border-blue-200">
        <div className="flex gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Informação</h4>
            <p className="text-sm text-blue-800">
              Os dados são consultados em tempo real da API SEFIN Nacional. Atualize a página para obter os dados mais recentes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
