import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-foreground mb-4">
          NFSe Nacional
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Consulte suas notas fiscais de serviço de forma rápida e segura
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/emitidas')}
            className="bg-primary text-primary-foreground hover:bg-blue-800 flex items-center gap-2"
          >
            Notas Emitidas <ArrowRight className="w-4 h-4" />
          </Button>
          <Button 
            onClick={() => navigate('/recebidas')}
            variant="outline"
            className="border-border text-foreground hover:bg-secondary flex items-center gap-2"
          >
            Notas Recebidas <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
