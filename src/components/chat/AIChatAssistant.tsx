import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
}

const quickSuggestions = ["Like Inception?", "Best Sci-Fi", "Hidden Gems"];

const botResponses = [
  "Great taste! Based on your interest in mind-bending films, I'd recommend checking out 'Interstellar' and 'The Prestige'. Both share that same cerebral storytelling style.",
  "For sci-fi fans, I'd suggest 'Dune' for its epic world-building, or 'The Matrix' if you want something more action-packed. Both are absolute classics!",
  "Here are some hidden gems: 'Parasite' is a masterclass in genre-blending, 'Whiplash' will keep you on the edge of your seat, and 'Spirited Away' is pure animated magic.",
  "Looking for something recent? 'Dune' (2021) revitalized sci-fi cinema, while 'Joker' brought a fresh take on the comic book genre. Both are worth your time!",
];

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "Hi! I'm your AI movie assistant. Ask me anything!",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [responseIndex, setResponseIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      text: text.trim(),
      sender: "user",
    };

    const botMsg: Message = {
      id: Date.now() + 1,
      text: botResponses[responseIndex % botResponses.length],
      sender: "bot",
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setResponseIndex((i) => i + 1);
    setInput("");
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "fixed z-50 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 shadow-2xl flex flex-col",
              "bottom-24 right-4 w-80 h-96 rounded-2xl",
              "max-md:inset-x-2 max-md:bottom-2 max-md:w-auto max-md:h-[calc(100dvh-100px)] max-md:rounded-2xl"
            )}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-white">AI Assistant</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.sender === "user"
                        ? "bg-purple-600 text-white rounded-br-md"
                        : "bg-zinc-800 text-zinc-200 rounded-bl-md"
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {quickSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-[10px] text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="px-3 pb-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about movies..."
                  className="flex-1 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full",
          "bg-gradient-to-r from-purple-600 to-blue-600 text-white",
          "shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 transition-shadow"
        )}
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sparkles className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
