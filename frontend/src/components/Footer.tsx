'use client'

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900/50 border-t border-slate-700 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left - Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">Moca VIP Gating System</h3>
              <p className="text-slate-400 text-xs">Web3 Access Control Platform</p>
            </div>
          </div>

          {/* Center - Links */}
          <div className="flex items-center space-x-6 text-sm">
            <a 
              href="https://moca-gating-system.kai-tran9xx.workers.dev/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              API Docs
            </a>
            <a 
              href="https://sepolia.etherscan.io/address/0x88a1Dbe9568dDb8764EA10b279801E146Be6C531" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Smart Contract
            </a>
            <a 
              href="https://github.com/khoatrankt1991/mocaverse-gating-system-dapp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>

          {/* Right - Author */}
          <div className="text-center md:text-right">
            <p className="text-slate-400 text-sm">
              Built with ❤️ by
            </p>
            <a 
              href="mailto:khoatran.kt1991@gmail.com"
              className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
            >
              Khoa Tran
            </a>
            <p className="text-slate-500 text-xs mt-1">
              Full-Stack Web3 Developer
            </p>
          </div>
        </div>

        {/* Bottom - Copyright */}
        <div className="border-t border-slate-700 mt-6 pt-6 text-center">
          <p className="text-slate-500 text-xs">
            © 2024 Moca VIP Gating System. Built with Next.js, Cloudflare Workers, and Solidity.
          </p>
        </div>
      </div>
    </footer>
  )
}
