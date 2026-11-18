import {
  TRANSACTION_CATEGORIES,
  type RecurringFrequency,
  type TransactionCategory,
} from "@/lib/moneyFlowTypes";

export interface ParsedExpense {
  title: string;
  amount: number | null;
  category: TransactionCategory;
  categoryMatched: boolean;
  date: string;
  frequency?: RecurringFrequency;
}

const categoryKeywords: Array<[TransactionCategory, string[]]> = [
  ["Food & Dining", ["lunch", "coffee", "dinner", "burger", "groceries", "grocery", "food"]],
  ["Transport", ["uber", "grab", "gas", "fuel", "train", "bus", "parking"]],
  ["Utilities", ["electric", "electricity", "water", "internet", "wifi", "phone"]],
  ["Subscriptions", ["netflix", "spotify", "icloud", "gym", "subscription"]],
  ["Shopping", ["shopping", "clothes", "clothing", "store"]],
  ["Entertainment", ["movie", "cinema", "concert", "game"]],
  ["Health", ["doctor", "medicine", "pharmacy", "health"]],
];

function getCategory(input: string): {
  category: TransactionCategory;
  matched: boolean;
} {
  for (const [category, keywords] of categoryKeywords) {
    if (
      keywords.some((keyword) =>
        new RegExp(`\\b${keyword}\\b`, "i").test(input),
      )
    ) {
      return { category, matched: true };
    }
  }
  return { category: "Other", matched: false };
}

function dateKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function previousDay(date: Date) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() - 1);
  return result;
}

function getFrequency(input: string): RecurringFrequency | undefined {
  if (/\b(?:every\s+month|monthly)\b|\/\s*mo(?:nth)?\b/i.test(input)) {
    return "monthly";
  }
  if (/\b(?:every\s+year|yearly|annually)\b|\/\s*yr\b/i.test(input)) {
    return "yearly";
  }
  if (/\b(?:every\s+day|daily)\b/i.test(input)) {
    return "daily";
  }
  return undefined;
}

export function parseExpenseInput(
  input: string,
  now = new Date(),
): ParsedExpense | null {
  const rawInput = input.trim();
  if (!rawInput) return null;

  const category = getCategory(rawInput);
  const explicitExpenseIntent =
    /\b(?:spent|spend|expense|paid)\b/i.test(rawInput);
  const hasDurationToken =
    /\b\d+(?:\.\d+)?\s*(?:minutes?|mins?|m|hours?|hrs?|h)\b/i.test(rawInput);
  const currencyAmountMatch = rawInput.match(
    /\$\s*(\d+(?:\.\d{1,2})?)(?!\d)(?!\s*(?:minutes?|mins?|m|hours?|hrs?|h)\b)(?=\s|$|[.,!?;:/])/i,
  );
  const amountMatch =
    currencyAmountMatch ??
    rawInput.match(
      /(?:^|\s)(\d+(?:\.\d{1,2})?)(?!\d)(?!\s*(?:minutes?|mins?|m|hours?|hrs?|h)\b)(?:\s*(?:USD|dollars?))?(?=\s|$|[.,!?;:/])/i,
    );

  if (!amountMatch && (!explicitExpenseIntent || hasDurationToken)) return null;
  if (!currencyAmountMatch && !explicitExpenseIntent && !category.matched) {
    return null;
  }

  const amount = amountMatch ? Number(amountMatch[1]) : null;
  let remainder = rawInput;
  if (amountMatch?.index !== undefined) {
    remainder = `${remainder.slice(0, amountMatch.index)} ${remainder.slice(amountMatch.index + amountMatch[0].length)}`;
  }

  const frequency = getFrequency(rawInput);
  const frequencyPattern =
    /\b(?:every\s+month|monthly|every\s+year|yearly|annually|every\s+day|daily)\b|\/\s*(?:mo(?:nth)?|yr)\b/i;
  remainder = remainder.replace(frequencyPattern, " ");

  let date = dateKey(now);
  if (/\byesterday\b/i.test(remainder)) {
    date = dateKey(previousDay(now));
    remainder = remainder.replace(/\byesterday\b/i, " ");
  } else if (/\btoday\b/i.test(remainder)) {
    remainder = remainder.replace(/\btoday\b/i, " ");
  }

  remainder = remainder
    .replace(/^\s*(?:i\s+)?(?:spent|spend|expense|paid)\b/i, " ")
    .replace(/^\s*(?:on|for)\b/i, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s,.;:!?-]+|[\s,.;:!?-]+$/g, "")
    .trim();

  return {
    title: remainder || "Expense",
    amount,
    category: category.category,
    categoryMatched: category.matched,
    date,
    frequency,
  };
}

/**
 * `billingDay` is the day of month the bill originally started on. Passing it
 * keeps a bill that starts on the 31st on the last day of each month instead
 * of drifting to the 28th after February.
 */
export function getNextRecurringDate(
  date: Date,
  frequency: RecurringFrequency,
  billingDay = date.getUTCDate(),
) {
  const next = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

  if (frequency === "daily") {
    next.setUTCDate(next.getUTCDate() + 1);
    return next;
  }

  const dayOfMonth = billingDay;
  next.setUTCDate(1);
  next.setUTCMonth(next.getUTCMonth() + (frequency === "monthly" ? 1 : 12));
  const lastDayOfMonth = new Date(
    Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0),
  ).getUTCDate();
  next.setUTCDate(Math.min(dayOfMonth, lastDayOfMonth));
  return next;
}

export { TRANSACTION_CATEGORIES };
