export async function POST(request) {
  try {
    const body = await request.json();

const res = await fetch("/api/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
});

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Analysis failed" }, { status: 500 });
  }
}
