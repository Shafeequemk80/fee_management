"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, FileText, Settings, UserCircle, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "../ui/button";

interface ShellProps {
  children: React.ReactNode;
  role: "admin" | "student";
}

export function Shell({ children, role }: ShellProps) {
  const pathname = usePathname();

  const adminNav = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Fees", href: "/admin/fees", icon: FileText },
    { name: "Reports", href: "/admin/reports", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const studentNav = [
    { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "History", href: "/student/history", icon: FileText },
  ];

  const navigation = role === "admin" ? adminNav : studentNav;

  return (
    <div className="flex h-screen w-full flex-col bg-muted/40 pb-16 md:pb-0">
      {/* Top Header */}
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 justify-between lg:h-[60px]">
        <div className="flex items-center gap-2 font-semibold">
          <div className="bg-primary/10 p-1.5 rounded-full">
            <UserCircle className="h-6 w-6 text-primary" />
          </div>
          <span className="">Madrassa {role === "admin" ? "Admin" : "Student"}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <nav className="hidden border-r bg-muted/40 md:block md:w-64 lg:w-72">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex-1 overflow-auto py-4">
              <ul className="grid px-4 text-sm font-medium gap-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                          isActive && "bg-muted text-primary font-semibold"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-between border-t bg-background px-4 md:hidden">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-muted-foreground",
                isActive && "text-primary font-semibold"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
