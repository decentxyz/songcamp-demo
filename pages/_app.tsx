import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "@decent.xyz/the-box/index.css";
import {
  connectorsForWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { songcampChains } from "./index";
import { getWagmiChain } from "@decent.xyz/box-common";

const { chains, publicClient } = configureChains(
  songcampChains.map((chain) => getWagmiChain(chain)),
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY! }),
    publicProvider(),
  ],
);

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
