"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Timer,
  Calendar,
  FolderKanban,
  ListTodo,
  FileBarChart,
  Receipt,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileSelector } from "@/components/profile-selector";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Timer", href: "/timer", icon: Timer },
  { name: "Calendário", href: "/calendar", icon: Calendar },
  { name: "Projetos", href: "/projects", icon: FolderKanban },
  { name: "Tarefas", href: "/tasks", icon: ListTodo },
  { name: "Relatórios", href: "/reports", icon: FileBarChart },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Perfil", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r bg-muted/40">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-primary">ArchFlow</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <ProfileSelector />
    </aside>
  );
}
