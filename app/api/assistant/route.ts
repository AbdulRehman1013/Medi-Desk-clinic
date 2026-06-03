import { NextResponse } from "next/server";
import { AssistantTask } from "@/lib/dummy-data";
import { getModelForTask, runNvidiaChat, runSafetyCheck } from "@/lib/nvidia";

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      task?: AssistantTask;
      messages?: IncomingMessage[];
    };

    const task = body.task ?? "general";
    const messages = body.messages ?? [];

    if (!messages.length) {
      return NextResponse.json(
        { error: "At least one message is required." },
        { status: 400 }
      );
    }

    const latestUserMessage = [...messages].reverse().find(
      (message) => message.role === "user"
    );

    if (latestUserMessage) {
      const safety = await runSafetyCheck(latestUserMessage.content);
      if (safety.blocked) {
        return NextResponse.json({
          reply:
            "I cannot help with that request. Please rephrase it as a safe clinic operations question.",
          model: getModelForTask(task),
          safety: safety.reason
        });
      }
    }

    const completion = await runNvidiaChat(task, messages);

    return NextResponse.json({
      reply: completion.content,
      model: completion.model
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown NVIDIA API error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
