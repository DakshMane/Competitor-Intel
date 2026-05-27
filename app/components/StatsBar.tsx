"use client";

import { Activity, Target, Zap, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

interface StatsProps {
  totalChanges: number;
  activeCompetitors: number;
  insightsGenerated: number;
  lastScanTime: Date | string;
}

export function StatsBar({
  totalChanges,
  activeCompetitors,
  insightsGenerated,
  lastScanTime,
}: StatsProps) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setTimeAgo(formatDistanceToNow(new Date(lastScanTime), { addSuffix: true }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // update every minute
    return () => clearInterval(interval);
  }, [lastScanTime]);

  const stats = [
    {
      label: "Total Changes",
      value: totalChanges,
      icon: Activity,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      trend: "+12% this week"
    },
    {
      label: "Tracked Targets",
      value: activeCompetitors,
      icon: Target,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      trend: "All systems online"
    },
    {
      label: "AI Insights",
      value: insightsGenerated,
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      trend: "3 unread insights"
    },
    {
      label: "Last Radar Scan",
      value: timeAgo || "Just now",
      icon: Clock,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      trend: "Next scan in 2 hours"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div 
            key={i} 
            className="glass-card p-5 hover:-translate-y-1 transition-transform duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <Icon size={22} />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold tracking-tight mb-1">{stat.value}</h3>
              <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
            </div>
            <div className="mt-4 text-xs text-muted-foreground/70">
              {stat.trend}
            </div>
          </div>
        );
      })}
    </div>
  );
}
