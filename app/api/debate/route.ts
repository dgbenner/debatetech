import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a debate engine that critiques arguments with precision and crafts effective counter-arguments.

For each user argument, you produce four things via the \`debate_analysis\` tool:

1. A response: a substantive counter-argument (or supporting argument when the user requests "for"). 2–4 sentences. Direct, no preamble.

2. A score across four dimensions, each 0–10:
   - clarity: is the claim well-stated?
   - logic: does the reasoning hold?
   - evidence: are claims grounded?
   - persuasiveness: would it move a reasonable opponent?
   Plus a one-sentence summary.

3. Annotations: 2–6 spans pulled from the user's input. Each text_span MUST be an exact substring of the input — no paraphrase, no edits, no added quotes. Mark each as "strength" or "weakness", explain why, and offer a concrete improvement.

4. Three alternative versions of the user's argument, each using a different rhetorical strategy (e.g., data-driven, ethical, emotional, comparative, historical). Include the strategy name, why it works, and when to use it.

Be honest. Score generously only when warranted. Annotate weaknesses without softening.`;

const tool: Anthropic.Tool = {
  name: "debate_analysis",
  description: "Return the full debate analysis: response, score, annotations, and alternatives.",
  input_schema: {
    type: "object",
    properties: {
      response: {
        type: "string",
        description: "The AI's counter-argument (or supporting argument). 2–4 sentences.",
      },
      score: {
        type: "object",
        properties: {
          clarity: { type: "integer", minimum: 0, maximum: 10 },
          logic: { type: "integer", minimum: 0, maximum: 10 },
          evidence: { type: "integer", minimum: 0, maximum: 10 },
          persuasiveness: { type: "integer", minimum: 0, maximum: 10 },
          summary: { type: "string", description: "One-sentence justification of the scores." },
        },
        required: ["clarity", "logic", "evidence", "persuasiveness", "summary"],
      },
      annotations: {
        type: "array",
        minItems: 2,
        maxItems: 6,
        items: {
          type: "object",
          properties: {
            text_span: {
              type: "string",
              description: "Exact substring of the user's input. Must match character-for-character.",
            },
            type: { type: "string", enum: ["strength", "weakness"] },
            explanation: { type: "string" },
            suggestion: { type: "string", description: "Concrete improvement." },
          },
          required: ["text_span", "type", "explanation", "suggestion"],
        },
      },
      alternatives: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            text: { type: "string", description: "The rewritten argument." },
            strategy: { type: "string", description: "Strategy name, e.g. 'data-driven'." },
            reasoning: { type: "string", description: "Why this strategy strengthens the argument." },
            when_to_use: { type: "string", description: "Context where this version lands best." },
          },
          required: ["text", "strategy", "reasoning", "when_to_use"],
        },
      },
    },
    required: ["response", "score", "annotations", "alternatives"],
  },
};

export async function POST(req: Request) {
  try {
    const { input, stance } = (await req.json()) as {
      input?: string;
      stance?: "for" | "against";
    };

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return Response.json({ error: "Input required." }, { status: 400 });
    }

    const userPrompt =
      stance === "for"
        ? `Argue FOR this position (steelman it, then strengthen):\n\n"${input}"`
        : `Argue AGAINST this position:\n\n"${input}"`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [tool],
      tool_choice: { type: "tool", name: "debate_analysis" },
      messages: [{ role: "user", content: userPrompt }],
    });

    if (message.stop_reason === "refusal") {
      return Response.json(
        { error: "The model declined to analyze this argument." },
        { status: 422 },
      );
    }

    const toolUse = message.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );

    if (!toolUse) {
      return Response.json({ error: "No analysis returned." }, { status: 502 });
    }

    return Response.json(toolUse.input);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return Response.json(
        { error: "Missing or invalid ANTHROPIC_API_KEY." },
        { status: 401 },
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "Rate limited. Try again shortly." }, { status: 429 });
    }
    if (err instanceof Anthropic.APIError) {
      return Response.json({ error: err.message }, { status: err.status ?? 500 });
    }
    console.error(err);
    return Response.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
