"use client";

import { CalendarDays, Check, Clock3, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function TaskFlowPreview() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-[500px] py-8 sm:py-12"
    >
      <motion.div
        animate={{ opacity: [0.55, 0.8, 0.55], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-8 rounded-full bg-gradient-to-br from-indigo-500/30 via-sky-400/20 to-emerald-400/20 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: [0, -5, 0] }}
        transition={{
          opacity: { duration: 0.7 },
          y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
        }}
        className="relative rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-2xl shadow-indigo-950/10 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/80 sm:p-7"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
              <CalendarDays className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">My Day</p>
              <p className="text-xs text-muted-foreground">A plan that flows</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/15 bg-indigo-500/5 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
            <Sparkles className="size-3.5" />
            Auto-planned
          </span>
        </div>

        <div className="mt-7 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Today&apos;s focus</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              Make meaningful progress
            </p>
          </div>
          <p className="shrink-0 text-xs font-medium text-muted-foreground">
            3h 25m
          </p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            animate={{ width: ["38%", "44%", "38%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"
          />
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex gap-3">
            <div className="w-12 shrink-0 pt-3 text-[11px] font-medium text-muted-foreground">
              9:00
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.06] p-3.5">
              <span className="size-2 shrink-0 rounded-full bg-indigo-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  Prepare for interview
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  High priority
                </p>
              </div>
              <span className="shrink-0 rounded-lg bg-background/80 px-2 py-1 text-[11px] text-muted-foreground">
                45 min
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-12 shrink-0 pt-3 text-[11px] font-medium text-muted-foreground">
              10:00
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-border/70 bg-background/60 p-3.5">
              <span className="size-2 shrink-0 rounded-full bg-sky-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  Apply to a frontend role
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Job search
                </p>
              </div>
              <span className="shrink-0 rounded-lg bg-muted/70 px-2 py-1 text-[11px] text-muted-foreground">
                30 min
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-12 shrink-0 pt-3 text-[11px] font-medium text-muted-foreground">
              10:45
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-border/70 bg-background/60 p-3.5">
              <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  Take a short reset
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Recharge before the next task
                </p>
              </div>
              <Clock3 className="size-4 shrink-0 text-muted-foreground" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-1 right-0 flex items-center gap-2 rounded-2xl border border-emerald-500/15 bg-background/90 px-4 py-3 shadow-xl shadow-emerald-950/10 backdrop-blur-xl sm:-right-5"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
          <Check className="size-4" />
        </span>
        <span className="text-xs font-medium text-foreground">
          One step at a time
        </span>
      </motion.div>
    </div>
  );
}
