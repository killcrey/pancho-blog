import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src="/panchosspacelogo.png"
            alt="The Invisible Panchos logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
          <div>
            <p className="text-lg font-black uppercase leading-tight tracking-tighter text-fg">
              The Invisible Panchos
            </p>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[1px] text-gold">
              Mission Log
              <span className="terminal-blink font-mono text-red-500">
                TRANSMITTING
              </span>
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-bold uppercase tracking-[1.4px] text-fg">
          <Link href="/" className="hover:text-gold transition-colors">
            Dispatches
          </Link>
          <a
            href="https://theinvisiblepanchos.com"
            className="hover:text-gold transition-colors"
          >
            Base
          </a>
        </nav>
      </div>
    </header>
  );
}
