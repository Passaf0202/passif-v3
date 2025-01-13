import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const { connectAsync, connectors, isLoading, pendingConnector } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const { toast } = useToast()

  const handleConnect = async () => {
    try {
      if (isConnected) {
        await disconnectAsync()
        toast({
          title: "Déconnecté",
          description: "Votre portefeuille a été déconnecté",
        })
      } else {
        const result = await connectAsync({ connector: connectors[0] })
        console.log('Connected:', result)
        toast({
          title: "Connecté",
          description: "Votre portefeuille a été connecté avec succès",
        })
      }
    } catch (error) {
      console.error('Connection error:', error)
      toast({
        title: "Erreur",
        description: "Impossible de se connecter au portefeuille",
        variant: "destructive",
      })
    }
  }

  return (
    <Button 
      onClick={handleConnect}
      disabled={isLoading}
      variant={isConnected ? "outline" : "default"}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingConnector?.name ?? 'Connexion...'}
        </>
      ) : isConnected ? (
        `${address?.slice(0, 6)}...${address?.slice(-4)}`
      ) : (
        'Connecter Wallet'
      )}
    </Button>
  )
}