import { useState, useEffect } from 'react';
import { useEmpresas } from '@/hooks/useEmpresas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
  Building2,
  Hash,
  MapPin,
  DollarSign,
  FileCode,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface DPSFormData {
  // Tomador
  tomadorTipo: 'PF' | 'PJ';
  tomadorCpfCnpj: string;
  tomadorRazaoSocial: string;
  tomadorNomeFantasia: string;
  tomadorEmail: string;
  tomadorTelefone: string;
  tomadorInscricaoMunicipal: string;
  // Endereço do Tomador
  tomadorCep: string;
  tomadorLogradouro: string;
  tomadorNumero: string;
  tomadorComplemento: string;
  tomadorBairro: string;
  tomadorCidade: string;
  tomadorUf: string;
  tomadorCodigoIbge: string;
  // Serviço
  codigoServico: string;
  cnae: string;
  discriminacao: string;
  valorServico: string;
  valorDeducoes: string;
  valorPis: string;
  valorCofins: string;
  valorInss: string;
  valorIr: string;
  valorCsll: string;
  valorIss: string;
  aliquotaIss: string;
  issRetido: boolean;
  // Outros
  competencia: string;
  naturezaTributacao: string;
  regimeEspecialTributacao: string;
  optanteSimplesNacional: boolean;
  incentivadorCultural: boolean;
}

const initialFormData: DPSFormData = {
  tomadorTipo: 'PJ',
  tomadorCpfCnpj: '',
  tomadorRazaoSocial: '',
  tomadorNomeFantasia: '',
  tomadorEmail: '',
  tomadorTelefone: '',
  tomadorInscricaoMunicipal: '',
  tomadorCep: '',
  tomadorLogradouro: '',
  tomadorNumero: '',
  tomadorComplemento: '',
  tomadorBairro: '',
  tomadorCidade: '',
  tomadorUf: '',
  tomadorCodigoIbge: '',
  codigoServico: '',
  cnae: '',
  discriminacao: '',
  valorServico: '',
  valorDeducoes: '0',
  valorPis: '0',
  valorCofins: '0',
  valorInss: '0',
  valorIr: '0',
  valorCsll: '0',
  valorIss: '0',
  aliquotaIss: '',
  issRetido: false,
  competencia: new Date().toISOString().slice(0, 7),
  naturezaTributacao: '1',
  regimeEspecialTributacao: '0',
  optanteSimplesNacional: false,
  incentivadorCultural: false,
};

