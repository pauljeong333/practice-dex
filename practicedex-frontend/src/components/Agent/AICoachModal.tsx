import { useState, useRef, useEffect } from "react";
import { X, Loader2, Send, MessageCircle, ArrowLeft } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useDispatch, useSelector } from "react-redux";
import { sendChatRequest } from "../../redux/coach/actions";
import { RootState } from "../../types/redux";
import { INSTRUMENTS } from "../../library/instruments";
import { AIButton } from "./AIButton";

interface Message {
  sender: "user" | "coach";
  text: string;
  pending?: boolean;
  error?: boolean;
}

export default function AICoachModal() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((s: RootState) => s.Auth);
  const { messages, loading, error } = useSelector((s: RootState) => s.Coach);
  const uid = user?.uid;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [instrument, setInstrument] = useState("");
  const [step, setStep] = useState<"select" | "chat">("select");
  const [sessionUpdated, setSessionUpdated] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log("messsages:", messages);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset modal state when opened/closed
  useEffect(() => {
    if (!open) {
      setStep("select");
      setInstrument("");
      setInput("");
      setSessionUpdated(true);
    }
  }, [open]);

  const handleSend = () => {
    if (!input.trim() || !instrument) return;

    dispatch(
      sendChatRequest({
        uid,
        instrument,
        idToken: token,
        userMessage: input,
        sessionUpdated,
      })
    );

    setInput("");
    if (sessionUpdated) setSessionUpdated(false);
  };

  const handleStartChat = () => {
    if (!instrument) return;
    setStep("chat");
  };

  const handleBack = () => {
    setStep("select");
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <AIButton size="large">
          <MessageCircle size={20} />
          AI Coach
        </AIButton>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-md h-[80vh] -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 shadow-lg flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 z-10 relative">
            <div className="flex items-center gap-2">
              {step === "chat" && (
                <button
                  onClick={handleBack}
                  className="text-gray-600 hover:text-gray-800 transition"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <Dialog.Title className="text-lg font-semibold">
                AI Coach
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-gray-700">
                <X />
              </button>
            </Dialog.Close>
          </div>

          {/* Sliding Panels Container */}
          <div className="relative flex-1 overflow-hidden">
            {/* Step 1: Instrument Selection */}
            <div
              className={`absolute inset-0 p-6 flex flex-col items-center justify-center transition-transform duration-500 ${
                step === "select"
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-full opacity-0 pointer-events-none"
              }`}
            >
              <label className="text-sm font-medium text-gray-700 mb-2">
                Select your instrument
              </label>
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="border rounded-lg px-4 py-2 w-3/4 mb-4 focus:ring-purple-500"
              >
                <option value="">-- Choose an instrument --</option>
                {INSTRUMENTS.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>

              <AIButton
                onClick={handleStartChat}
                disabled={!instrument}
                hoverEffect={true}
                size="medium"
              >
                Start Chat
              </AIButton>
            </div>

            {/* Step 2: Chat Interface */}
            <div
              className={`absolute inset-0 p-6 flex flex-col transition-transform duration-500 ${
                step === "chat"
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0 pointer-events-none"
              }`}
            >
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto border rounded-lg p-3 space-y-3 bg-gray-50">
                {messages.map((msg: Message, idx: number) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {msg.text}
                      {msg.pending && (
                        <Loader2 className="inline ml-2 h-3 w-3 animate-spin text-white/70" />
                      )}
                      {msg.error && (
                        <span className="ml-2 text-xs text-red-500">
                          (failed)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
                  placeholder="Ask your AI Coach..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>

              {error && (
                <div className="text-xs text-red-500 mt-2 text-center">
                  {error}
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
