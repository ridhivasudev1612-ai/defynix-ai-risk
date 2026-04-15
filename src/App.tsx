import { useState } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppHeader from "@/components/AppHeader";
import AlertsPanel from "@/components/AlertsPanel";
import Index from "./pages/Index";
import Assessment from "./pages/Assessment";
import Monitoring from "./pages/Monitoring";
import GuarantorChain from "./pages/GuarantorChain";
import PeerComparison from "./pages/PeerComparison";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [alertsOpen, setAlertsOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppHeader onOpenAlerts={() => setAlertsOpen(true)} />
          <AlertsPanel isOpen={alertsOpen} onClose={() => setAlertsOpen(false)} />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/assess" element={<Assessment />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/guarantor-chain" element={<GuarantorChain />} />
            <Route path="/peer-comparison" element={<PeerComparison />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
