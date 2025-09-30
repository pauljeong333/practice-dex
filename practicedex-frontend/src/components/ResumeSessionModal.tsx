import * as Dialog from "@radix-ui/react-dialog";
import { useSelector } from "react-redux";
import { RootState } from "../types/redux";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface StopSessionModalProps {
  open: boolean;
  onConfirm: () => void;
  onDiscard: () => void;
  onClose: (bool: boolean) => void;
}

export default function ResumeSessionModal({
  open,
  onConfirm,
  onDiscard,
  onClose,
}: StopSessionModalProps) {
  const { user } = useSelector((state: RootState) => state.User);
  const { loading } = useSelector((state: RootState) => state.Session);

  useEffect(() => {
    if (!user?.activeSession) {
      onClose(false);
    }
  }, [user?.activeSession, onClose]);

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          className="fixed inset-0 bg-black/50
        data-[state=open]:animate-in data-[state=open]:fade-in
        data-[state=closed]:animate-out data-[state=closed]:fade-out
        transition-opacity duration-300"
        />

        {/* Modal */}
        <Dialog.Content
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="
            fixed left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2
            rounded-2xl bg-white p-6 shadow-lg
            data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-90
          data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-90
          transition-all duration-300"
        >
          {/* Header */}
          <Dialog.Title className="text-lg font-semibold text-center">
            Would you like to resume your last session?
          </Dialog.Title>
          <Dialog.Description className="mt-3 px-5 text-sm text-gray-500 text-center">
            You have an unfinished practice session. Resuming will take you back
            to where you left off.
          </Dialog.Description>

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            {/* Cancel */}
            <button
              onClick={onDiscard}
              className="
                flex-1 px-4 py-2 rounded-lg transition
                bg-red-600 text-white hover:bg-red-700
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600
                flex items-center justify-center
              "
            >
              Discard Session
            </button>

            {/* Stop Session */}
            <button
              onClick={onConfirm}
              disabled={loading}
              className="
                flex-1 px-4 py-2 rounded-lg transition
                bg-green-600 text-white hover:bg-green-700
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600
                flex items-center justify-center
              "
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                </>
              ) : (
                "Resume"
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
