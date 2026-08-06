import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-6">
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src="/panchosspacelogo.png"
            alt="The Invisible Panchos logo"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            priority
          />
          <div>
            <p className="text-glow text-lg font-semibold uppercase tracking-[0.3em] text-fg">
              The Invisible Panchos
            </p>
            <p className="text-xs uppercase tracking-[0.4em] text-gold group-hover:text-fg transition-colors">
              Mission Log
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-6 text-xs uppercase tracking-widest text-muted">
          <Link href="/" className="hover:text-gold transition-colors">
            Dispatches
          </Link>
          <a
            href="https://theinvisiblepanchos.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors"
          >
            Base
          </a>
        </nav>
      </div>
    </header>
  );
}
