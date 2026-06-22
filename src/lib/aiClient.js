async function postJson(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `AI request failed with status ${response.status}`);
  }
  return data;
}

export async function checkModelHealth() {
  const response = await fetch("/api/ai/health");
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `AI health check failed with status ${response.status}`);
  }
  return data;
}

export function extractProfile(inputText, preferredLanguage) {
  return postJson("/api/ai/extract", { inputText, preferredLanguage });
}

export function scoreSemanticFit(profile, candidates) {
  return postJson("/api/ai/semantic", { profile, candidates });
}

export function generateExplanation(payload) {
  return postJson("/api/ai/explain", payload);
}
