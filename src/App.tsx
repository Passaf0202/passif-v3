import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { WagmiConfig } from 'wagmi'
import { wagmiConfig, appKit } from './config/web3modal'
import { AppKitProvider } from '@reown/appkit'
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import CreateListing from "@/pages/CreateListing";
import Messages from "@/pages/Messages";
import ListingDetails from "@/pages/ListingDetails";
import Favorites from "@/pages/Favorites";
import Checkout from "@/pages/Checkout";
import { UserProfile } from "@/components/UserProfile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <AppKitProvider appKit={appKit}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/create" element={<CreateListing />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/listings/:id" element={<ListingDetails />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<UserProfile />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </AppKitProvider>
    </WagmiConfig>
  );
}

export default App;