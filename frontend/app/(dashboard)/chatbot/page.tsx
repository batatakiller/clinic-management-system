"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { apiFetch } from "@/lib/api";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Heart,
  AlertCircle,
  MessageSquare,
  Loader2,
  Copy,
  Check,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  X,
  Lightbulb,
  Stethoscope,
  Pill,
  Activity,
  Shield,
  MessageCircle,
  RotateCcw,
  Zap,
  RefreshCw,
  Info,
  ArrowLeft,
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  feedback?: "up" | "down";
}

interface Suggestion {
  id: string;
  text: string;
  icon: React.ReactNode;
  category: string;
}

const suggestions: Suggestion[] = [
  {
    id: "1",
    text: "What are common cold symptoms?",
    icon: <Stethoscope className="w-4 h-4" />,
    category: "Symptoms",
  },
  {
    id: "2",
    text: "How can I improve my sleep quality?",
    icon: <Activity className="w-4 h-4" />,
    category: "Wellness",
  },
  {
    id: "3",
    text: "What's a balanced healthy diet?",
    icon: <Lightbulb className="w-4 h-4" />,
    category: "Nutrition",
  },
  {
    id: "4",
    text: "How much water should I drink daily?",
    icon: <Shield className="w-4 h-4" />,
    category: "Health",
  },
  {
    id: "5",
    text: "Explain common medication side effects",
    icon: <Pill className="w-4 h-4" />,
    category: "Medication",
  },
  {
    id: "6",
    text: "When should I see a doctor for headaches?",
    icon: <Stethoscope className="w-4 h-4" />,
    category: "Symptoms",
  },
];

const quickActions = [
  {
    icon: <Stethoscope className="w-4 h-4" />,
    label: "Check Symptoms",
    color: "from-blue-500 to-cyan-500",
    hoverColor: "hover:from-blue-600 hover:to-cyan-600",
  },
  {
    icon: <Pill className="w-4 h-4" />,
    label: "Medication Info",
    color: "from-purple-500 to-pink-500",
    hoverColor: "hover:from-purple-600 hover:to-pink-600",
  },
  {
    icon: <Activity className="w-4 h-4" />,
    label: "Health Tips",
    color: "from-green-500 to-emerald-500",
    hoverColor: "hover:from-green-600 hover:to-emerald-600",
  },
  {
    icon: <Shield className="w-4 h-4" />,
    label: "Prevention",
    color: "from-orange-500 to-amber-500",
    hoverColor: "hover:from-orange-600 hover:to-amber-600",
  },
];

