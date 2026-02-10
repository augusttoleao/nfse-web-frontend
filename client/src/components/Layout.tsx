import { useState } from 'react';
import { Menu, X, FileText, BarChart3, Settings, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmpresaSelector } from '@/components/EmpresaSelector';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', href: '/', id: 'dashboard' },
    { icon: FileText, label: 'Notas Emitidas', href: '/emitidas', id: 'emitidas' },
    { icon: FileText, label: 'Notas Recebidas', href: '/recebidas', id: 'recebidas' },
    { icon: Lock, label: 'Certificados', href: '/certificados', id: 'certificados' },
    { icon: Settings, label: 'Configurações', href: '/config', id: 'config' },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <span className="font-bold text-sidebar-foreground">NFSe</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Empresa Selector */}
        {sidebarOpen && (
          <div className="px-2 py-4 border-b border-sidebar-border">
            <EmpresaSelector />
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                window.location.pathname === item.href
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60">
            {sidebarOpen && <p>© 2026 NFSe Nacional</p>}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
