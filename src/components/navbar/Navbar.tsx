// components/navbar.tsx
// import Image from "next/image";
import ThemeToggle from "../ThemeToggle";
import { Input } from "../ui/input";
import { Bell, HelpCircle, Search, User } from "lucide-react";
import { Button } from "../ui/button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="hidden lg:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 w-[200px] md:w-[300px] lg:w-[400px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <HelpCircle className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">User Profile</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
