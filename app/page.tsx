"use client";

import { useState } from "react";
// Import your components... (Ensure the paths are correct)
import StatusChecker from "../src/StatusChecker";
import ReportDevice from "../src/ReportDevice";
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet";
import { Address, Avatar, Name, Identity, EthBalance } from "@coinbase/onchainkit/identity";

type Tab = "check" | "report";

export default function Page() {
  const [tab, setTab] = useState<Tab>("check");

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E5E5E5]" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {/* ... keep your existing JSX structure (Nav, Header, Tabs, Main) here ... */}
      
      {/* Just make sure you delete the WagmiProvider/OnchainKitProvider 
          wrappers from this file since they are now in layout.tsx */}
      
      <main>
        {tab === "check" && <StatusChecker />}
        {tab === "report" && <ReportDevice />}
      </main>
    </div>
  );
}
