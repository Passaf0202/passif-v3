
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from './config/web3modal';
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import CreateListing from "@/pages/CreateListing";
import Messages from "@/pages/Messages";
import ListingDetails from "@/pages/ListingDetails";
import Favorites from "@/pages/Favorites";
import MyListings from "@/pages/MyListings";
import Checkout from "@/pages/Checkout";
import Payment from "@/pages/Payment";
import { UserProfile } from "@/components/UserProfile";
import Search from "@/pages/Search";
import Admin from "@/pages/Admin";
import { AdminRoute } from "@/components/admin/AdminRoute";
import Transactions from "@/pages/Transactions";

// Configuration optimisée pour React Query avec mise en cache améliorée
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes (augmenté pour réduire les requêtes)
      gcTime: 1000 * 60 * 30, // 30 minutes (remplace cacheTime dans les versions récentes)
      retry: 1,
      refetchOnWindowFocus: false, // Désactivé pour éviter des requêtes inutiles
      refetchOnMount: false, // Désactivé pour utiliser le cache existant
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig as any}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/create" element={<CreateListing />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/listings/:id" element={<ListingDetails />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment/:id" element={<Payment />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Routes>
          <Toaster />
        </BrowserRouter>
      </WagmiConfig>
    </QueryClientProvider>
  );
}

export default App;
