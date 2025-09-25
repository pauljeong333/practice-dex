import * as Dialog from "@radix-ui/react-dialog";

import { useSelector } from "react-redux";
import { RootState } from "../../types/redux";

interface FinishSessionModalProps {
  open: boolean;
  onClose: (bool: boolean) => void;
  onConfirm: () => void;
}

export default function FinishSessionModal({
  open,
  onClose,
  onConfirm,
}: FinishSessionModalProps) {
  const { loading } = useSelector((state: RootState) => state.Session);

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
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
          className="
            fixed left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2
            rounded-2xl bg-white p-6 shadow-lg
            data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-90
          data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-90
          transition-all duration-300"
        >
          {/* Header */}
          <Dialog.Title className="text-lg font-semibold text-center">
            Finish this session?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-500 text-center">
            Are you sure you’re ready to finish? You won’t be able to change
            anything once you confirm.
          </Dialog.Description>

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            {/* Cancel */}
            <button
              onClick={() => onClose(false)}
              className="
                flex-1 px-4 py-2 rounded-lg border border-gray-300 
                text-gray-700 hover:bg-gray-100 transition
              "
            >
              Cancel
            </button>

            {/* Confirm Finish */}
            <button
              onClick={onConfirm}
              disabled={loading}
              className="
                flex-1 px-4 py-2 rounded-lg transition
                bg-green-600 text-white hover:bg-green-700
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600
              "
            >
              {loading ? "Finishing..." : "Finish"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
