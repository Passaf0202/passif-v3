
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { WagmiConfig } from 'wagmi';
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
import { wagmiConfig } from './config/walletkit';

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
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;
