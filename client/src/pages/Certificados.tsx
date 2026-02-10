import { useState, useEffect } from 'react';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useCertificados } from '@/hooks/useCertificados';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Trash2, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

/**
 * Página de Gerenciamento de Certificados Digitais
 */
export default function Certificados() {
  const { empresaSelecionada } = useEmpresas();
  const { certificados, loading, error, uploadCertificado, validarCertificado, listarCertificados, deletarCertificado } = useCertificados();

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [validandoCert, setValidandoCert] = useState(false);

  // Carregar certificados quando empresa mudar
  useEffect(() => {
    if (empresaSelecionada) {
      listarCertificados(empresaSelecionada.id);
    }
  }, [empresaSelecionada, listarCertificados]);

  const handleValidarCertificado = async () => {
    if (!arquivo || !senha) {
      setMensagem({ tipo: 'erro', texto: 'Selecione um arquivo e informe a senha' });
      return;
    }

    try {
      setValidandoCert(true);
      const valido = await validarCertificado(arquivo, senha);
      
      if (valido) {
        setMensagem({ tipo: 'sucesso', texto: 'Certificado válido!' });
      } else {
        setMensagem({ tipo: 'erro', texto: 'Certificado inválido ou senha incorreta' });
      }
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao validar certificado' });
    } finally {
      setValidandoCert(false);
    }
  };

  const handleUpload = async () => {
    if (!arquivo || !senha || !empresaSelecionada) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos e selecione uma empresa' });
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
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao enviar certificado' });
    } finally {
      setEnviando(false);
    }
  };

  const handleDeletar = async (certificadoId: number) => {
    if (!confirm('Tem certeza que deseja deletar este certificado?')) {
      return;
    }

    try {
      await deletarCertificado(certificadoId);
      setMensagem({ tipo: 'sucesso', texto: 'Certificado deletado com sucesso!' });
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao deletar certificado' });
    }
  };

  if (!empresaSelecionada) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Selecione uma empresa para gerenciar certificados</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Certificados Digitais</h1>
        <p className="text-muted-foreground mt-2">
          Gerenciar certificados digitais para {empresaSelecionada.nomeFantasia}
        </p>
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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Card de Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload de Certificado
          </CardTitle>
          <CardDescription>
            Selecione um arquivo PFX e informe a senha para fazer upload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seletor de Arquivo */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Arquivo PFX
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pfx"
                onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                disabled={enviando || validandoCert}
                className="flex-1"
              />
              {arquivo && (
                <span className="text-sm text-muted-foreground">
                  {arquivo.name}
                </span>
              )}
            </div>
          </div>

          {/* Campo de Senha */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Senha do Certificado
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Informe a senha do certificado"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={enviando || validandoCert}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleValidarCertificado}
              disabled={!arquivo || !senha || enviando || validandoCert}
              className="flex-1"
            >
              {validandoCert ? 'Validando...' : 'Validar'}
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!arquivo || !senha || enviando || validandoCert}
              className="flex-1"
            >
              {enviando ? 'Enviando...' : 'Fazer Upload'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Certificados */}
      <Card>
        <CardHeader>
          <CardTitle>Certificados Cadastrados</CardTitle>
          <CardDescription>
            {certificados.length === 0
              ? 'Nenhum certificado cadastrado'
              : `${certificados.length} certificado(s) cadastrado(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Carregando certificados...</p>
          ) : certificados.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum certificado cadastrado para esta empresa
            </p>
          ) : (
            <div className="space-y-4">
              {certificados.map((cert) => (
                <div
                  key={cert.id}
                  className="border border-border rounded-lg p-4 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {cert.cnpj}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Série: {cert.numeroSerie}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vencimento: {cert.dataValidade ? new Date(cert.dataValidade).toLocaleDateString('pt-BR') : '-'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Cadastrado em: {cert.dataInclusao ? new Date(cert.dataInclusao).toLocaleDateString('pt-BR') : '-'}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletar(cert.id)}
                    disabled={enviando}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
