import { AssistantTask } from "@/lib/dummy-data";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const NVIDIA_API_BASE_URL =
  process.env.NVIDIA_API_BASE_URL ?? "https://integrate.api.nvidia.com/v1";

const MODEL_BY_TASK: Record<AssistantTask, string> = {
  general:
    process.env.NVIDIA_MODEL_GENERAL ??
    "nvidia/llama-3.3-nemotron-super-49b-v1.5",
  triage:
    process.env.NVIDIA_MODEL_TRIAGE ??
    "nvidia/llama-3.3-nemotron-super-49b-v1.5",
  scheduling:
    process.env.NVIDIA_MODEL_SCHEDULING ??
    "nvidia/llama-3.3-nemotron-super-49b-v1.5",
  summary:
    process.env.NVIDIA_MODEL_SUMMARY ??
    "nvidia/llama-3.3-nemotron-super-49b-v1.5"
};

const SAFETY_MODEL =
  process.env.NVIDIA_MODEL_SAFETY ??
  "nvidia/nemotron-content-safety-reasoning-4b";

export function getModelForTask(task: AssistantTask) {
  return MODEL_BY_TASK[task] ?? MODEL_BY_TASK.general;
}

export function nvidiaKeyConfigured() {
  const key = process.env.NVIDIA_API_KEY;
  return Boolean(
    key &&
      !key.includes("replace_with_your_real") &&
      !key.includes("your_nvidia_api_key_here")
  );
}

function buildSystemPrompt(task: AssistantTask) {
  const shared =
    "You are MediDesk AI, a precise clinic operations assistant for a 4-doctor Pakistani clinic. Keep responses concise, practical, medically administrative, and safe. Use PKR currency, DD/MM/YYYY dates, and 12-hour times. Do not invent diagnoses. If information is missing, say what staff should confirm. You may recommend a suitable doctor based on symptoms, suggest only low-cost or simple pre-visit tests that could save time, give arrival instructions, and help book appointments, but always make it clear the doctor must confirm the final clinical plan.";

  switch (task) {
    case "triage":
      return `${shared} Focus on urgency detection, queue routing, doctor preference by symptoms, and front-desk escalation. Provide a short recommended next step.`;
    case "scheduling":
      return `${shared} Focus on appointment booking, doctor availability, symptom-based doctor matching, patient instructions, and low-cost pre-visit test suggestions.`;
    case "summary":
      return `${shared} Focus on summarizing records into doctor-ready briefings with bullet-style clarity.`;
    default:
      return `${shared} Help with reception, billing drafts, appointment requests, and operational questions.`;
  }
}

export async function runSafetyCheck(message: string) {
  if (process.env.NVIDIA_ENABLE_SAFETY !== "true" || !nvidiaKeyConfigured()) {
    return { blocked: false };
  }

  let response: Response;

  try {
    response = await fetch(`${NVIDIA_API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: SAFETY_MODEL,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "Classify whether the user message is unsafe or disallowed for a clinic operations assistant. Reply with SAFE or BLOCK and a one-line reason."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });
  } catch {
    return {
      blocked: false,
      reason: "Safety check skipped because the NVIDIA API could not be reached from this environment."
    };
  }

  if (!response.ok) {
    return { blocked: false };
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content ?? "";
  return {
    blocked: content.toUpperCase().includes("BLOCK"),
    reason: content
  };
}

export async function runNvidiaChat(task: AssistantTask, messages: ChatMessage[]) {
  if (!nvidiaKeyConfigured()) {
    return {
      model: "demo-local-assistant",
      content: buildLocalFallbackReply(task, messages)
    };
  }

  let response: Response;

  try {
    response = await fetch(`${NVIDIA_API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: getModelForTask(task),
        stream: false,
        temperature: task === "summary" ? 0.2 : 0.6,
        top_p: 0.95,
        max_tokens: 700,
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(task)
          },
          ...messages
        ]
      })
    });
  } catch {
    throw new Error(
      "Unable to reach the NVIDIA API from this environment. Check outbound network access and NVIDIA_API_BASE_URL."
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API request failed: ${response.status} ${errorText}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return {
    model: getModelForTask(task),
    content:
      payload.choices?.[0]?.message?.content ??
      "The NVIDIA model returned an empty response."
  };
}

function buildLocalFallbackReply(task: AssistantTask, messages: ChatMessage[]) {
  const latestUserMessage =
    [...messages].reverse().find((message) => message.role === "user")?.content ??
    "";

  switch (task) {
    case "scheduling":
      return [
        "Demo scheduling reply:",
        "1. Offer the next open slot after 12:30 PM.",
        "2. Match the patient to the most suitable doctor from the listed symptoms.",
        "3. Suggest only simple tests that may save time before the visit.",
        "4. Confirm the doctor and token at the front desk.",
        latestUserMessage
          ? `Requested task: ${latestUserMessage}`
          : "No specific scheduling message was provided."
      ].join("\n");
    case "summary":
      return [
        "Demo summary reply:",
        "Patient is ready for a short doctor handoff.",
        "Keep the note focused on visit reason, current status, and any pending bill.",
        latestUserMessage
          ? `Summary request noted: ${latestUserMessage}`
          : "No patient-specific prompt was provided."
      ].join("\n");
    case "triage":
      return [
        "Demo triage reply:",
        "Move urgent fever, dizziness, chest pain, or breathing concerns to the top of the queue.",
        "Prefer the emergency doctor for severe symptoms and keep reception notes short and visible.",
        latestUserMessage
          ? `Triage note captured: ${latestUserMessage}`
          : "No triage prompt was provided."
      ].join("\n");
    default:
      return [
        "Demo assistant reply:",
        "This environment is using the built-in fallback because the NVIDIA API key is missing or unavailable.",
        "You can still test patient entry, appointment booking, billing, doctor recommendation, and test-planning prompts in the UI.",
        latestUserMessage
          ? `Latest request: ${latestUserMessage}`
          : "Ask about billing, scheduling, or a patient summary."
      ].join("\n");
  }
}
