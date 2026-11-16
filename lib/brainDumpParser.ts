import type { Priority } from "@/lib/models/models.types";

export interface ParsedBrainDump {
  title: string;
  dueDate?: string;
  priority: Priority;
  estimatedDurationMinutes: number;
  kind: "task" | "job";
  company?: string;
  position?: string;
}

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function parseBrainDump(input: string, now = new Date()): ParsedBrainDump {
  let remainder = input.trim();
  let dueDate: string | undefined;
  let priority: Priority = "medium";
  let estimatedDurationMinutes = 30;

  if (/\btomorrow\b/i.test(remainder)) {
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    dueDate = dateInputValue(tomorrow);
    remainder = remainder.replace(/\btomorrow\b/i, " ");
  } else if (/\btoday\b/i.test(remainder)) {
    dueDate = dateInputValue(now);
    remainder = remainder.replace(/\btoday\b/i, " ");
  }

  const priorityMatch = remainder.match(
    /\b(high|medium|low)\s+priority\b|\bpriority\s+(high|medium|low)\b/i,
  );
  if (priorityMatch) {
    priority = (priorityMatch[1] ?? priorityMatch[2]).toLowerCase() as Priority;
    remainder = remainder.replace(priorityMatch[0], " ");
  }

  const durationMatch = remainder.match(
    /\b(\d+(?:\.\d+)?)\s*(minutes?|mins?|m|hours?|hrs?|h)\b/i,
  );
  if (durationMatch) {
    const amount = Number(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    estimatedDurationMinutes = Math.min(
      480,
      Math.max(5, Math.round(amount * (unit.startsWith("h") ? 60 : 1))),
    );
    remainder = remainder.replace(durationMatch[0], " ");
  }

  const jobMatch = remainder.match(
    /^\s*(?:apply\s+to|application\s+to|interview\s+(?:at|with))\s+(.+)$/i,
  );
  if (jobMatch) {
    const jobDetails = jobMatch[1].trim();
    const forMatch = jobDetails.match(/^(.+?)\s+for\s+(.+)$/i);
    let company: string;
    let position: string;
    if (forMatch) {
      company = forMatch[1].trim();
      position = forMatch[2].trim();
    } else {
      const [first, ...rest] = jobDetails.split(/\s+/);
      company = first;
      position = rest.join(" ").trim() || "Job application";
    }
    return {
      title: position,
      position,
      company,
      dueDate,
      priority,
      estimatedDurationMinutes,
      kind: "job",
    };
  }

  const title = remainder.replace(/\s+/g, " ").trim() || input.trim();
  return {
    title,
    dueDate,
    priority,
    estimatedDurationMinutes,
    kind: "task",
  };
}
