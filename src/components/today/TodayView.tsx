"use client";

import { CheckCircle2, Phone, MapPin, Check, Trophy, Sparkles } from "lucide-react";

interface Props {
  userName: string;
  tasks?: any[];
  metrics?: any;
}

export function TodayView({ userName = "Demo", tasks = [] }: Props) {
  const overdueCount = tasks.filter((t) => new Date(t.dueDate) < new Date()).length;
  const todayCount = tasks.filter((t) => {
    const d = new Date(t.dueDate);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;
  const upcomingCount = tasks.filter((t) => new Date(t.dueDate) > new Date()).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
          Today, {userName}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Team follow-ups and visits · next 7 days
        </p>
      </div>

      {/* Main Grid: Left 2/3 & Right 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 3 Quick Cards: Overdue, Today, Upcoming */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            {/* Overdue */}
            <div className="p-3 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs min-w-0">
              <span className="text-xs font-medium text-slate-500 block truncate">Overdue</span>
              <div className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-rose-500 tracking-tight font-heading truncate">
                {overdueCount}
              </div>
            </div>

            {/* Today */}
            <div className="p-3 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs min-w-0">
              <span className="text-xs font-medium text-slate-500 block truncate">Today</span>
              <div className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-[#3B8CFF] tracking-tight font-heading truncate">
                {todayCount}
              </div>
            </div>

            {/* Upcoming */}
            <div className="p-3 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs min-w-0">
              <span className="text-xs font-medium text-slate-500 block truncate">Upcoming</span>
              <div className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-amber-500 tracking-tight font-heading truncate">
                {upcomingCount}
              </div>
            </div>
          </div>

          {/* Caught Up / Task List Card */}
          <div className="p-8 sm:p-12 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-slate-900 font-heading">
              You&apos;re all caught up
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              No follow-ups or visits due in the next 7 days.
            </p>
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Next up Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4 text-[#3B8CFF]" />
              <span>Next up</span>
            </div>
            <p className="text-xs text-slate-400 py-6 text-center">
              Nothing queued. Enjoy the quiet.
            </p>
          </div>

          {/* Team today Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-4">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Team today</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Calls */}
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Phone className="w-3.5 h-3.5 text-[#3B8CFF]" />
                  <span>Calls</span>
                </div>
                <div className="text-xl font-bold text-slate-900 font-heading">0</div>
              </div>

              {/* Visits done */}
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>Visits done</span>
                </div>
                <div className="text-xl font-bold text-slate-900 font-heading">0</div>
              </div>

              {/* Follow-ups cleared */}
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Follow-ups cleared</span>
                </div>
                <div className="text-xl font-bold text-slate-900 font-heading">0</div>
              </div>

              {/* Booked · 7d */}
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-purple-500" />
                  <span>Booked · 7d</span>
                </div>
                <div className="text-xl font-bold text-slate-900 font-heading">0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
