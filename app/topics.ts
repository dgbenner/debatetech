export const TOPIC_CATEGORIES = [
  {
    id: "politics",
    label: "Politics",
    topics: [
      "Voting should be mandatory in democracies",
      "Term limits should apply to all elected offices",
      "Lobbying by corporations should be banned",
    ],
  },
  {
    id: "tech",
    label: "Technology",
    topics: [
      "AI will replace junior engineers within 3 years",
      "Social media should require age verification",
      "Open-source models are safer than closed ones",
    ],
  },
  {
    id: "ethics",
    label: "Ethics",
    topics: [
      "It is ethical to eat meat in 2026",
      "Lying is sometimes morally required",
      "Wealthy nations owe climate reparations",
    ],
  },
  {
    id: "society",
    label: "Society",
    topics: [
      "Remote work should be the default for knowledge work",
      "Cities should ban single-family zoning",
      "Standardized testing measures wealth, not aptitude",
    ],
  },
  {
    id: "economics",
    label: "Economics",
    topics: [
      "Universal basic income would reduce poverty without harming work",
      "Tipping should be abolished in the US",
      "Antitrust should break up the largest tech companies",
    ],
  },
] as const;

export type TopicCategoryId = (typeof TOPIC_CATEGORIES)[number]["id"];
