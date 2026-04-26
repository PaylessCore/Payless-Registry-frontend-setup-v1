// ================================================================

"use client";

import { useState } from "react";
import { useAccount, useChainId, useCapabilities } from "wagmi";
import { useWriteContracts, useCallsStatus } from "wagmi/experimental";
import { baseSepolia } from "wagmi/chains";
import {
  REGISTRY_ADDRESS,
  REGISTRY_ABI,
  hashImei,
  hashSecret,
} from "./contract";
import { buildPaymasterCapabilities } from "./paymaster";

export default function ReportDevice() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const [imei,     setImei]     = useState("");
  const [secret,   setSecret]   = useState("");
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});

  // Check if connected wallet advertises paymasterService support
  const { data: capabilities } = useCapabilities({
    account: address,
    query:   { enabled: isConnected },
  });
  const supportsSponsorship =
    capabilities?.[chainId]?.paymasterService?.supported ?? false;

  // EIP-5792 wallet_sendCalls — sends the flagDevice call as a
  // UserOperation with the Paymaster covering gas fees.
  const {
    writeContracts,
    data:      batchId,
    isPending: isSending,
    error:     sendError,
  } = useWriteContracts();

  // Poll the UserOperation status until CONFIRMED
  const { data: callsStatus, isLoading: isPolling } = useCallsStatus({
    id:    batchId as string,
    query: {
      enabled:         !!batchId,
      refetchInterval: (d) =>
        d.state.data?.status === "CONFIRMED" ? false : 1500,
    },
  });

  const txHash      = callsStatus?.receipts?.[0]?.transactionHash;
  const isConfirmed = callsStatus?.status === "CONFIRMED";

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!imei.trim() || imei.trim().length < 15)
      errs.imei = "IMEI must be 15 digits.";
    if (!secret.trim() || secret.trim().length < 6)
      errs.secret = "Secret must be at least 6 characters.";
    setFieldErr(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReport = () => {
    if (!validate()) return;

    writeContracts({
      contracts: [
        {
          address:      REGISTRY_ADDRESS,
          abi:          REGISTRY_ABI,
          functionName: "flagDevice",
          args:         [hashImei(imei.trim()), hashSecret(secret.trim())],
        },
      ],
      // ── GASLESS: Paymaster sponsorship capability ──────────────
      // This triggers wallet_sendCalls with paymasterService so the
      // Coinbase Paymaster sponsors the entire UserOperation fee.
      // The user pays zero ETH.
      capabilities: buildPaymasterCapabilities(baseSepolia.id),
    });
  };

  const handleReset = () => {
    setImei(""); setSecret(""); setFieldErr({});
  };

  // Not connected
  if (!isConnected) {
    return (
      <div className="bg-[#1A1A1A] border border-white/[0.07] rounded-2xl p-6 w-full max-w-lg">
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center mx-auto mb-4">
            <FlagIcon />
          </div>
          <p className="text-[#E5E5E5] font-semibold text-sm mb-1">Connect your wallet</p>
          <p className="text-[#666] text-xs">A Coinbase Smart Wallet is required to flag devices on-chain.</p>
        </div>
      </div>
    );
  }

  // Confirmed
  if (isConfirmed && txHash) {
    return (
      <div className="bg-[#1A1A1A] border border-[#22C55E]/30 rounded-2xl p-6 w-full max-w-lg animate-fade-up">
        <div className="text-center py-2">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-[#22C55E] font-semibold text-base mb-1">Device Flagged On-Chain</h3>
          <p className="text-[#888] text-xs mb-5 leading-relaxed">
            The IMEI hash has been permanently recorded on Base Sepolia.<br/>
            This transaction was gas-free.
          </p>
          <a
            href={`https://sepolia.basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#00F0FF] text-xs font-mono border border-[#00F0FF]/25 rounded-xl px-4 py-2.5 hover:bg-[#00F0FF]/8 transition-colors mb-5 break-all"
          >
            {txHash.slice(0, 18)}…{txHash.slice(-6)}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M8 1h3m0 0v3m0-3L6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <br/>
          <button
            onClick={handleReset}
            className="text-[#888] text-xs border border-white/[0.07] rounded-xl px-4 py-2 hover:text-[#E5E5E5] hover:border-white/[0.15] transition-colors"
          >
            Report Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] border border-white/[0.07] rounded-2xl p-6 w-full max-w-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/25 flex items-center justify-center">
          <FlagIcon />
        </div>
        <div>
          <h2 className="text-[#E5E5E5] font-semibold text-base leading-tight">Report Stolen Device</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${supportsSponsorship ? "bg-[#22C55E]" : "bg-[#888]"} animate-pulse`} />
            <p className="text-[#888] text-xs">
              {supportsSponsorship ? "Gasless · Sponsored by Paymaster" : "Gas fees apply"}
            </p>
          </div>
        </div>
      </div>

      {/* Sponsorship notice */}
      {supportsSponsorship && (
        <div className="flex items-center gap-2 bg-[#00F0FF]/5 border border-[#00F0FF]/15 rounded-xl px-4 py-2.5 mb-5">
          <span className="text-[#00F0FF] text-sm">⚡</span>
          <p className="text-[#00F0FF]/80 text-xs">
            This transaction is gas-free. The Coinbase Paymaster covers all fees.
          </p>
        </div>
      )}

      {/* IMEI field */}
      <div className="mb-4">
        <label className="block text-[#888] text-xs uppercase tracking-widest mb-2">IMEI Number *</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555] text-sm font-mono">#</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={20}
            placeholder="15-digit IMEI"
            value={imei}
            onChange={(e) => {
              setImei(e.target.value.replace(/\D/g, "").slice(0, 20));
              setFieldErr((p) => ({ ...p, imei: "" }));
            }}
            className={`w-full bg-[#0F0F0F] border rounded-xl pl-8 pr-4 py-3 text-[#E5E5E5] text-sm font-mono placeholder:text-[#444] outline-none transition-all duration-150 ${
              fieldErr.imei
                ? "border-[#EF4444]/60 focus:ring-1 focus:ring-[#EF4444]/20"
                : "border-white/[0.08] focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/20"
            }`}
          />
        </div>
        {fieldErr.imei && <p className="text-[#EF4444] text-xs mt-1.5">{fieldErr.imei}</p>}
      </div>

      {/* Secret field */}
      <div className="mb-5">
        <label className="block text-[#888] text-xs uppercase tracking-widest mb-2">Secret Passphrase *</label>
        <input
          type="password"
          placeholder="Used to verify ownership later"
          value={secret}
          onChange={(e) => {
            setSecret(e.target.value);
            setFieldErr((p) => ({ ...p, secret: "" }));
          }}
          className={`w-full bg-[#0F0F0F] border rounded-xl px-4 py-3 text-[#E5E5E5] text-sm placeholder:text-[#444] outline-none transition-all duration-150 ${
            fieldErr.secret
              ? "border-[#EF4444]/60 focus:ring-1 focus:ring-[#EF4444]/20"
              : "border-white/[0.08] focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/20"
          }`}
        />
        <p className="text-[#555] text-xs mt-1.5 leading-relaxed">
          Store this safely — you'll need it to unflag the device. It's hashed before submission.
        </p>
        {fieldErr.secret && <p className="text-[#EF4444] text-xs mt-1">{fieldErr.secret}</p>}
      </div>

      {/* Submit button */}
      <button
        onClick={handleReport}
        disabled={isSending || isPolling}
        className="w-full py-3.5 rounded-xl font-semibold text-sm bg-[#EF4444] hover:bg-[#EF4444]/90 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {isSending || isPolling ? (
          <>
            <SpinnerWhite />
            {isPolling ? "Confirming on-chain…" : "Awaiting wallet approval…"}
          </>
        ) : (
          <><span>🚨</span> Flag Device On-Chain</>
        )}
      </button>

      {/* Progress bar */}
      {(isSending || (isPolling && !isConfirmed)) && (
        <div className="mt-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-[#888] text-xs">
              {isSending ? "Sending to Smart Wallet…" : "Broadcasting to Base Sepolia…"}
            </span>
            <span className="text-[#00F0FF] text-xs font-mono">
              {batchId ? `ID: ${String(batchId).slice(0, 10)}…` : ""}
            </span>
          </div>
          <div className="h-0.5 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div className="h-full bg-[#00F0FF] rounded-full animate-progress-bar" />
          </div>
        </div>
      )}

      {/* Error */}
      {sendError && (
        <div className="mt-3 bg-[#EF4444]/8 border border-[#EF4444]/25 rounded-xl p-3">
          <p className="text-[#EF4444] text-xs leading-relaxed">
            ⚠ {sendError.message?.slice(0, 160) ?? "Transaction failed."}
          </p>
        </div>
      )}

      {/* Chain notice */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.05]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
        <span className="text-[#555] text-xs font-mono">
          Network: Base Sepolia (chain {baseSepolia.id})
        </span>
      </div>
    </div>
  );
}

function FlagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 2v12M3 2h8l-2 4 2 4H3" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SpinnerWhite() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
      <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

