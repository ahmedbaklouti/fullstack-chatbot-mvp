export type RuleLike = {
  keywords: string[];
  response: string;
};

type RuleMatch = {
  responseText: string;
  earliestKeywordIndex: number;
  isGreetingMatch: boolean;
};

// Greeting rules are treated as "high priority" even if they appear later in the message.
const GREETING_KEYWORDS = new Set(['hello', 'hi', 'hey']);

function findEarliestKeywordIndex(
  messageLower: string,
  keywords: string[],
): number {
  let earliestIndex = -1;

  for (const keyword of keywords) {
    const keywordLower = keyword.trim().toLowerCase();
    if (!keywordLower) continue;

    const index = messageLower.indexOf(keywordLower);
    if (index === -1) continue;

    if (earliestIndex === -1 || index < earliestIndex) earliestIndex = index;
  }

  return earliestIndex;
}

function isGreetingRule(keywords: string[]) {
  return keywords.some((keyword) =>
    GREETING_KEYWORDS.has(keyword.trim().toLowerCase()),
  );
}

export function detectResponsesFromRules(
  message: string,
  rules: RuleLike[],
): string[] {
  const messageLower = message.toLowerCase();
  const ruleMatches: RuleMatch[] = [];

  for (const rule of rules) {
    const earliestKeywordIndex = findEarliestKeywordIndex(
      messageLower,
      rule.keywords,
    );
    if (earliestKeywordIndex === -1) continue;

    ruleMatches.push({
      responseText: rule.response,
      earliestKeywordIndex,
      isGreetingMatch: isGreetingRule(rule.keywords),
    });
  }

  // Ordering rules:
  // 1) greeting first
  // 2) then by first keyword appearance in the message
  ruleMatches.sort((a, b) => {
    if (a.isGreetingMatch !== b.isGreetingMatch) {
      return a.isGreetingMatch ? -1 : 1;
    }

    return a.earliestKeywordIndex - b.earliestKeywordIndex;
  });

  const seen = new Set<string>();
  const orderedUniqueResponses: string[] = [];

  for (const match of ruleMatches) {
    if (seen.has(match.responseText)) continue;
    seen.add(match.responseText);
    orderedUniqueResponses.push(match.responseText);
  }

  return orderedUniqueResponses;
}

export function detectResponseFromRules(
  message: string,
  rules: RuleLike[],
): string | null {
  const responses = detectResponsesFromRules(message, rules);
  if (responses.length === 0) return null;
  return responses.join('\n\n');
}
