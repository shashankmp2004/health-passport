"use client";

import { useMemo, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChatMessage = {
  role: "user" | "model";
  text: string;
};

type AIChatbotProps = {
  portalLabel: string;
};

export function AIChatbot({ portalLabel }: AIChatbotProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => `AI Assistant - ${portalLabel}`, [portalLabel]);

  const onSend = async () => {
    const message = input.trim();
    if (!message || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", text: message }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history: messages.slice(-10),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Failed to fetch AI response");
      }

      const answer = result?.data?.answer || "I could not generate a response.";
      setMessages([...nextMessages, { role: "model", text: answer }]);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Something went wrong");
      setMessages(nextMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[80]">
        <Button
          type="button"
          className="h-14 px-4 border-4 border-black rounded-none bg-primary text-black hover:bg-white"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle AI chatbot"
        >
          {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
          <span className="font-black uppercase">AI Chat</span>
        </Button>
      </div>

      <section
        className={cn(
          "fixed bottom-24 right-6 z-[80] w-[92vw] max-w-md border-4 border-black bg-white shadow-brutal-lg transition-all",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none",
        )}
        aria-live="polite"
      >
        <header className="border-b-4 border-black bg-secondary px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 border-2 border-black bg-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black uppercase">{title}</p>
              <p className="text-xs font-bold">Ask portal-specific questions</p>
            </div>
          </div>
        </header>

        <div className="h-72 overflow-y-auto p-3 bg-grid-pattern bg-[length:24px_24px]">
          {messages.length === 0 ? (
            <div className="border-2 border-black bg-white p-3">
              <p className="text-sm font-bold">
                Try asking: "What was my last visit?", "How many patients are above 18?", or
                "Show high-risk records in my scope."
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    "max-w-[92%] border-2 border-black px-3 py-2 text-sm font-medium",
                    message.role === "user"
                      ? "ml-auto bg-primary text-black"
                      : "mr-auto bg-white text-black",
                  )}
                >
                  {message.text}
                </div>
              ))}
              {loading && (
                <div className="mr-auto inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-2 text-sm font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking...
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t-4 border-black p-3 bg-white">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your question..."
            className="min-h-[84px] border-2 border-black rounded-none"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
          />
          {error ? <p className="mt-2 text-xs font-bold text-destructive">{error}</p> : null}
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-gray-600">
              AI responses are informational and not medical advice.
            </p>
            <Button
              type="button"
              onClick={onSend}
              disabled={loading || !input.trim()}
              className="border-2 border-black"
            >
              <Send className="w-4 h-4" />
              Send
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
