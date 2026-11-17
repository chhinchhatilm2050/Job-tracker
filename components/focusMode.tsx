"use client";

import { useEffect, useRef, useState } from "react";
import { logFocusMinutes } from "@/lib/action/myDay";
import type { EnergyLevel, MyDayCard } from "@/lib/models/models.types";
import { Button } from "./ui/button";
import { HeroBackground } from "./heroBackground";

interface FocusModeProps {
  card: MyDayCard;
  energyLevel: EnergyLevel;
  onClose: () => void;
}

const FOCUS_INTERVALS: Record<
  EnergyLevel,
  { workMinutes: number; breakMinutes: number }
> = {
  high: { workMinutes: 45, breakMinutes: 10 },
  normal: { workMinutes: 25, breakMinutes: 5 },
  low: { workMinutes: 15, breakMinutes: 5 },
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder}m`;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function getNextWorkMinutes(
  estimated: number,
  actual: number,
  logged: number,
  sessionMinutes: number,
) {
  const remaining = Math.max(estimated - actual - logged, 0);
  return remaining > 0 ? Math.min(sessionMinutes, remaining) : sessionMinutes;
}

export default function FocusMode({
  card,
  energyLevel,
  onClose,
}: FocusModeProps) {
  const hasEstimate =
    card.boardType !== "job_tracker" &&
    card.estimatedDurationMinutes !== undefined;
  const estimated = card.estimatedDurationMinutes ?? 30;
  const actual = card.actualDurationMinutes ?? 0;
  const { workMinutes: sessionMinutes, breakMinutes } =
    FOCUS_INTERVALS[energyLevel];
  const breakSeconds = breakMinutes * 60;
  const [phase, setPhase] = useState<"work" | "break" | "estimateReached">(
    "work",
  );
  const [loggedMinutes, setLoggedMinutes] = useState(0);
  const [workMinutes, setWorkMinutes] = useState(() =>
    hasEstimate
      ? getNextWorkMinutes(estimated, actual, 0, sessionMinutes)
      : sessionMinutes,
  );
  const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60);
  const [cycleCount, setCycleCount] = useState(0);
  const [isLogging, setIsLogging] = useState(false);
  const [error, setError] = useState("");
  const completionHandled = useRef(false);
  const phaseStartedAt = useRef(0);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
    };
  }, []);

  useEffect(() => {
    if (phaseStartedAt.current === 0) {
      phaseStartedAt.current = Date.now();
    }

    if (phase === "estimateReached") return;

    if (secondsLeft > 0) {
      const timeout = window.setTimeout(
        () => setSecondsLeft((seconds) => seconds - 1),
        1000,
      );
      return () => window.clearTimeout(timeout);
    }

    if (isLogging || error || completionHandled.current) return;
    completionHandled.current = true;
    if (phase === "break") {
      const timeout = window.setTimeout(() => {
        const nextWorkMinutes = hasEstimate
          ? getNextWorkMinutes(
              estimated,
              actual,
              loggedMinutes,
              sessionMinutes,
            )
          : sessionMinutes;
        setWorkMinutes(nextWorkMinutes);
        setPhase("work");
        setSecondsLeft(nextWorkMinutes * 60);
        phaseStartedAt.current = Date.now();
        completionHandled.current = false;
      }, 0);
      return () => window.clearTimeout(timeout);
    }

    const remainingEstimate = estimated - actual - loggedMinutes;
    const isFinalEstimatedBlock =
      hasEstimate &&
      remainingEstimate > 0 &&
      remainingEstimate <= workMinutes;
    const timeout = window.setTimeout(() => {
      setIsLogging(true);
      void logFocusMinutes(card._id, workMinutes)
        .then((result) => {
          if (result.error) {
            setError(result.error);
            setSecondsLeft(1);
            return;
          }
          setLoggedMinutes((minutes) => minutes + workMinutes);
          setCycleCount((count) => count + 1);
          setError("");
          if (isFinalEstimatedBlock) {
            setPhase("estimateReached");
            setSecondsLeft(0);
          } else {
            setPhase("break");
            setSecondsLeft(breakSeconds);
            phaseStartedAt.current = Date.now();
          }
          completionHandled.current = false;
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Could not log focus time");
          setSecondsLeft(1);
        })
        .finally(() => setIsLogging(false));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [
    actual,
    card._id,
    breakSeconds,
    error,
    estimated,
    hasEstimate,
    isLogging,
    loggedMinutes,
    phase,
    sessionMinutes,
    secondsLeft,
    workMinutes,
  ]);

  async function stopFocus() {
    if (phase === "work") {
      const elapsedMinutes = Math.floor(
        (Date.now() - phaseStartedAt.current) / 60_000,
      );
      if (elapsedMinutes > 0) {
        const result = await logFocusMinutes(
          card._id,
          Math.min(workMinutes, elapsedMinutes),
        );
        if (result.error) {
          setError(result.error);
          return;
        }
      }
    }
    onClose();
  }

  function continueFocus() {
    const nextWorkMinutes = hasEstimate
      ? getNextWorkMinutes(
          estimated,
          actual,
          loggedMinutes,
          sessionMinutes,
        )
      : sessionMinutes;
    setWorkMinutes(nextWorkMinutes);
    setPhase("work");
    setSecondsLeft(nextWorkMinutes * 60);
    phaseStartedAt.current = Date.now();
    completionHandled.current = false;
  }

  const title = card.title || card.position;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-title"
      className="hero-video-simulation fixed inset-0 z-[100] isolate flex h-dvh items-center justify-center overflow-hidden bg-zinc-950 px-5 py-10 text-white"
    >
      <HeroBackground />
      <div className="relative z-10 w-full max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
          {phase === "estimateReached"
            ? "Estimated time reached"
            : phase === "work"
              ? "Focus session"
              : `Take a ${breakMinutes}-minute break`}
        </p>
        <h1 id="focus-title" className="mt-5 text-2xl font-semibold sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {card.boardName} · {card.columnName}
        </p>
        <div
          aria-live="polite"
          className="my-12 font-mono text-7xl font-light tabular-nums tracking-tight sm:text-8xl"
        >
          {formatTime(secondsLeft)}
        </div>
        <p className="text-sm text-zinc-400">
          {sessionMinutes}-minute work block · {breakMinutes}-minute break ·{" "}
          {energyLevel} energy
        </p>
        {(hasEstimate || actual + loggedMinutes > 0) && (
          <p className="mt-2 text-sm text-zinc-400">
            {hasEstimate && <>Estimated {formatDuration(estimated)} · </>}
            Actual {formatDuration(actual + loggedMinutes)}
          </p>
        )}
        {cycleCount > 0 && (
          <p className="mt-2 text-sm text-zinc-400">
            {cycleCount}{" "}
            {cycleCount === 1 ? "focus session" : "focus sessions"} completed
          </p>
        )}
        {phase === "estimateReached" && (
          <p className="mt-3 text-sm text-zinc-400">
            Continue focusing if the task needs more time.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-300">
            {error}
          </p>
        )}
        <div className="mt-8 flex justify-center gap-3">
          {phase === "estimateReached" && (
            <Button
              variant="outline"
              onClick={continueFocus}
              className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
            >
              Continue focus
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => void stopFocus()}
            disabled={isLogging}
            className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
          >
            End focus
          </Button>
        </div>
      </div>
    </div>
  );
}
