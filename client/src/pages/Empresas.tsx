import { useState, useEffect, useCallback } from 'react';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useCertificados } from '@/hooks/useCertificados';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Lock,
  MapPin,
  Phone,
  Mail,
  FileText,
  Shield,
  Hash,
} from 'lucide-react';

/**
 * Página de Empresas - Informações da empresa e certificado digital
 */
export default function Empresas() {
  const { empresaSelecionada } = useEmpresas();
  const {
    certificados,
    loading: loadingCerts,
    error: errorCerts,
    uploadCertificado,
    validarCertificado,
    listarCertificados,
    deletarCertificado,
  } = useCertificados();

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [validandoCert, setValidandoCert] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Carregar certificados quando empresa mudar
  const carregarCerts = useCallback(() => {
    if (empresaSelecionada) {
      listarCertificados(empresaSelecionada.id);
    }
  }, [empresaSelecionada?.id]);

  useEffect(() => {
    carregarCerts();
  }, [carregarCerts]);

  const handleValidarCertificado = async () => {
    if (!arquivo || !senha) {
      setMensagem({ tipo: 'erro', texto: 'Selecione um arquivo e informe a senha' });
      return;
    }
    try {
      setValidandoCert(true);
      setMensagem(null);
      const valido = await validarCertificado(arquivo, senha);
      setMensagem({
        tipo: valido ? 'sucesso' : 'erro',
        texto: valido ? 'Certificado válido!' : 'Certificado inválido ou senha incorreta',
      });
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao validar certificado' });
    } finally {
      setValidandoCert(false);
    }
  };

  const handleUpload = async () => {
    if (!arquivo || !senha || !empresaSelecionada) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos' });
      return;
    }
    try {
      setEnviando(true);
      setMensagem(null);
      await uploadCertificado(
        arquivo,
        empresaSelecionada.id,
        empresaSelecionada.cnpj,
        empresaSelecionada.razaoSocial,
        senha
      );
      setMensagem({ tipo: 'sucesso', texto: 'Certificado enviado com sucesso!' });
      setArquivo(null);
      setSenha('');
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao enviar certificado' });
    } finally {
      setEnviando(false);
    }
  };

  const handleDeletar = async (certificadoId: number) => {
    if (!confirm('Tem certeza que deseja deletar este certificado?')) return;
    try {
      await deletarCertificado(certificadoId);
      setMensagem({ tipo: 'sucesso', texto: 'Certificado deletado com sucesso!' });
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao deletar certificado' });
    }
  };

  if (!empresaSelecionada) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Selecione uma empresa no canto superior direito para visualizar os dados.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const e = empresaSelecionada;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {e.nomeFantasia || e.razaoSocial}
          </h1>
          <p className="text-sm text-muted-foreground">{e.razaoSocial}</p>
        </div>
      </div>

      {/* Mensagens */}
      {mensagem && (
        <Alert variant={mensagem.tipo === 'sucesso' ? 'default' : 'destructive'}>
          {mensagem.tipo === 'sucesso' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{mensagem.texto}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados da Empresa */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={Hash} label="CNPJ" value={formatCnpj(e.cnpj)} />
            <InfoRow icon={Building2} label="Razão Social" value={e.razaoSocial} />
            <InfoRow icon={Building2} label="Nome Fantasia" value={e.nomeFantasia || '-'} />
            <InfoRow icon={Hash} label="Inscrição Municipal" value={e.inscricaoMunicipal || '-'} />
            <InfoRow icon={Hash} label="Inscrição Estadual" value={e.inscricaoEstadual || '-'} />
            <InfoRow icon={Hash} label="UF" value={e.uf || '-'} />
          </CardContent>
        </Card>

        {/* Endereço e Contato */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Endereço e Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              icon={MapPin}
              label="Endereço"
              value={
                e.endereco
                  ? `${e.endereco}${e.enderecoNumero ? ', ' + e.enderecoNumero : ''}${e.enderecoComplemento ? ' - ' + e.enderecoComplemento : ''}`
                  : '-'
              }
            />
            <InfoRow icon={MapPin} label="Bairro" value={e.bairro || '-'} />
            <InfoRow icon={MapPin} label="Cidade/UF" value={e.cidade ? `${e.cidade}/${e.uf}` : e.uf || '-'} />
            <InfoRow icon={MapPin} label="CEP" value={e.cep || '-'} />
            <InfoRow icon={Phone} label="Telefone" value={e.telefone || '-'} />
            <InfoRow icon={Mail} label="E-mail" value={e.email || '-'} />
          </CardContent>
        </Card>
      </div>

      {/* Certificado Digital */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Certificado Digital
          </CardTitle>
          <CardDescription>
            Certificado digital A1 (PFX) associado a esta empresa para emissão de NFSe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Certificados Cadastrados */}
          {loadingCerts ? (
            <p className="text-sm text-muted-foreground py-4">Carregando certificados...</p>
          ) : certificados.length > 0 ? (
            <div className="space-y-3 mb-6">
              {certificados.map((cert) => {
                const vencido = new Date(cert.dataVencimento) < new Date();
                const venceEm30Dias =
                  !vencido &&
                  new Date(cert.dataVencimento) <
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                return (
                  <div
                    key={cert.id}
                    className={`border rounded-lg p-4 ${
                      vencido
                        ? 'border-destructive/50 bg-destructive/5'
                        : venceEm30Dias
                        ? 'border-yellow-400/50 bg-yellow-50'
                        : 'border-green-400/50 bg-green-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Shield
                            className={`w-4 h-4 ${
                              vencido
                                ? 'text-destructive'
                                : venceEm30Dias
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}
                          />
                          <span className="font-medium text-sm">
                            {vencido ? 'Certificado Vencido' : venceEm30Dias ? 'Vence em breve' : 'Certificado Válido'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">Série: </span>
                            <span className="font-mono text-xs">{cert.numeroSerie}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Validade: </span>
                            <span className={vencido ? 'text-destructive font-medium' : ''}>
                              {new Date(cert.dataVencimento).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">CNPJ: </span>
                            <span>{cert.cnpj}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Cadastrado em: </span>
                            <span>{new Date(cert.dataProcessamento).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletar(cert.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 mb-6 border border-dashed border-border rounded-lg">
              <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum certificado cadastrado para esta empresa</p>
            </div>
          )}

          {errorCerts && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorCerts}</AlertDescription>
            </Alert>
          )}

          {/* Upload de Novo Certificado */}
          <div className="border border-border rounded-lg p-4 bg-muted/30">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Enviar Novo Certificado
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Arquivo PFX
                </label>
                <Input
                  type="file"
                  accept=".pfx,.p12"
                  onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                  disabled={enviando || validandoCert}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Senha do Certificado
                </label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    disabled={enviando || validandoCert}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleValidarCertificado}
                disabled={!arquivo || !senha || enviando || validandoCert}
              >
                {validandoCert ? 'Validando...' : 'Validar'}
              </Button>
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={!arquivo || !senha || enviando || validandoCert}
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                {enviando ? 'Enviando...' : 'Fazer Upload'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Componente auxiliar para exibir uma linha de informação
 */
function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <span className="text-muted-foreground">{label}: </span>
        <span className="text-foreground font-medium">{value}</span>
      </div>
    </div>
  );
}

/**
 * Formatar CNPJ
 */
function formatCnpj(cnpj: string): string {
  if (!cnpj || cnpj.length !== 14) return cnpj || '-';
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}
