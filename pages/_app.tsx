import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "@decent.xyz/the-box/index.css";
import {
  connectorsForWallets,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { sepolia, zoraTestnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";

const { chains, publicClient } = configureChains(
  [sepolia, zoraTestnet],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY! }),
    publicProvider(),
  ],
);

//const { connectors } = getDefaultWallets({
//  appName: "RainbowKit App",
//  projectId: "YOUR_PROJECT_ID",
//  chains,
//});

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [metaMaskWallet({ projectId: "demo-songcamp", chains })],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
