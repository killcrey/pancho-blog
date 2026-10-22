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
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-6">
        <Link href="/admin" className="flex min-w-0 items-center gap-3">
          <Image
            src="/panchosspacelogo.png"
            alt="The Invisible Panchos logo"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <div className="min-w-0">
            <p className="text-glow text-base font-semibold uppercase tracking-[0.2em] sm:text-lg sm:tracking-[0.3em]">
              {title}
            </p>
            {subtitle && (
              <p className="break-all text-xs uppercase tracking-widest text-muted">
                {subtitle}
              </p>
            )}
          </div>
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <a
            href="https://theinvisiblepanchos.com/admin"
            className="rounded border border-border px-2.5 py-1.5 text-[11px] uppercase tracking-wider text-muted transition-colors hover:border-gold hover:text-gold sm:px-3 sm:text-xs sm:tracking-widest"
          >
            Back to Hub
          </a>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-border px-2.5 py-1.5 text-[11px] uppercase tracking-wider text-muted transition-colors hover:border-gold hover:text-gold sm:px-3 sm:text-xs sm:tracking-widest"
          >
            Blog
          </a>
          {children}
        </div>
      </div>
    </header>
  );
}
