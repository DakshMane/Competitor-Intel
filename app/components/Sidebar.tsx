"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Activity, Lightbulb, Zap, Radar, Plus, LayoutGrid } from "lucide-react";
import { ScanButton } from "./ScanButton";
import { AddCompetitorModal } from "./AddCompetitorModal";
import { useState, useEffect, useCallback } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchCompetitors = useCallback(() => {
    fetch("/api/competitors")
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setCompetitors(data) : setCompetitors([]))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchCompetitors();
  }, [fetchCompetitors, pathname]);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Comparison Matrix", href: "/matrix", icon: LayoutGrid },
    { name: "Competitors", href: "/competitors", icon: Users },
    { name: "Change Feed", href: "/changes", icon: Activity },
    { name: "AI Insights", href: "/insights", icon: Lightbulb },
  ];

  return (
    <aside className="w-64 glass border-r border-border h-screen sticky top-0 flex flex-col pt-6 pb-4 z-40">
      <div className="px-6 pb-6 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 group-hover:bg-primary/20 transition-all">
            <img src="/icon.png" alt="IntelDash Logo" className="w-5 h-5 object-contain rounded-md" />
          </div>
          <span className="font-bold text-lg tracking-tight">IntelDash</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}

        <div className="mt-8 mb-2 px-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tracked Targets
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-1 rounded-md hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors"
            title="Add competitor"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-1">
          {competitors.map((comp) => (
            <Link
              key={comp.id}
              href={`/competitors/${comp.slug}`}
              className="flex items-center justify-between px-3 py-2 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: comp.color || '#666' }}
                />
                <span className="truncate max-w-[120px]">{comp.name}</span>
              </div>
              {comp.unreadChanges > 0 && (
                <span className="bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full font-medium">
                  {comp.unreadChanges}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      <div className="px-4 mt-auto">
        <ScanButton />
      </div>

      <AddCompetitorModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          fetchCompetitors();
        }}
      />
    </aside>
  );
}
