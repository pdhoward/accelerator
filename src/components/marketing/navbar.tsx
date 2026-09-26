"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useMotionValueEvent, useScroll } from "motion/react";

import { primaryNav, site } from "@/content/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/marketing/logo";
import { NavLink } from "@/components/marketing/nav-link";

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        scrolled
          ? "border-b border-obsidian-border bg-obsidian/75 backdrop-blur-lg"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />

        <nav className="hidden items-center gap-0.5 xl:flex">
          {primaryNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              className="whitespace-nowrap rounded-full px-3 py-2 text-sm text-fog transition-colors hover:bg-white/5 hover:text-white"
            />
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          {/* Placeholder until a sign-in destination exists; shown only where there's room. */}
          <Button variant="ghost" size="sm" className="hidden 2xl:inline-flex">
            Sign in
          </Button>
          <Button variant="gold" size="sm" asChild>
            <Link href="/#waitlist">{site.waitlistCtaLabel}</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Logo />
            <nav className="flex flex-col gap-1">
              {primaryNav.map((item) => (
                <SheetClose asChild key={item.href}>
                  <NavLink
                    item={item}
                    className="rounded-lg px-3 py-3 text-base text-fog transition-colors hover:bg-white/5 hover:text-white"
                  />
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              <SheetClose asChild>
                <Button variant="outline">Sign in</Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="gold" asChild>
                  <Link href="/#waitlist">{site.waitlistCtaLabel}</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
