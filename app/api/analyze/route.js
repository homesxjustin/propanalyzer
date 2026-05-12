export async function POST(request) {
  try {
    const body = await request.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return Response.json({ error: "ANTHROPIC_API_KEY is not set" }, { status: 500 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: body.messages,
      }),
    });

    const text = await response.text();
    if (!response.ok) {
      return Response.json({ error: text }, { status: response.status });
    }

    return Response.json(JSON.parse(text));
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
