"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(value?: string | null) {
  if (!value) return "U";
  return value.trim().charAt(0).toUpperCase();
}

function getDisplayName(email?: string | null, name?: string | null) {
  if (name && name.trim().length > 0) return name;
  if (!email) return "User";
  const [prefix] = email.split("@");
  return prefix.length > 14 ? `${prefix.slice(0, 12)}…` : prefix;
}

export function UserMenu() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="h-9 w-9 rounded-full bg-muted/50" />
        <div className="h-4 w-24 rounded bg-muted/50" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/auth/login">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/auth/signup">
          <Button size="sm">Get Started</Button>
        </Link>
      </div>
    );
  }

  const displayName = getDisplayName(user.email, user.user_metadata?.full_name as string | null);
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const initial = getInitials(user.email ?? displayName);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-3 rounded-full px-2 py-1.5 transition hover:bg-muted/60"
        >
          <Avatar className="h-9 w-9 border border-primary/40 shadow-[0_0_12px_rgba(99,102,241,0.35)]">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary">{initial}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-foreground md:block">{displayName}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-xl border-border/60 bg-card/95 backdrop-blur"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">Signed in</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            💰 Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/transactions" className="flex items-center gap-2">
            📊 Transactions
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
