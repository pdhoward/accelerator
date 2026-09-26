import { footerColumns, site } from "@/content/site";
import { technologyPartners } from "@/content/partners";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/marketing/logo";
import { NavLink } from "@/components/marketing/nav-link";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/marketing/social-icons";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-obsidian-border bg-obsidian">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-fog">
              {site.description}
            </p>
            <div className="flex items-center gap-3 pt-2 text-mist">
              <a href="https://github.com" aria-label="GitHub" className="transition-colors hover:text-white">
                <GithubIcon className="size-4" />
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="transition-colors hover:text-white">
                <LinkedinIcon className="size-4" />
              </a>
              <a href="https://twitter.com" aria-label="X" className="transition-colors hover:text-white">
                <XIcon className="size-4" />
              </a>
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <p className="font-mono text-xs uppercase tracking-widest text-mist">
                {col.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <NavLink item={item} className="text-sm text-fog transition-colors hover:text-white" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center gap-4 text-xs text-mist sm:flex-row sm:justify-between">
          <p>
            © {year} {site.name}. {site.product}: autonomous application operations.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono uppercase tracking-widest opacity-70">
            {technologyPartners.slice(0, 5).map((p) => (
              <span key={p.name}>{p.name}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
