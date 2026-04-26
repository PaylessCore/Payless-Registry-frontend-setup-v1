// ================================================================

'use client';

import { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'wagmi/chains';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';

import { wagmiConfig } from './wagmi.config';
import StatusChecker from './StatusChecker';
import ReportDevice from './ReportDevice';

const queryClient = new QueryClient();
type Tab = 'check' | 'report';

// Root component — wrap your app with this (or call it from page.tsx)
export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={baseSepolia}
          config={{ appearance: { theme: 'dark', mode: 'auto' } }}
        >
          <PaylessApp />
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function PaylessApp() {
  const [tab, setTab] = useState<Tab>('check');

  return (
    <div
      className="min-h-screen bg-[#0F0F0F] text-[#E5E5E5]"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      {/* Ambient grid background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,240,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Accent glow blob */}
      <div
        className="pointer-events-none fixed top-[-160px] right-[-120px] w-[480px] h-[480px] rounded-full opacity-[0.07] blur-[100px] z-0"
        style={{ background: '#00F0FF' }}
      />

      {/* ── Nav ── */}
      <nav className="relative z-10 sticky top-0 bg-[#0F0F0F]/90 backdrop-blur-xl border-b border-white/[0.06] px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect
              x="1.5"
              y="1.5"
              width="19"
              height="19"
              rx="5.5"
              stroke="#00F0FF"
              strokeWidth="1.5"
            />
            <path
              d="M6 11h10M11 6v10"
              stroke="#00F0FF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="11" cy="11" r="2.5" fill="#00F0FF" opacity="0.25" />
          </svg>
          <span
            className="font-bold text-sm tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Payless<span className="text-[#00F0FF]">Protocol</span>
          </span>
        </div>

        {/* OnchainKit wallet connect button + dropdown */}
        <Wallet>
          <ConnectWallet
            className="!bg-[#00F0FF] !text-black !font-semibold !text-sm !rounded-xl !px-4 !py-2 hover:!bg-[#00F0FF]/90 transition-all"
            withWalletAggregator={false}
          >
            <Avatar className="w-5 h-5 rounded-full" />
            <Name className="text-sm font-semibold" />
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar className="w-10 h-10 rounded-full" />
              <Name className="text-[#E5E5E5] font-semibold text-sm" />
              <Address className="text-[#888] text-xs font-mono" />
              <EthBalance className="text-[#888] text-xs" />
            </Identity>
            <WalletDropdownDisconnect className="text-[#EF4444] text-sm px-4 py-2 hover:bg-[#EF4444]/10 w-full text-left transition-colors" />
          </WalletDropdown>
        </Wallet>
      </nav>

      {/* ── Hero ── */}
      <header className="relative z-10 text-center pt-16 pb-10 px-4">
        <div className="inline-flex items-center gap-2 bg-[#00F0FF]/8 border border-[#00F0FF]/20 rounded-full px-4 py-1.5 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
          <span className="text-[#00F0FF] text-xs font-mono uppercase tracking-wider">
            Base Sepolia · Decentralized Registry
          </span>
        </div>
        <h1
          className="text-4xl font-bold tracking-tight text-[#E5E5E5] mb-3 leading-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Make Stolen Devices{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              background: 'linear-gradient(90deg, #00F0FF, #fff, #00F0FF)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              animation: 'shimmer 3s linear infinite',
            }}
          >
            Worthless.
          </span>
        </h1>
        <p className="text-[#888] text-sm max-w-sm mx-auto leading-relaxed">
          A permissionless, on-chain IMEI registry. Flag or verify devices in
          seconds. Gasless via Coinbase Paymaster.
        </p>
      </header>

      {/* ── Tabs ── */}
      <div className="relative z-10 flex justify-center mb-8 px-4">
        <div className="flex bg-[#1A1A1A] border border-white/[0.07] rounded-xl p-1 gap-1">
          {(
            [
              { id: 'check', label: 'Check Status', icon: '🔍' },
              { id: 'report', label: 'Report Device', icon: '🚨' },
            ] as { id: Tab; label: string; icon: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                tab === t.id
                  ? 'bg-[#00F0FF] text-black'
                  : 'text-[#888] hover:text-[#E5E5E5] hover:bg-white/[0.04]'
              }`}
            >
              <span className="text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main panel ── */}
      <main className="relative z-10 flex justify-center px-4 pb-20">
        <div className="w-full max-w-lg">
          {tab === 'check' && <StatusChecker />}
          {tab === 'report' && <ReportDevice />}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.05] py-5 px-6 flex items-center justify-between">
        <span className="text-[#555] text-xs font-mono">
          Contract: 0x90afC…b392 · Base Sepolia
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[#555] text-xs">Live on Base</span>
        </div>
      </footer>

      {/* Global keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @keyframes shimmer {
          0%   { background-position: 0%   center; }
          100% { background-position: 200% center; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes progress-bar {
          0%   { width: 0%;  margin-left: 0%;   }
          50%  { width: 60%; margin-left: 20%;  }
          100% { width: 0%;  margin-left: 100%; }
        }
        .animate-fade-up      { animation: fade-up 0.45s cubic-bezier(.22,1,.36,1) both; }
        .animate-progress-bar { animation: progress-bar 1.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