export default function ChatbotPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 500;

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      // Load history from localStorage
      const savedHistory = localStorage.getItem(`chatbot_messages_${user._id}`);
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          // Restore Date objects
          const restoredMessages = parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(restoredMessages);
          if (restoredMessages.length > 0) setShowSuggestions(false);
        } catch (e) {
          console.error("Failed to parse chat history:", e);
        }
      }
    }
  }, [user, router]);

  // Save history to localStorage whenever messages change
  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`chatbot_messages_${user._id}`, JSON.stringify(messages));
    } else if (user && messages.length === 0) {
      localStorage.removeItem(`chatbot_messages_${user._id}`);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, user]);

  const sendMessage = async (messageText?: string) => {
    const textToUse = messageText ?? input;
    if (!textToUse.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: textToUse,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setCharCount(0);
    setLoading(true);
    setError("");
    setShowSuggestions(false);

    try {
      const data = await apiFetch("/api/chatbot/message", {
        method: "POST",
        body: JSON.stringify({ message: textToUse }),
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.data?.aiResponse || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage = err?.message || "Something went wrong. Please try again.";
      setError(errorMessage);
      const errorAIMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `⚠️ ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorAIMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setInput(value);
      setCharCount(value.length);
    }
  };

  const copyMessage = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    setError("");
  };

  const giveFeedback = (messageId: string, feedback: "up" | "down") => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, feedback: msg.feedback === feedback ? undefined : feedback }
          : msg,
      ),
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl blur-lg opacity-50 animate-ping" />
          </div>
          <p className="text-gray-600 font-medium mt-4">Loading your AI assistant...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-md"
      >
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 border border-gray-100 shadow-sm bg-white"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>

              <div className="flex items-center space-x-3">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="relative"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"
                  />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <span>Healthcare AI Assistant</span>
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                  </h1>
                  <p className="text-sm text-gray-500 flex items-center space-x-1">
                    <Heart className="w-3 h-3 text-red-500" />
                    <span>Always here to help with your health questions</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {messages.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearChat}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors text-sm font-medium border border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear Chat</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-center h-full min-h-[400px]"
              >
                <div className="text-center max-w-2xl w-full">
                  {/* Animated Bot Avatar */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.7 }}
                    className="relative w-28 h-28 mx-auto mb-6"
                  >
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                      <Bot className="w-16 h-16 text-white" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-4 border-2 border-dashed border-blue-300 rounded-3xl opacity-50"
                    />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
                    Welcome!
                  </h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    I'm your personal healthcare AI assistant. Ask me anything about health, symptoms, medications, or wellness.
                  </p>

                  {/* Quick Action Pills */}
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={action.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => sendMessage(`Tell me about ${action.label.toLowerCase()}`)}
                        className={`flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r ${action.color} ${action.hoverColor} text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all`}
                      >
                        {action.icon}
                        <span>{action.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Suggestions Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={suggestion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => sendMessage(suggestion.text)}
                        className="flex items-start space-x-3 p-4 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 border border-gray-200 hover:border-blue-300 rounded-2xl transition-all shadow-sm hover:shadow-md text-left group"
                      >
                        <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                          {suggestion.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 mb-0.5">
                            {suggestion.category}
                          </p>
                          <p className="text-sm text-gray-700 font-medium line-clamp-2">
                            {suggestion.text}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-end space-x-2 max-w-[85%] md:max-w-[75%] ${msg.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                  >
                    {/* Avatar */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-md ${msg.type === "user"
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                        : "bg-gradient-to-br from-blue-500 to-indigo-600"
                        }`}
                    >
                      {msg.type === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </motion.div>

                    {/* Message Bubble */}
                    <div className="group relative">
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-md ${msg.type === "user"
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-md"
                          : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
                          }`}
                      >
                        {msg.type === "ai" ? (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => (
                                  <p className="text-sm leading-relaxed mb-2 last:mb-0">
                                    {children}
                                  </p>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold">{children}</strong>
                                ),
                                ul: ({ children }) => (
                                  <ul className="text-sm list-disc list-inside space-y-1 my-2">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="text-sm list-decimal list-inside space-y-1 my-2">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="leading-relaxed">{children}</li>
                                ),
                                h1: ({ children }) => (
                                  <h1 className="text-base font-bold mb-2">{children}</h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-sm font-bold mb-2">{children}</h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-sm font-semibold mb-1">{children}</h3>
                                ),
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <p
                            className={`text-xs ${msg.type === "user" ? "text-indigo-100" : "text-gray-400"
                              }`}
                          >
                            {msg.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {msg.type === "ai" && (
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => giveFeedback(msg.id, "up")}
                                className={`p-1 rounded hover:bg-green-100 transition-colors ${msg.feedback === "up" ? "text-green-600 bg-green-50" : "text-gray-400"
                                  }`}
                                title="Helpful"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => giveFeedback(msg.id, "down")}
                                className={`p-1 rounded hover:bg-red-100 transition-colors ${msg.feedback === "down" ? "text-red-600 bg-red-50" : "text-gray-400"
                                  }`}
                                title="Not helpful"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => copyMessage(msg.content, msg.id)}
                                className="p-1 rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Copy message"
                              >
                                {copiedId === msg.id ? (
                                  <Check className="w-3.5 h-3.5 text-green-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading Indicator */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex justify-start"
                >
                  <div className="flex items-end space-x-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-md">
                      <div className="flex space-x-1.5">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 bg-blue-500 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-indigo-500 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 bg-purple-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex justify-center"
                >
                  <div className="flex items-center space-x-2 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Error</p>
                      <p className="text-xs">{error}</p>
                    </div>
                    <button
                      onClick={() => setError("")}
                      className="ml-2 p-1 hover:bg-red-100 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <motion.footer
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-xl border-t border-gray-200/50 shadow-lg"
      >
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your health question here..."
                disabled={loading}
                className="w-full px-4 py-3.5 pr-12 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-gray-800 placeholder-gray-400"
              />
              <MessageCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {charCount > 0 && (
                <div
                  className={`absolute -top-6 right-0 text-xs font-medium ${charCount > MAX_CHARS * 0.9 ? "text-red-500" : "text-gray-400"
                    }`}
                >
                  {charCount}/{MAX_CHARS}
                </div>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl font-medium transition-all shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-500 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span>AI-powered health assistant • Responses are informational only</span>
            </p>
            <button
              onClick={() => sendMessage("Can you explain that in simpler terms?")}
              className="flex items-center space-x-1 text-xs text-blue-600 hover:underline font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Simplify</span>
            </button>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
