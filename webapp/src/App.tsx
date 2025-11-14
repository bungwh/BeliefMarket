import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "./config/wagmi";
import Markets from "./pages/Markets";
import CreateMarket from "./pages/CreateMarket";
import MarketDetail from "./pages/MarketDetail";
import MyParticipation from "./pages/MyParticipation";
import RevealCenter from "./pages/RevealCenter";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider theme={darkTheme()}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Markets />} />
              <Route path="/create" element={<CreateMarket />} />
              <Route path="/market/:id" element={<MarketDetail />} />
              <Route path="/my-participation" element={<MyParticipation />} />
              <Route path="/reveal-center" element={<RevealCenter />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
