import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(new Error(`Invalid request JSON: ${error.message}`));
      }
    });
    req.on("error", reject);
  });
}

function getAiConfig() {
  const provider = process.env.LLM_PROVIDER || "ollama";
  const defaultModelByProvider = {
    groq: "llama-3.1-8b-instant",
    google: "gemini-2.0-flash",
    openai: "gpt-4o-mini",
    ollama: "gemma3:4b",
  };
  const apiKeyByProvider = {
    groq: process.env.GROQ_API_KEY || process.env.LLM_API_KEY || "",
    google:
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.LLM_API_KEY ||
      "",
    openai: process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || "",
    ollama: "",
  };
  return {
    provider,
    baseUrl: (
      process.env.LLM_BASE_URL ||
      (provider === "google"
        ? "https://generativelanguage.googleapis.com"
        : provider === "groq"
          ? "https://api.groq.com/openai/v1"
          : "http://localhost:11434")
    ).replace(
      /\/$/,
      "",
    ),
    model: process.env.LLM_MODEL || defaultModelByProvider[provider] || "gemma3:4b",
    timeoutMs: Number(process.env.LLM_TIMEOUT_MS || 30000),
    apiKey: apiKeyByProvider[provider] || process.env.LLM_API_KEY || "",
  };
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function parseJsonFromModel(text) {
  const trimmed = String(text || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .trim();
  if (!trimmed) throw new Error("Model returned an empty response.");
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) return JSON.parse(fenced[1]);
    const first = trimmed.indexOf("{");
    const last = trimmed.lastIndexOf("}");
    if (first >= 0 && last > first) return JSON.parse(trimmed.slice(first, last + 1));
    throw new Error("Model response was not valid JSON.");
  }
}

async function ollamaGenerate({ system, payload, json, maxTokens }) {
  const config = getAiConfig();
  const prompt = `${system}\n\nINPUT:\n${JSON.stringify(payload, null, 2)}`;
  const response = await fetchWithTimeout(
    `${config.baseUrl}/api/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model,
        prompt,
        stream: false,
        format: json ? "json" : undefined,
        options: {
          temperature: json ? 0.1 : 0.3,
          top_p: 0.9,
          num_predict: maxTokens || (json ? 1200 : 800),
        },
      }),
    },
    config.timeoutMs,
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Ollama request failed (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return data.response;
}

async function openAiGenerate({ system, payload, json, maxTokens }) {
  const config = getAiConfig();
  if (!config.apiKey) {
    throw new Error("LLM_API_KEY or OPENAI_API_KEY is required for OpenAI-compatible providers.");
  }

  const useProviderJsonMode = json && config.provider !== "groq";
  const jsonSystem = json
    ? `${system} Return one valid JSON object only. Start with { and end with }. Do not include markdown, prose, analysis, or chain-of-thought.`
    : system;
  const userContent = JSON.stringify(payload, null, 2);

  const response = await fetchWithTimeout(
    `${config.baseUrl}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: json ? 0.1 : 0.3,
        max_completion_tokens: maxTokens || (json ? 1200 : 800),
        response_format: useProviderJsonMode ? { type: "json_object" } : undefined,
        messages: [
          { role: "system", content: jsonSystem },
          {
            role: "user",
            content:
              config.provider === "groq" && json
                ? `/no_think\nReturn only the JSON object. Do not think step by step.\n\n${userContent}`
                : userContent,
          },
        ],
      }),
    },
    config.timeoutMs,
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI-compatible request failed (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function googleGenerate({ system, payload, json, maxTokens }) {
  const config = getAiConfig();
  if (!config.apiKey) {
    throw new Error("LLM_API_KEY, GEMINI_API_KEY, or GOOGLE_API_KEY is required for Google AI Studio.");
  }

  const prompt = `${system}\n\nINPUT:\n${JSON.stringify(payload, null, 2)}`;
  const generationConfig = {
    temperature: json ? 0.1 : 0.3,
    topP: 0.9,
    maxOutputTokens: maxTokens || (json ? 1200 : 800),
  };

  if (json) {
    generationConfig.responseFormat = {
      text: {
        mimeType: "application/json",
      },
    };
  }

  const response = await fetchWithTimeout(
    `${config.baseUrl}/v1beta/models/${encodeURIComponent(config.model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": config.apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: system }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: JSON.stringify(payload, null, 2) }],
          },
        ],
        generationConfig,
      }),
    },
    config.timeoutMs,
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google AI Studio request failed (${response.status}): ${detail}`);
  }

  const data = await response.json();
  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim() || "";

  if (!text) {
    const blockReason =
      data.promptFeedback?.blockReason || data.candidates?.[0]?.finishReason || "empty response";
    throw new Error(`Google AI Studio returned no text (${blockReason}).`);
  }

  return text;
}

