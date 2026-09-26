import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { NavItem } from "@/content/site";

/**
 * Renders a nav item: an in-site <Link>, or — for `external` items such as
 * the blog — a new-tab <a> with an ↗ marker. Extra props are spread onto the
 * root so it works as a Radix `asChild` target (e.g. <SheetClose asChild>).
 */
export function NavLink({
  item,
  className,
  ...props
}: { item: NavItem; className?: string } & Omit<React.ComponentProps<"a">, "href">) {
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className} {...props}>
        {item.label}
        <ArrowUpRight className="ml-0.5 inline size-3.5 opacity-60" aria-hidden />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={item.href} className={className} {...props}>
      {item.label}
    </Link>
  );
}
