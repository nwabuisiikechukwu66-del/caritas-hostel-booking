import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const VALID_CATEGORIES = ["plumbing", "electrical", "structural", "furniture", "other"];
const VALID_URGENCY = ["low", "medium", "high"];

// Classifies a free-text maintenance complaint into a category + urgency so
// porters can triage their queue instead of reading every complaint in
// arrival order. Falls back to safe defaults if Groq is unavailable or the
// response doesn't parse - this must never crash the booking/complaint flow.
export async function triageComplaint(description) {
  const fallback = { category: "other", urgency: "medium" };
  if (!groq) return fallback;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "You triage student hostel maintenance complaints. Reply with ONLY a JSON object " +
            `{"category": one of ${JSON.stringify(VALID_CATEGORIES)}, "urgency": one of ${JSON.stringify(VALID_URGENCY)}}. ` +
            "No other text. Urgency 'high' means safety risk (exposed wiring, structural damage, no water/power for a whole floor). " +
            "'low' means cosmetic or minor inconvenience.",
        },
        { role: "user", content: description },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const parsed = JSON.parse(raw);

    if (!VALID_CATEGORIES.includes(parsed.category)) parsed.category = "other";
    if (!VALID_URGENCY.includes(parsed.urgency)) parsed.urgency = "medium";
    return parsed;
  } catch (err) {
    console.error("AI triage failed, using fallback:", err.message);
    return fallback;
  }
}
