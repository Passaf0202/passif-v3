import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()
  const { toast } = useToast()

  const handleConnect = async () => {
    try {
      if (isConnected) {
        await disconnect()
        toast({
          title: "Déconnecté",
          description: "Votre portefeuille a été déconnecté",
        })
      } else {
        await connect({ connector: connectors[0] })
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