import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Vehicles from "@/pages/vehicles";
import Maintenance from "@/pages/maintenance";
import Parts from "@/pages/parts";
import History from "@/pages/history";
import Validation from "@/pages/validation";
import Chat from "@/pages/chat";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

function Router() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/vehicles" component={Vehicles} />
            <Route path="/maintenance" component={Maintenance} />
            <Route path="/parts" component={Parts} />
            <Route path="/history" component={History} />
            <Route path="/validation" component={Validation} />
            <Route path="/chat" component={Chat} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