async function generateWithModel(request) {
  const config = getAiConfig();
  if (config.provider === "openai") return openAiGenerate(request);
  if (config.provider === "groq") return openAiGenerate(request);
  if (config.provider === "ollama") return ollamaGenerate(request);
  if (config.provider === "google") return googleGenerate(request);
  throw new Error(`Unsupported LLM_PROVIDER: ${config.provider}`);
}

function validateExtractedProfile(profile) {
  const required = ["name", "region", "education", "stream", "targetOccupation", "language"];
  for (const key of required) {
    if (!profile || typeof profile[key] !== "string" || !profile[key].trim()) {
      throw new Error(`Model extraction missing required field: ${key}`);
    }
  }
  if (!Array.isArray(profile.credentials)) {
    throw new Error("Model extraction must include credentials as an array.");
  }
  if (typeof profile.wageExpectationMonthly !== "number") {
    throw new Error("Model extraction must include numeric wageExpectationMonthly.");
  }
  if (typeof profile.confidence !== "number") {
    throw new Error("Model extraction must include numeric confidence.");
  }
  return profile;
}

function validateSemanticScores(result, candidateIds) {
  if (!result || !Array.isArray(result.scores)) {
    throw new Error("Model semantic response must include a scores array.");
  }
  const seen = new Set();
  for (const row of result.scores) {
    if (!candidateIds.includes(row.occupationId)) {
      throw new Error(`Model returned unknown occupationId: ${row.occupationId}`);
    }
    if (typeof row.score !== "number" || row.score < 0 || row.score > 1) {
      throw new Error(`Model returned invalid semantic score for ${row.occupationId}.`);
    }
    if (typeof row.rationale !== "string" || !row.rationale.trim()) {
      throw new Error(`Model returned missing rationale for ${row.occupationId}.`);
    }
    seen.add(row.occupationId);
  }
  for (const id of candidateIds) {
    if (!seen.has(id)) throw new Error(`Model omitted semantic score for ${id}.`);
  }
  return result;
}

async function modelHealth() {
  const config = getAiConfig();
  if (config.provider === "ollama") {
    const response = await fetchWithTimeout(`${config.baseUrl}/api/tags`, {}, config.timeoutMs);
    if (!response.ok) throw new Error(`Ollama health check failed (${response.status}).`);
    const data = await response.json();
    const modelNames = (data.models || []).map((model) => model.name);
    const exactOrFamilyMatch = modelNames.some(
      (name) => name === config.model || name.startsWith(`${config.model}:`),
    );
    if (modelNames.length && !exactOrFamilyMatch) {
      throw new Error(
        `Ollama is reachable, but model "${config.model}" was not found. Installed: ${modelNames.join(", ")}`,
      );
    }
    return { ok: true, provider: config.provider, model: config.model, baseUrl: config.baseUrl };
  }

  if (config.provider === "openai") {
    if (!config.apiKey) throw new Error("Missing API key for OpenAI-compatible provider.");
    return { ok: true, provider: config.provider, model: config.model, baseUrl: config.baseUrl };
  }

  if (config.provider === "groq") {
    if (!config.apiKey) throw new Error("Missing GROQ_API_KEY or LLM_API_KEY for Groq provider.");
    const response = await fetchWithTimeout(
      `${config.baseUrl}/models`,
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      },
      config.timeoutMs,
    );
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Groq health check failed (${response.status}): ${detail}`);
    }
    const data = await response.json();
    const modelIds = (data.data || []).map((model) => model.id);
    if (!modelIds.includes(config.model)) {
      throw new Error(
        `Groq is reachable, but model "${config.model}" was not found. Available Qwen models: ${modelIds
          .filter((id) => id.toLowerCase().includes("qwen"))
          .join(", ") || "none"}`,
      );
    }
    return { ok: true, provider: config.provider, model: config.model, baseUrl: config.baseUrl };
  }

  if (config.provider === "google") {
    if (!config.apiKey) throw new Error("Missing API key for Google AI Studio provider.");
    const response = await fetchWithTimeout(
      `${config.baseUrl}/v1beta/models/${encodeURIComponent(config.model)}`,
      {
        headers: {
          "x-goog-api-key": config.apiKey,
        },
      },
      config.timeoutMs,
    );
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Google AI Studio health check failed (${response.status}): ${detail}`);
    }
    return { ok: true, provider: config.provider, model: config.model, baseUrl: config.baseUrl };
  }

  throw new Error(`Unsupported LLM_PROVIDER: ${config.provider}`);
}

