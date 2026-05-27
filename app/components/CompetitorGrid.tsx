"use client";

import Link from "next/link";
import { ArrowUpRight, Activity } from "lucide-react";

interface Competitor {
  id: number;
  name: string;
  slug: string;
  color: string;
  logoUrl: string | null;
  totalChanges: number;
  unreadChanges: number;
}

export function CompetitorGrid({ competitors }: { competitors: Competitor[] }) {
  if (!competitors || competitors.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Activity className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-1">No competitors tracked yet</h3>
        <p className="text-muted-foreground">Add your first target to start monitoring changes.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {competitors.map((comp) => (
        <Link 
          href={`/competitors/${comp.slug}`} 
          key={comp.id}
          className="group"
        >
          <div className="glass-card p-6 h-full transition-all duration-300 hover:shadow-lg hover:border-white/10 overflow-hidden relative">
            {/* Top right gradient accent */}
            <div 
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity"
              style={{ backgroundColor: comp.color }}
            />
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                {comp.logoUrl ? (
                  <img 
                    src={comp.logoUrl} 
                    alt={`${comp.name} logo`} 
                    className="w-10 h-10 rounded-lg object-contain bg-white/5 p-1"
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-inner"
                    style={{ backgroundColor: comp.color }}
                  >
                    {comp.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">{comp.name}</h3>
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: comp.color }}
                    />
                    <span className="text-xs text-muted-foreground">Active Tracking</span>
                  </div>
                </div>
              </div>
              <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                <ArrowUpRight size={20} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Total Changes</div>
                <div className="text-2xl font-bold">{comp.totalChanges}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg relative">
                <div className="text-xs text-muted-foreground mb-1">Unread</div>
                <div className="text-2xl font-bold text-primary">
                  {comp.unreadChanges}
                </div>
                {comp.unreadChanges > 0 && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
            </div>
            
            {/* Simple CSS-based mini bar chart for activity */}
            <div className="mt-6 flex items-end gap-1 h-8 opacity-50 group-hover:opacity-100 transition-opacity">
              {[40, 70, 30, 80, 50, 90, 60].map((val, i) => (
                <div 
                  key={i} 
                  className="flex-1 rounded-t-sm transition-all duration-500 ease-out"
                  style={{ 
                    height: `${val}%`, 
                    backgroundColor: comp.color,
                    transitionDelay: `${i * 50}ms`
                  }}
                />
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
