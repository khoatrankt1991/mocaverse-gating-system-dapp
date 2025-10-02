'use client'

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-slate-700 bg-slate-900/50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          {/* Left - Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">
                Moca VIP Gating System
              </h3>
              <p className="text-xs text-slate-400">
                Web3 Access Control Platform
              </p>
            </div>
          </div>

          {/* Center - Links */}
          <div className="flex items-center space-x-6 text-sm">
            <a
              href="https://moca-gating-system.kai-tran9xx.workers.dev/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors hover:text-white"
            >
              API Docs
            </a>
            <a
              href="https://sepolia.etherscan.io/address/0x88a1Dbe9568dDb8764EA10b279801E146Be6C531"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors hover:text-white"
            >
              Smart Contract
            </a>
            <a
              href="https://github.com/khoatrankt1991/mocaverse-gating-system-dapp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors hover:text-white"
            >
              GitHub
            </a>
          </div>

          {/* Right - Author */}
          <div className="text-center md:text-right">
            <p className="text-sm text-slate-400">Built with ❤️ by</p>
            <a
              href="mailto:khoatran.kt1991@gmail.com"
              className="font-medium text-yellow-400 transition-colors hover:text-yellow-300"
            >
              Khoa Tran
            </a>
            <p className="mt-1 text-xs text-slate-500">
              Full-Stack Web3 Developer
            </p>
          </div>
        </div>

        {/* Bottom - Copyright */}
        <div className="mt-6 border-t border-slate-700 pt-6 text-center">
          <p className="text-xs text-slate-500">
            © 2024 Moca VIP Gating System. Built with Next.js, Cloudflare
            Workers, and Solidity.
          </p>
        </div>
      </div>
    </footer>
  )
}
