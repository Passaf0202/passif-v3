
import { ethers } from "ethers";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";

const ESCROW_ABI = [
  "function releaseFunds(uint256 txnId)",
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)",
  "function transactionCount() view returns (uint256)"
];

const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

export function useContractInteraction() {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const ensureCorrectNetwork = async () => {
    if (chain?.id !== amoy.id) {
      if (!switchNetwork) {
        throw new Error("Impossible de changer de réseau automatiquement");
      }
      await switchNetwork(amoy.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const validateTransaction = async (txnId: number, signerAddress: string) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      ESCROW_CONTRACT_ADDRESS,
      ESCROW_ABI,
      provider
    );

    const txData = await contract.transactions(txnId);
    console.log('Transaction data from contract:', txData);

    if (!txData.amount.gt(0)) {
      throw new Error("Transaction non trouvée dans le contrat");
    }

    if (txData.buyer.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error("Vous n'êtes pas l'acheteur de cette transaction");
    }

    if (txData.isCompleted) {
      throw new Error("Les fonds ont déjà été libérés");
    }

    if (!txData.isFunded) {
      throw new Error("Les fonds n'ont pas été déposés pour cette transaction");
    }

    return contract;
  };

  const releaseFunds = async (txnId: number) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();

    await ensureCorrectNetwork();

    const contract = await validateTransaction(txnId, signerAddress);
    const contractWithSigner = contract.connect(signer);

    const gasEstimate = await contractWithSigner.estimateGas.releaseFunds(txnId);
    console.log('Estimated gas:', gasEstimate.toString());
    const gasLimit = gasEstimate.mul(120).div(100);

    const tx = await contractWithSigner.releaseFunds(txnId, {
      gasLimit: gasLimit
    });
    console.log('Transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('Transaction receipt:', receipt);

    return receipt;
  };

  return {
    releaseFunds
  };
}
