// ================================================================

import type { Address, Hex } from "viem";
import { baseSepolia } from "wagmi/chains";

// ── Paymaster URL ────────────────────────────────────────────────
// Get from: https://portal.cdp.coinbase.com → Onchain Tools → Paymaster
// Allowlist your contract address in the sponsorship policy there.
export const PAYMASTER_URL =
  process.env.NEXT_PUBLIC_PAYMASTER_URL ??
    "https://api.developer.coinbase.com/rpc/v1/base-sepolia/YOUR_API_KEY";

    // ── EIP-5792 capabilities builder ───────────────────────────────
    // Passed to useWriteContracts() so the Smart Wallet sends a
    // wallet_sendCalls request with paymasterService sponsorship.
    // The Coinbase Paymaster then covers the gas — user pays nothing.
    export function buildPaymasterCapabilities(chainId: number = baseSepolia.id) {
      return {
          [chainId]: {
                paymasterService: {
                        url: PAYMASTER_URL,
                              },
                                  },
                                    };
                                    }

                                    export interface ContractCall {
                                      to:     Address;
                                        data:   Hex;
                                          value?: bigint;
                                          }

                                          