import { useAccount, useDisconnect } from 'wagmi'
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useWeb3Modal } from '@web3modal/react'

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open, isOpen } = useWeb3Modal()
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
        await open()
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
      disabled={isOpen}
      variant={isConnected ? "outline" : "default"}
    >
      {isOpen ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connexion...
        </>
      ) : isConnected ? (
        `${address?.slice(0, 6)}...${address?.slice(-4)}`
      ) : (
        'Connecter Wallet'
      )}
    </Button>
  )
}