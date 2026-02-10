import { useState } from 'react';
import { Menu, X, FileText, BarChart3, Settings, Lock, Building2, Send, FileDown, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmpresaSelector } from '@/components/EmpresaSelector';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', href: '/', id: 'dashboard' },
    { icon: Send, label: 'Emissão NFSe', href: '/emissao', id: 'emissao' },
    { icon: FileUp, label: 'Notas Emitidas', href: '/emitidas', id: 'emitidas' },
    { icon: FileDown, label: 'Notas Recebidas', href: '/recebidas', id: 'recebidas' },
    { icon: Building2, label: 'Empresas', href: '/empresas', id: 'empresas' },
    { icon: Lock, label: 'Certificados', href: '/certificados', id: 'certificados' },
    { icon: Settings, label: 'Configurações', href: '/config', id: 'config' },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-56' : 'w-16'
        } bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col flex-shrink-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-14 px-3 border-b border-sidebar-border">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-sidebar-primary rounded-md flex items-center justify-center">
                <FileText className="w-4 h-4 text-sidebar-primary-foreground" />
              </div>
              <span className="font-bold text-sm text-sidebar-foreground">NFSe Nacional</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-2 py-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = window.location.pathname === item.href;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-3 border-t border-sidebar-border">
            <p className="text-[10px] text-sidebar-foreground/50">v1.1.0 - NFSe Nacional</p>
          </div>
        )}
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
          {/* Page Title */}
          <div className="text-sm text-muted-foreground">
            Sistema de Notas Fiscais de Serviço
          </div>

          {/* Empresa Selector - Canto Superior Direito */}
          <EmpresaSelector />
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="min-h-full bg-background">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
