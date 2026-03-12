"use client";

import Link from "next/link";
import { Lock, Package, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/services/authService";
import { useRouter } from "next/navigation";

export function ProductsHeader() {
  const router = useRouter();

  const handleSignout = () => {
    AuthService.logout();
    router.push("/");
  };

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/products" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Lock className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold text-foreground tracking-tight">
              NovaCom
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/products"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground bg-secondary"
            >
              <Package className="h-4 w-4" />
              Products
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={handleSignout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