export default function EmissaoDPS() {
  const { empresaSelecionada } = useEmpresas();
  const [formData, setFormData] = useState<DPSFormData>(initialFormData);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ tipo: 'sucesso' | 'erro'; texto: string; detalhes?: string } | null>(null);
  const [temCertificado, setTemCertificado] = useState<boolean | null>(null);

  // Verificar se empresa tem certificado
  useEffect(() => {
    if (!empresaSelecionada) return;
    const checkCert = async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/certificados/empresa/${empresaSelecionada.id}`);
        const data = await resp.json();
        setTemCertificado(data.success && data.data && data.data.length > 0);
      } catch {
        setTemCertificado(false);
      }
    };
    checkCert();
  }, [empresaSelecionada?.id]);

  // Preencher dados da empresa emitente automaticamente
  useEffect(() => {
    if (empresaSelecionada) {
      setFormData(prev => ({
        ...prev,
        cnae: empresaSelecionada.cnae || prev.cnae,
      }));
    }
  }, [empresaSelecionada]);

  const handleChange = (field: keyof DPSFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Buscar CEP
  const buscarCep = async () => {
    const cep = formData.tomadorCep.replace(/\D/g, '');
    if (cep.length !== 8) {
      toast.error('CEP deve ter 8 dígitos');
      return;
    }
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await resp.json();
      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }
      setFormData(prev => ({
        ...prev,
        tomadorLogradouro: data.logradouro || '',
        tomadorBairro: data.bairro || '',
        tomadorCidade: data.localidade || '',
        tomadorUf: data.uf || '',
        tomadorCodigoIbge: data.ibge || '',
      }));
      toast.success('Endereço preenchido pelo CEP');
    } catch {
      toast.error('Erro ao buscar CEP');
    }
  };

  const handleSubmit = async () => {
    if (!empresaSelecionada) {
      toast.error('Selecione uma empresa');
      return;
    }

    if (!temCertificado) {
      toast.error('Esta empresa não possui certificado digital cadastrado');
      return;
    }

    // Validações básicas
    if (!formData.tomadorCpfCnpj || !formData.tomadorRazaoSocial) {
      toast.error('Preencha os dados do tomador');
      return;
    }
    if (!formData.codigoServico || !formData.discriminacao || !formData.valorServico) {
      toast.error('Preencha os dados do serviço');
      return;
    }

    try {
      setEnviando(true);
      setResultado(null);

      const payload = {
        empresaId: empresaSelecionada.id,
        cnpjPrestador: empresaSelecionada.cnpj,
        inscricaoMunicipalPrestador: empresaSelecionada.inscricaoMunicipal,
        tomador: {
          tipo: formData.tomadorTipo,
          cpfCnpj: formData.tomadorCpfCnpj.replace(/\D/g, ''),
          razaoSocial: formData.tomadorRazaoSocial,
          nomeFantasia: formData.tomadorNomeFantasia,
          email: formData.tomadorEmail,
          telefone: formData.tomadorTelefone,
          inscricaoMunicipal: formData.tomadorInscricaoMunicipal,
          endereco: {
            cep: formData.tomadorCep.replace(/\D/g, ''),
            logradouro: formData.tomadorLogradouro,
            numero: formData.tomadorNumero,
            complemento: formData.tomadorComplemento,
            bairro: formData.tomadorBairro,
            cidade: formData.tomadorCidade,
            uf: formData.tomadorUf,
            codigoIbge: formData.tomadorCodigoIbge,
          },
        },
        servico: {
          codigoServico: formData.codigoServico,
          cnae: formData.cnae,
          discriminacao: formData.discriminacao,
          valorServico: parseFloat(formData.valorServico) || 0,
          valorDeducoes: parseFloat(formData.valorDeducoes) || 0,
          valorPis: parseFloat(formData.valorPis) || 0,
          valorCofins: parseFloat(formData.valorCofins) || 0,
          valorInss: parseFloat(formData.valorInss) || 0,
          valorIr: parseFloat(formData.valorIr) || 0,
          valorCsll: parseFloat(formData.valorCsll) || 0,
          valorIss: parseFloat(formData.valorIss) || 0,
          aliquotaIss: parseFloat(formData.aliquotaIss) || 0,
          issRetido: formData.issRetido,
        },
        competencia: formData.competencia,
        naturezaTributacao: parseInt(formData.naturezaTributacao),
        regimeEspecialTributacao: parseInt(formData.regimeEspecialTributacao),
        optanteSimplesNacional: formData.optanteSimplesNacional,
        incentivadorCultural: formData.incentivadorCultural,
      };

      const response = await fetch(`${API_BASE_URL}/notas/emitir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResultado({
          tipo: 'sucesso',
          texto: 'DPS enviada com sucesso! NFSe em processamento.',
          detalhes: data.data?.idDps ? `ID DPS: ${data.data.idDps}` : undefined,
        });
        toast.success('DPS enviada com sucesso!');
        // Limpar formulário
        setFormData(initialFormData);
      } else {
        setResultado({
          tipo: 'erro',
          texto: data.message || 'Erro ao enviar DPS',
          detalhes: data.error || JSON.stringify(data.details || data.data, null, 2),
        });
        toast.error(data.message || 'Erro ao enviar DPS');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setResultado({ tipo: 'erro', texto: msg });
      toast.error(msg);
    } finally {
      setEnviando(false);
    }
  };

  if (!empresaSelecionada) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Selecione uma empresa no canto superior direito para emitir NFSe.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Send className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Emissão de DPS / NFSe</h1>
          <p className="text-sm text-muted-foreground">
            Emitir nota fiscal de serviço para {empresaSelecionada.nomeFantasia || empresaSelecionada.razaoSocial}
          </p>
        </div>
      </div>

      {/* Alerta de certificado */}
      {temCertificado === false && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta empresa não possui certificado digital cadastrado. Acesse a página de Empresas para fazer o upload do certificado A1 (PFX).
          </AlertDescription>
        </Alert>
      )}

      {/* Resultado */}
      {resultado && (
        <Alert variant={resultado.tipo === 'sucesso' ? 'default' : 'destructive'}>
          {resultado.tipo === 'sucesso' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>
            <p>{resultado.texto}</p>
            {resultado.detalhes && (
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto max-h-40">{resultado.detalhes}</pre>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Dados do Prestador (readonly) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Prestador (Emitente)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FieldReadonly label="CNPJ" value={formatCnpj(empresaSelecionada.cnpj)} />
            <FieldReadonly label="Razão Social" value={empresaSelecionada.razaoSocial} />
            <FieldReadonly label="Inscrição Municipal" value={empresaSelecionada.inscricaoMunicipal || '-'} />
          </div>
        </CardContent>
      </Card>

      {/* Dados do Tomador */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Tomador (Destinatário)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo</label>
              <Select value={formData.tomadorTipo} onValueChange={(v) => handleChange('tomadorTipo', v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                  <SelectItem value="PF">Pessoa Física</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                {formData.tomadorTipo === 'PJ' ? 'CNPJ' : 'CPF'}
              </label>
              <Input
                value={formData.tomadorCpfCnpj}
                onChange={(e) => handleChange('tomadorCpfCnpj', e.target.value)}
                placeholder={formData.tomadorTipo === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Razão Social / Nome</label>
              <Input
                value={formData.tomadorRazaoSocial}
                onChange={(e) => handleChange('tomadorRazaoSocial', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Nome Fantasia</label>
              <Input
                value={formData.tomadorNomeFantasia}
                onChange={(e) => handleChange('tomadorNomeFantasia', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">E-mail</label>
              <Input
                type="email"
                value={formData.tomadorEmail}
                onChange={(e) => handleChange('tomadorEmail', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Telefone</label>
              <Input
                value={formData.tomadorTelefone}
                onChange={(e) => handleChange('tomadorTelefone', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Inscrição Municipal</label>
              <Input
                value={formData.tomadorInscricaoMunicipal}
                onChange={(e) => handleChange('tomadorInscricaoMunicipal', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Endereço do Tomador */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Endereço do Tomador
            </p>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1">CEP</label>
                <div className="flex gap-1">
                  <Input
                    value={formData.tomadorCep}
                    onChange={(e) => handleChange('tomadorCep', e.target.value)}
                    placeholder="00000-000"
                    className="h-9 text-sm"
                  />
                  <Button variant="outline" size="sm" onClick={buscarCep} className="h-9 px-2 flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Logradouro</label>
                <Input
                  value={formData.tomadorLogradouro}
                  onChange={(e) => handleChange('tomadorLogradouro', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Número</label>
                <Input
                  value={formData.tomadorNumero}
                  onChange={(e) => handleChange('tomadorNumero', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Complemento</label>
                <Input
                  value={formData.tomadorComplemento}
                  onChange={(e) => handleChange('tomadorComplemento', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Bairro</label>
                <Input
                  value={formData.tomadorBairro}
                  onChange={(e) => handleChange('tomadorBairro', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Cidade</label>
                <Input
                  value={formData.tomadorCidade}
                  onChange={(e) => handleChange('tomadorCidade', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">UF</label>
                <Input
                  value={formData.tomadorUf}
                  onChange={(e) => handleChange('tomadorUf', e.target.value)}
                  maxLength={2}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Código IBGE</label>
                <Input
                  value={formData.tomadorCodigoIbge}
                  onChange={(e) => handleChange('tomadorCodigoIbge', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Serviço */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Dados do Serviço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Código do Serviço (LC 116)</label>
              <Input
                value={formData.codigoServico}
                onChange={(e) => handleChange('codigoServico', e.target.value)}
                placeholder="Ex: 01.01"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">CNAE</label>
              <Input
                value={formData.cnae}
                onChange={(e) => handleChange('cnae', e.target.value)}
                placeholder="Ex: 8599604"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Competência</label>
              <Input
                type="month"
                value={formData.competencia}
                onChange={(e) => handleChange('competencia', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Discriminação do Serviço</label>
            <textarea
              value={formData.discriminacao}
              onChange={(e) => handleChange('discriminacao', e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Descrição detalhada do serviço prestado..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Valores */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Valores e Tributos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Valor do Serviço (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.valorServico}
                onChange={(e) => handleChange('valorServico', e.target.value)}
                placeholder="0,00"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Deduções (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.valorDeducoes}
                onChange={(e) => handleChange('valorDeducoes', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Alíquota ISS (%)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.aliquotaIss}
                onChange={(e) => handleChange('aliquotaIss', e.target.value)}
                placeholder="Ex: 5.00"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Valor ISS (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.valorIss}
                onChange={(e) => handleChange('valorIss', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">PIS (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.valorPis}
                onChange={(e) => handleChange('valorPis', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">COFINS (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.valorCofins}
                onChange={(e) => handleChange('valorCofins', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">INSS (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.valorInss}
                onChange={(e) => handleChange('valorInss', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">IR (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.valorIr}
                onChange={(e) => handleChange('valorIr', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">CSLL (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.valorCsll}
                onChange={(e) => handleChange('valorCsll', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Opções de tributação */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-border">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Natureza da Tributação</label>
              <Select value={formData.naturezaTributacao} onValueChange={(v) => handleChange('naturezaTributacao', v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Tributação no município</SelectItem>
                  <SelectItem value="2">Tributação fora do município</SelectItem>
                  <SelectItem value="3">Isenção</SelectItem>
                  <SelectItem value="4">Imune</SelectItem>
                  <SelectItem value="5">Exigibilidade suspensa por decisão judicial</SelectItem>
                  <SelectItem value="6">Exigibilidade suspensa por procedimento administrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.issRetido}
                  onChange={(e) => handleChange('issRetido', e.target.checked)}
                  className="rounded border-border"
                />
                ISS Retido
              </label>
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.optanteSimplesNacional}
                  onChange={(e) => handleChange('optanteSimplesNacional', e.target.checked)}
                  className="rounded border-border"
                />
                Simples Nacional
              </label>
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.incentivadorCultural}
                  onChange={(e) => handleChange('incentivadorCultural', e.target.checked)}
                  className="rounded border-border"
                />
                Incentivador Cultural
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setFormData(initialFormData);
            setResultado(null);
          }}
          disabled={enviando}
        >
          Limpar Formulário
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={enviando || temCertificado === false}
          className="min-w-[180px]"
        >
          {enviando ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando DPS...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Emitir NFSe
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function FieldReadonly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <div className="h-9 flex items-center px-3 bg-muted rounded-md text-sm font-medium text-foreground">
        {value}
      </div>
    </div>
  );
}

function formatCnpj(cnpj: string): string {
  if (!cnpj || cnpj.length !== 14) return cnpj || '-';
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}
