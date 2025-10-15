import { useState, useRef, useEffect } from "react";
import { X, Loader2, Send, MessageCircle } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useDispatch, useSelector } from "react-redux";
import { resetChat, sendChatRequest } from "../../redux/coach/actions";
import { RootState } from "../../types/redux";
import { INSTRUMENTS } from "../../library/instruments";
import { AIButton } from "./AIButton";
import ReactMarkdown from "react-markdown";

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
  const [newChat, setNewChat] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messagesScrollable, setMessagesScrollable] = useState(false);
  const [textareaScrollable, setTextareaScrollable] = useState(false);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // Update whether messages container is scrollable
    const container = messagesContainerRef.current;
    if (container) {
      setMessagesScrollable(container.scrollHeight > container.clientHeight);
    }
  }, [messages]);

  // Reset modal state when opened/closed
  useEffect(() => {
    if (!open) {
      dispatch(resetChat());
      setStep("select");
      setInstrument("");
      setInput("");
      setSessionUpdated(true);
      setNewChat(true);
    }
  }, [dispatch, open]);

  const handleSend = () => {
    if (!input.trim() || !instrument) return;

    dispatch(
      sendChatRequest({
        uid,
        instrument,
        idToken: token,
        userMessage: input,
        sessionUpdated,
        newChat,
      })
    );

    setInput("");
    if (sessionUpdated) setSessionUpdated(false);
    if (newChat) setNewChat(false);
  };

  const handleStartChat = () => {
    if (!instrument) return;
    setStep("chat");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = inputRef.current.scrollHeight + "px";
      // update whether textarea is actually scrollable
      setTextareaScrollable(
        inputRef.current.scrollHeight >
          parseInt(getComputedStyle(inputRef.current).maxHeight || "150")
      );
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <AIButton size="large">
          <MessageCircle size={20} />
          PracticeCoach
        </AIButton>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-3xl h-[80vh] -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 shadow-lg flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 z-10 relative">
            <div className="flex items-center gap-2">
              <Dialog.Title className="text-lg font-semibold">
                PracticeCoach
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
              className={`absolute inset-0 flex flex-col items-center justify-center transition-transform duration-500 ${
                step === "select"
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-full opacity-0 pointer-events-none"
              }`}
            >
              <div className="w-full max-w-sm text-center">
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  Select Your Instrument
                </label>

                <select
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base mb-6 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
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
                  size="large"
                  className="w-full"
                >
                  Start Chat
                </AIButton>
              </div>
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
              <div
                ref={messagesContainerRef}
                className={`flex-1 overflow-y-auto border rounded-lg p-3 space-y-3 bg-gray-50 chat-scroll ${
                  messagesScrollable ? "is-scrollable" : ""
                }`}
              >
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
                          ? "bg-purple-500 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                      {msg.pending && (
                        <div className="flex justify-center mt-1">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        </div>
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
              <div className="mt-4 flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none resize-none overflow-y-auto transition-[height] duration-200 ease-out leading-relaxed min-h-[40px] max-h-[150px] chat-scroll ${
                    textareaScrollable ? "is-scrollable" : ""
                  }`}
                  placeholder="Ask your AI Coach..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center"
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
