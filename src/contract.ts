// ================================================================

import { keccak256, toBytes } from "viem";

// ── Contract address (Base Sepolia) ─────────────────────────────
export const REGISTRY_ADDRESS =
  "0x90afC5fDaD522Bd0a71CE62Cf3b28cA024DCb392" as const;

  // ── ABI ─────────────────────────────────────────────────────────
  export const REGISTRY_ABI = [
    // Errors
      { inputs: [], name: "AlreadyUnflagged", type: "error" },
        { inputs: [], name: "InvalidImei",      type: "error" },
          { inputs: [], name: "InvalidSecret",    type: "error" },
            { inputs: [], name: "Unauthorized",     type: "error" },

              // Write: flagDevice
                {
                    inputs: [
                          { internalType: "bytes32", name: "imeiHash",   type: "bytes32" },
                                { internalType: "bytes32", name: "secretHash", type: "bytes32" },
                                    ],
                                        name: "flagDevice",
                                            outputs: [],
                                                stateMutability: "nonpayable",
                                                    type: "function",
                                                      },

                                                        // Write: unflagDevice
                                                          {
                                                              inputs: [
                                                                    { internalType: "bytes32", name: "imeiHash",   type: "bytes32" },
                                                                          { internalType: "bytes32", name: "secretHash", type: "bytes32" },
                                                                              ],
                                                                                  name: "unflagDevice",
                                                                                      outputs: [],
                                                                                          stateMutability: "nonpayable",
                                                                                              type: "function",
                                                                                                },

                                                                                                  // Read: registry
                                                                                                    {
                                                                                                        inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
                                                                                                            name: "registry",
                                                                                                                outputs: [
                                                                                                                      { internalType: "bytes32", name: "secretHash", type: "bytes32" },
                                                                                                                            { internalType: "uint64",  name: "updateAt",   type: "uint64"  },
                                                                                                                                  { internalType: "uint8",   name: "status",     type: "uint8"   },
                                                                                                                                      ],
                                                                                                                                          stateMutability: "view",
                                                                                                                                              type: "function",
                                                                                                                                                },

                                                                                                                                                  // Events
                                                                                                                                                    {
                                                                                                                                                        anonymous: false,
                                                                                                                                                            inputs: [
                                                                                                                                                                  { indexed: true,  internalType: "bytes32", name: "imeiHash",   type: "bytes32" },
                                                                                                                                                                        { indexed: false, internalType: "bytes32", name: "secretHash", type: "bytes32" },
                                                                                                                                                                            ],
                                                                                                                                                                                name: "Tier1",
                                                                                                                                                                                    type: "event",
                                                                                                                                                                                      },
                                                                                                                                                                                        {
                                                                                                                                                                                            anonymous: false,
                                                                                                                                                                                                inputs: [
                                                                                                                                                                                                      { indexed: true,  internalType: "bytes32", name: "imeiHash",   type: "bytes32" },
                                                                                                                                                                                                            { indexed: false, internalType: "bytes32", name: "secretHash", type: "bytes32" },
                                                                                                                                                                                                                ],
                                                                                                                                                                                                                    name: "UnflagTier1",
                                                                                                                                                                                                                        type: "event",
                                                                                                                                                                                                                          },
                                                                                                                                                                                                                          ] as const;

                                                                                                                                                                                                                          // ── Status enum (mirrors on-chain Payless.Status) ───────────────
                                                                                                                                                                                                                          export enum DeviceStatus {
                                                                                                                                                                                                                            NotRegistered = 0,
                                                                                                                                                                                                                              Flagged       = 1,
                                                                                                                                                                                                                                Unflagged     = 2,
                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                export const STATUS_LABELS: Record<number, string> = {
                                                                                                                                                                                                                                  [DeviceStatus.NotRegistered]: "Not Registered",
                                                                                                                                                                                                                                    [DeviceStatus.Flagged]:       "Flagged / Stolen",
                                                                                                                                                                                                                                      [DeviceStatus.Unflagged]:     "Unflagged / Clean",
                                                                                                                                                                                                                                      };

                                                                                                                                                                                                                                      export const STATUS_COLORS: Record<number, string> = {
                                                                                                                                                                                                                                        [DeviceStatus.NotRegistered]: "text-[#888]",
                                                                                                                                                                                                                                          [DeviceStatus.Flagged]:       "text-[#EF4444]",
                                                                                                                                                                                                                                            [DeviceStatus.Unflagged]:     "text-[#22C55E]",
                                                                                                                                                                                                                                            };

                                                                                                                                                                                                                                            // ── Hashing helpers ─────────────────────────────────────────────
                                                                                                                                                                                                                                            // Both IMEI and secret are keccak256-hashed client-side before
                                                                                                                                                                                                                                            // being sent on-chain. Raw values are never transmitted.
                                                                                                                                                                                                                                            export function hashImei(imei: string): `0x${string}` {
                                                                                                                                                                                                                                              return keccak256(toBytes(imei));
                                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                              export function hashSecret(secret: string): `0x${string}` {
                                                                                                                                                                                                                                                return keccak256(toBytes(secret));
                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                