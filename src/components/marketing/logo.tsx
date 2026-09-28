import Image from "next/image";
import Link from "next/link";

import { brand } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * The Strategic Machines mark (Cloudinary icon) plus wordmark, linking home.
 * The icon is requested pre-sized from Cloudinary (brand.logoNav), so Next's
 * optimizer is skipped (`unoptimized`) rather than resizing it a second time.
 */
export function Logo({ className, mono = false }: { className?: string; mono?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap text-white transition-opacity hover:opacity-80",
        className,
      )}
    >
      <Image
        src={brand.logoNav}
        alt=""
        width={32}
        height={32}
        priority
        unoptimized
        className="size-8 shrink-0 rounded-md"
      />
      <span
        className={cn(
          "text-[15px] font-semibold tracking-tight",
          mono && "font-mono text-xs font-medium uppercase tracking-widest",
        )}
      >
        Strategic Machines
      </span>
    </Link>
  );
}
