import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, X, Send, MessageCircle, Star, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendChatMessage, Movie } from "@/utils/api";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  suggestedMovies?: Movie[];
}

const CHAT_KEY = "moviemind_chat_v2";

const INITIAL_SUGGESTIONS = [
  "Yes, recommend a movie!",
  "I'm feeling happy 😊",
  "I'm feeling down 🌧️",
  "Mind-bending Sci-Fi 🌌",
  "Christopher Nolan films 🎬"
];

const WELCOME: Message = {
  id: 0,
  text: "Hey there! I'm MovieMind AI, your personal cinema companion. Ask me anything — tell me your mood, favorite genres, actors, directors, or simply say hi!",
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

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Auto-scroll with MutationObserver
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scroll = () => {
      el.scrollTop = el.scrollHeight;
    };

    scroll();

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

    try {
      const history = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await sendChatMessage(text.trim(), history);
      const botMsg: Message = {
        id: Date.now() + 1,
        text: res.reply || res.response,
        sender: "bot",
        suggestedMovies: res.suggested_movies,
      };
      setMessages((prev) => [...prev, botMsg]);

      if (res.quick_actions && res.quick_actions.length > 0) {
        setSuggestions(res.quick_actions);
      } else {
        setSuggestions([
          "Yes, more like these!",
          "No, try a different mood",
          "Where to stream?",
          "Take the taste quiz"
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "I ran into a temporary hiccup. Let's try again — what kind of movie or mood are you in for?",
          sender: "bot",
        },
      ]);
      setSuggestions(INITIAL_SUGGESTIONS);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render bold markdown cleanly with highlights
  const renderMessageContent = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-purple-300">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed z-50 bg-zinc-900 border border-zinc-700/60 shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300"
          style={{ bottom: "5.5rem", right: "1rem", width: "22rem", maxWidth: "calc(100vw - 2rem)", height: "34rem", maxHeight: "calc(100vh - 7rem)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/80 border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-600/30">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white">MovieMind AI</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] text-zinc-400">Your Empathetic Cinema Companion</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3.5"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex flex-col", msg.sender === "user" ? "items-end" : "items-start")}
              >
                <div
                  className={cn(
                    "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line shadow-sm",
                    msg.sender === "user"
                      ? "bg-purple-600 text-white rounded-br-xs font-medium"
                      : "bg-zinc-800/90 text-zinc-200 border border-zinc-700/50 rounded-bl-xs"
                  )}
                >
                  {renderMessageContent(msg.text)}
                </div>

                {/* Suggested movie cards preview inside chat */}
                {msg.suggestedMovies && msg.suggestedMovies.length > 0 && (
                  <div className="mt-2.5 space-y-1.5 w-full max-w-[90%]">
                    {msg.suggestedMovies.slice(0, 3).map((m) => (
                      <Link
                        key={m.id}
                        to={`/movie/${m.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-950/70 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/40 transition-all group"
                      >
                        {m.poster ? (
                          <img
                            src={m.poster}
                            alt={m.title}
                            referrerPolicy="no-referrer"
                            className="w-9 h-12 rounded object-cover shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-9 h-12 rounded bg-zinc-800 flex items-center justify-center shrink-0">
                            <Film className="w-4 h-4 text-zinc-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-white group-hover:text-purple-300 truncate">
                            {m.title}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                            <span>{m.year}</span>
                            <span>•</span>
                            <div className="flex items-center gap-0.5 text-amber-400">
                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                              <span>{m.rating}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-2xl rounded-bl-xs px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick action chips */}
          {suggestions.length > 0 && !isLoading && (
            <div className="px-3 pb-2 pt-1 border-t border-zinc-800/60 bg-zinc-950/40 flex flex-wrap gap-1.5 shrink-0 max-h-24 overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  disabled={isLoading}
                  className="rounded-full bg-zinc-800/90 border border-zinc-700/80 px-2.5 py-1 text-[11px] text-zinc-300 hover:text-purple-300 hover:border-purple-500/50 hover:bg-zinc-800 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-zinc-950/80 border-t border-zinc-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about movies, mood, actors..."
                disabled={isLoading}
                className="flex-1 rounded-xl bg-zinc-800/90 border border-zinc-700 text-white placeholder:text-zinc-500 px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full transition-all cursor-pointer",
          "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
          "shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-105 active:scale-95"
        )}
        aria-label="Open AI Movie Chat"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </>
  );
}

