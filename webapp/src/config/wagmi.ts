import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia } from "wagmi/chains";

const walletConnectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!walletConnectId) {
  console.warn(
    "[BeliefMarket] WalletConnect project ID missing. Set VITE_WALLETCONNECT_PROJECT_ID in your .env file."
  );
}

export const config = getDefaultConfig({
  appName: "BeliefMarket",
  projectId: walletConnectId || "demo",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com")
  },
  ssr: false
});
