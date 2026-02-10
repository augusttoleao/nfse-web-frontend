import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NotasEmitidas from "./pages/NotasEmitidas";
import NotasRecebidas from "./pages/NotasRecebidas";
import Certificados from "./pages/Certificados";
import Configuracoes from "./pages/Configuracoes";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/emitidas" component={NotasEmitidas} />
        <Route path="/recebidas" component={NotasRecebidas} />
        <Route path="/certificados" component={Certificados} />
        <Route path="/config" component={Configuracoes} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
