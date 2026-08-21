import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendChatMessage } from "@/utils/api";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
}

const CHAT_KEY = "moviemind_chat";

const WELCOME: Message = {
  id: 0,
  text: "Hey there! I'm MovieMind AI. I know 8,000+ movies. Ask me anything — mood, genre, actor, or just say hi!",
  sender: "bot",
};

function loadMessages(): Message[] {
  try {
    const s = localStorage.getItem(CHAT_KEY);
    if (s) {
      const arr = JSON.parse(s);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  } catch {}
  return [WELCOME];
}

function formatResponse(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^  \d+\.\s/gm, "  ");
}

function parseSuggestions(text: string): string[] {
  const lower = text.toLowerCase();
  if (lower.includes("horror") || lower.includes("scary")) return ["Tell me about the first one", "Something less scary"];
  if (lower.includes("comedy") || lower.includes("funny")) return ["Darker comedies", "Romantic comedies"];
  if (lower.includes("action")) return ["More intense action", "Action-comedy blends"];
  if (lower.includes("similar") || lower.includes("like")) return ["More like this", "Tell me about the director"];
  if (lower.includes("rated") || lower.includes("best")) return ["Hidden gems", "Best from this year"];
  return ["Recommend another movie", "Tell me about a classic"];
}

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save messages to localStorage
  useEffect(() => {
    try { localStorage.setItem(CHAT_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  // Auto-scroll with MutationObserver
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scroll = () => {
      el.scrollTop = el.scrollHeight;
    };

    // Initial scroll
    scroll();

    // Watch for any DOM changes inside the scroll container
    const observer = new MutationObserver(() => {
      scroll();
    });
    observer.observe(el, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now(), text: text.trim(), sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setSuggestions([]);

    try {
      const history = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await sendChatMessage(text.trim(), history);
      const botMsg: Message = {
        id: Date.now() + 1,
        text: formatResponse(res.response),
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);
      setSuggestions(parseSuggestions(botMsg.text));
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        text: "Sorry, something went wrong. Try again.",
        sender: "bot",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed z-50 bg-zinc-900 border border-zinc-700/50 shadow-2xl rounded-2xl flex flex-col overflow-hidden"
          style={{ bottom: "6rem", right: "1rem", width: "20rem", height: "32rem" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">MovieMind AI</span>
                <p className="text-[10px] text-zinc-500">8,000+ movies</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line",
                    msg.sender === "user"
                      ? "bg-purple-600 text-white rounded-br-md"
                      : "bg-zinc-800 text-zinc-200 rounded-bl-md"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestion chips */}
          {suggestions.length > 0 && !isLoading && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  disabled={isLoading}
                  className="rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-[10px] text-zinc-400 hover:text-purple-300 hover:border-purple-500/40 transition-all disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about movies..."
                disabled={isLoading}
                className="flex-1 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full transition-all",
          "bg-gradient-to-r from-purple-600 to-blue-600 text-white",
          "shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-110 active:scale-95"
        )}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </>
  );
}
