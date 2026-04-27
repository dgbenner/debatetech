import Anthropic from "@anthropic-ai/sdk";
import type { Turn } from "../../types";

export const runtime = "nodejs";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the engine behind Debate Tech — a sparring partner and a coach in the user's corner.

Each round, the user submits an argument. You do two things at once:

A) COACH the user's argument. You score it, annotate spans, name any logical fallacies and cognitive biases, list stronger arguments they could have made (missed_points), and write three alternative versions in different rhetorical strategies.

B) COUNTER the user. Argue the opposing side of the topic. 2–4 sentences. Engage their strongest point — don't dodge it. Concede genuine ground when warranted, then redraw the line of disagreement.

Both outputs go through the \`turn_response\` tool.

Coaching rules:
- Score 0–10 on clarity, logic, evidence, persuasiveness. Plus a one-sentence summary.
- Annotations: 2–6 spans. text_span MUST be an exact substring of the user's most recent turn — character-for-character, no edits.
- Fallacies: 0–4. Include name + exact span + one-sentence note. Do not invent fallacies that aren't there.
- Biases: 0–3. Name + note. Do not invent.
- Missed points: 0–4 single-sentence stronger arguments the user could have made for their position.
- Alternatives: exactly 3 rewrites of the user's argument, each in a different strategy (data-driven, ethical, comparative, emotional, historical, concession-pivot, etc.). Include strategy name, reasoning, when_to_use.

Counter rules:
- You are arguing the side OPPOSITE the user. Stay in role.
- Read the full transcript when present — build on prior exchanges, don't restart.
- Be fair: the strongest version of your counter concedes the user's real points.
- Score your own counter on the same four dimensions, with a summary.

Be honest. Score generously only when warranted. Don't soften critique.`;

const tool: Anthropic.Tool = {
  name: "turn_response",
  description: "Coach the user's most recent turn AND produce Claude's counter for the next turn.",
  input_schema: {
    type: "object",
    properties: {
      user_analysis: {
        type: "object",
        properties: {
          score: {
            type: "object",
            properties: {
              clarity: { type: "integer", minimum: 0, maximum: 10 },
              logic: { type: "integer", minimum: 0, maximum: 10 },
              evidence: { type: "integer", minimum: 0, maximum: 10 },
              persuasiveness: { type: "integer", minimum: 0, maximum: 10 },
              summary: { type: "string" },
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
                text_span: { type: "string", description: "Exact substring of user's turn." },
                type: { type: "string", enum: ["strength", "weakness"] },
                explanation: { type: "string" },
                suggestion: { type: "string" },
              },
              required: ["text_span", "type", "explanation", "suggestion"],
            },
          },
          fallacies: {
            type: "array",
            minItems: 0,
            maxItems: 4,
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                span: { type: "string", description: "Exact substring." },
                note: { type: "string" },
              },
              required: ["name", "span", "note"],
            },
          },
          biases: {
            type: "array",
            minItems: 0,
            maxItems: 3,
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                note: { type: "string" },
              },
              required: ["name", "note"],
            },
          },
          missed_points: {
            type: "array",
            minItems: 0,
            maxItems: 4,
            items: { type: "string" },
          },
          alternatives: {
            type: "array",
            minItems: 3,
            maxItems: 3,
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                strategy: { type: "string" },
                reasoning: { type: "string" },
                when_to_use: { type: "string" },
              },
              required: ["text", "strategy", "reasoning", "when_to_use"],
            },
          },
        },
        required: [
          "score",
          "annotations",
          "fallacies",
          "biases",
          "missed_points",
          "alternatives",
        ],
      },
      claude_response: {
        type: "object",
        properties: {
          text: { type: "string", description: "Claude's counter-argument. 2–4 sentences." },
          score: {
            type: "object",
            properties: {
              clarity: { type: "integer", minimum: 0, maximum: 10 },
              logic: { type: "integer", minimum: 0, maximum: 10 },
              evidence: { type: "integer", minimum: 0, maximum: 10 },
              persuasiveness: { type: "integer", minimum: 0, maximum: 10 },
              summary: { type: "string" },
            },
            required: ["clarity", "logic", "evidence", "persuasiveness", "summary"],
          },
        },
        required: ["text", "score"],
      },
    },
    required: ["user_analysis", "claude_response"],
  },
};

function formatTranscript(transcript: Turn[]): string {
  if (transcript.length === 0) return "(No prior turns.)";
  return transcript
    .map((t) => {
      const speaker = t.side === "user" ? "User" : "Claude";
      return `Round ${t.round} — ${speaker}: "${t.text}"`;
    })
    .join("\n\n");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      topic?: string;
      userSide?: "for" | "against";
      transcript?: Turn[];
      newTurn?: string;
    };

    const { topic, userSide, transcript, newTurn } = body;

    if (!topic || !userSide || !newTurn || typeof newTurn !== "string" || newTurn.trim().length === 0) {
      return Response.json(
        { error: "topic, userSide, and newTurn are all required." },
        { status: 400 },
      );
    }

    const claudeSide = userSide === "for" ? "against" : "for";
    const round = Math.floor((transcript?.length ?? 0) / 2) + 1;

    const userPrompt = `Topic: "${topic}"

User is arguing: ${userSide.toUpperCase()}
You (Claude) are arguing: ${claudeSide.toUpperCase()}

Transcript so far:
${formatTranscript(transcript ?? [])}

The user's new turn (Round ${round}):
"${newTurn}"

Now: coach the user's new turn AND write your counter as Round ${round} for the ${claudeSide} side.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 6144,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [tool],
      tool_choice: { type: "tool", name: "turn_response" },
      messages: [{ role: "user", content: userPrompt }],
    });

    if (message.stop_reason === "refusal") {
      return Response.json(
        { error: "The model declined to engage with this topic." },
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
