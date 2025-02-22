
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { WagmiConfig } from 'wagmi';
import { Web3Modal } from '@web3modal/react';
import { wagmiConfig, ethereumClient, projectId } from './config/web3modal';
import { amoy } from './config/chains';
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import CreateListing from "@/pages/CreateListing";
import Messages from "@/pages/Messages";
import ListingDetails from "@/pages/ListingDetails";
import Favorites from "@/pages/Favorites";
import Checkout from "@/pages/Checkout";
import Payment from "@/pages/Payment";
import { UserProfile } from "@/components/UserProfile";
import Search from "@/pages/Search";
import Admin from "@/pages/Admin";
import { AdminRoute } from "@/components/admin/AdminRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
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
            <Route path="/payment/:id" element={<Payment />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/search" element={<Search />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Routes>
          <Toaster />
        </BrowserRouter>
        <Web3Modal 
          projectId={projectId} 
          ethereumClient={ethereumClient}
          defaultChain={amoy}
          explorerRecommendedWalletIds={[
            'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
            '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'  // Trust Wallet
          ]}
          explorerExcludedWalletIds="ALL"
          themeMode="light"
          themeVariables={{
            '--w3m-font-family': 'Inter, sans-serif',
            '--w3m-accent-color': '#000000',
            '--w3m-background-color': '#ffffff',
            '--w3m-z-index': '1000',
            '--w3m-border-radius-master': '10px',
          }}
        />
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;
