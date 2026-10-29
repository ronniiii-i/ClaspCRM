import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 lg:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold tracking-tight">Clasp Workspace</p>
          <p className="text-sm text-muted-foreground">
            The CRM that adapts to your company&apos;s DNA.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Product</p>
            <Link href="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link href="/#value" className="text-muted-foreground transition-colors hover:text-foreground">
              Value
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Company</p>
            <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">
              About
            </Link>
            <Link href="/contact" className="text-muted-foreground transition-colors hover:text-foreground">
              Contact
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Legal</p>
            <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="text-muted-foreground transition-colors hover:text-foreground">
              Terms
            </Link>
          </div>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-sm text-muted-foreground lg:px-8">
          <p>© {new Date().getFullYear()} Clasp Workspace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