function dishaAiPlugin() {
  const handler = async (req, res, next) => {
    const url = new URL(req.url || "/", "http://localhost");
    if (!url.pathname.startsWith("/api/ai")) {
      next();
      return;
    }

    try {
      if (req.method === "GET" && url.pathname === "/api/ai/health") {
        sendJson(res, 200, await modelHealth());
        return;
      }

      if (req.method !== "POST") {
        sendJson(res, 405, { error: "Method not allowed." });
        return;
      }

      const payload = await readRequestBody(req);

      if (url.pathname === "/api/ai/extract") {
        const text = await generateWithModel({
          json: true,
          maxTokens: 900,
          payload,
          system:
            "You extract a DISHA learner profile from English, Tamil, or mixed text. Return only JSON with fields: name, region, education, stream, year, targetOccupation, wageExpectationMonthly, language, credentials array of strings, skills array of strings, constraints array of strings, missingFields array of strings, confidence number 0..1. Do not invent verified credentials; if uncertain, lower confidence and put the gap in missingFields.",
        });
        sendJson(res, 200, validateExtractedProfile(parseJsonFromModel(text)));
        return;
      }

      if (url.pathname === "/api/ai/semantic") {
        const candidateIds = (payload.candidates || []).map((candidate) => candidate.id);
        const text = await generateWithModel({
          json: true,
          maxTokens: 1300,
          payload,
          system:
            "You score semantic career fit for DISHA. Use only candidate IDs provided and consider the supplied role requirements, academic credit records, credentials, and skills. Return JSON: {\"scores\":[{\"occupationId\":\"...\",\"score\":0.0,\"rationale\":\"short evidence\"}]}. Score 1 means the learner profile strongly fits the occupation; 0 means poor fit. Include every candidate exactly once.",
        });
        sendJson(res, 200, validateSemanticScores(parseJsonFromModel(text), candidateIds));
        return;
      }

      if (url.pathname === "/api/ai/explain") {
        const text = await generateWithModel({
          json: false,
          maxTokens: 700,
          payload,
          system:
            "You write a grounded DISHA recommendation explanation for a learner or counselor. Use only the facts in the input, including academic credits, matched requirements, missing requirements, and recommended public courses when present. Do not mention courses, jobs, URLs, pay, or crowding values that are not present. If the requested language is Tamil, write in simple Tamil; otherwise write in plain English. Keep it under 150 words.",
        });
        if (!text.trim()) throw new Error("Model returned an empty explanation.");
        sendJson(res, 200, { explanation: text.trim() });
        return;
      }

      sendJson(res, 404, { error: "Unknown AI endpoint." });
    } catch (error) {
      sendJson(res, 503, {
        error: error.message,
        provider: getAiConfig().provider,
        model: getAiConfig().model,
      });
    }
  };

  return {
    name: "disha-ai-middleware",
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
  return {
    base: "./",
    cacheDir: ".vite",
    preview: {
      allowedHosts: ["disha-sahai.onrender.com"],
    },
    plugins: [react(), dishaAiPlugin()],
  };
});
