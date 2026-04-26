// ================================================================

import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

const cbSmartWallet = coinbaseWallet({
  appName: "Payless Protocol",
    appLogoUrl: "https://paylessprotocol.xyz/logo.png",
      // "smartWalletOnly" forces the Coinbase Smart Wallet flow only.
        // Change to "all" to also allow standard EOA Coinbase Wallet.
          preference: "smartWalletOnly",
          });

          export const wagmiConfig = createConfig({
            chains: [baseSepolia],
              connectors: [cbSmartWallet],
                transports: {
                    // Swap for your own Alchemy/QuickNode RPC URL in production
                        [baseSepolia.id]: http("https://sepolia.base.org"),
                          },
                          });

                          export { baseSepolia };

                          