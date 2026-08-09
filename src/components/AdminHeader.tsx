import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export function AdminHeader({ title, subtitle, children }: Props) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-6">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/panchosspacelogo.png"
            alt="The Invisible Panchos logo"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <div>
            <p className="text-glow text-lg font-semibold uppercase tracking-[0.3em]">
              {title}
            </p>
            {subtitle && (
              <p className="text-xs uppercase tracking-widest text-muted">
                {subtitle}
              </p>
            )}
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-border px-3 py-1.5 text-xs uppercase tracking-widest text-muted transition-colors hover:border-gold hover:text-gold"
          >
            Blog
          </a>
          {children}
        </div>
      </div>
    </header>
  );
}
