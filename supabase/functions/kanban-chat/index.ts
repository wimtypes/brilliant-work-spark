import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, tasks } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build context about current tasks
    const taskSummary = tasks && tasks.length > 0
      ? tasks.map((t: any) => `- [${t.status}] "${t.title}" (${t.category || 'No category'}${t.due_date ? `, due ${t.due_date}` : ''}${t.time_estimate ? `, est. ${t.time_estimate}` : ''})`).join('\n')
      : 'No tasks on the board yet.';

    const systemPrompt = `You are a helpful Kanban board AI assistant. You help users manage their tasks and provide productivity insights.

Current board state:
${taskSummary}

You can do two things:
1. **Create tasks**: When the user asks to add/create a task, use the create_task tool. Extract title, description, category (Design/Development/Marketing/Data/Media), due_date (YYYY-MM-DD format), time_estimate (e.g. "3h"), and status (todo or in_progress, default: todo).
2. **Productivity insights**: Analyze the board and give helpful summaries, suggestions, or answer questions about workload.

Keep responses concise, friendly, and actionable. Use markdown formatting.`;

    const body: any = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      stream: true,
      tools: [
        {
          type: "function",
          function: {
            name: "create_task",
            description: "Create a new task on the Kanban board",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Task title" },
                description: { type: "string", description: "Task description" },
                category: { type: "string", enum: ["Design", "Development", "Marketing", "Data", "Media"], description: "Task category" },
                due_date: { type: "string", description: "Due date in YYYY-MM-DD format" },
                time_estimate: { type: "string", description: "Time estimate like 2h, 5h" },
                status: { type: "string", enum: ["todo", "in_progress"], description: "Which column: todo or in_progress" },
              },
              required: ["title"],
              additionalProperties: false,
            },
          },
        },
      ],
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // We need to process the stream to handle tool calls
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let toolCallArgs = "";
    let toolCallName = "";
    let hasToolCall = false;
    let contentChunks: string[] = [];

    // Create a TransformStream to process and forward
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Process in background
    (async () => {
      let textBuffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);

            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") {
                // If there was a tool call, execute it and send result
                if (hasToolCall && toolCallName === "create_task") {
                  try {
                    const args = JSON.parse(toolCallArgs);
                    const taskData = {
                      title: args.title,
                      description: args.description || null,
                      category: args.category || null,
                      due_date: args.due_date || null,
                      time_estimate: args.time_estimate || null,
                      status: args.status || "todo",
                      position: 0,
                    };
                    const { error } = await supabase.from("tasks").insert(taskData);
                    const msg = error
                      ? `❌ Failed to create task: ${error.message}`
                      : `✅ Created task **"${args.title}"** in ${args.status === 'in_progress' ? 'In Progress' : 'To-Do'}${args.category ? ` (${args.category})` : ''}${args.due_date ? ` due ${args.due_date}` : ''}.`;

                    const chunk = `data: ${JSON.stringify({
                      choices: [{ delta: { content: msg }, index: 0 }],
                    })}\n\n`;
                    await writer.write(encoder.encode(chunk));
                  } catch (e) {
                    const chunk = `data: ${JSON.stringify({
                      choices: [{ delta: { content: `❌ Error creating task: ${e}` }, index: 0 }],
                    })}\n\n`;
                    await writer.write(encoder.encode(chunk));
                  }
                }
                await writer.write(encoder.encode("data: [DONE]\n\n"));
                break;
              }

              try {
                const parsed = JSON.parse(jsonStr);
                const delta = parsed.choices?.[0]?.delta;

                // Collect tool call data
                if (delta?.tool_calls) {
                  hasToolCall = true;
                  for (const tc of delta.tool_calls) {
                    if (tc.function?.name) toolCallName = tc.function.name;
                    if (tc.function?.arguments) toolCallArgs += tc.function.arguments;
                  }
                  continue; // Don't forward tool call chunks
                }

                // Forward content chunks
                if (delta?.content) {
                  await writer.write(encoder.encode(line + "\n"));
                }
              } catch {
                // Forward as-is
                await writer.write(encoder.encode(line + "\n"));
              }
            } else {
              // Forward non-data lines
              if (line.trim()) await writer.write(encoder.encode(line + "\n"));
            }
          }
        }
      } catch (e) {
        console.error("Stream processing error:", e);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("kanban-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
