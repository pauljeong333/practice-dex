import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/redux";
import { useNavigate } from "react-router-dom";
import { startScheduledSessionRequest } from "../../redux/session/actions";
import { SessionStatuses } from "../../enums/sessionStatuses";
import { Goal, Session } from "../../types/global";

interface StartSessionModalProps {
  session: Session;
  buttonStyle: string;
  isAlert?: boolean;
}

export default function StartSessionModal({
  session,
  buttonStyle,
  isAlert,
}: StartSessionModalProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.Auth);
  const { user } = useSelector((state: RootState) => state.User);
  const sessionLoading = useSelector(
    (state: RootState) => state.Session.loading
  );
  const sessionReady = useSelector(
    (state: RootState) => state.Session.sessionReady
  );

  const [open, setOpen] = useState(false);

  const hours = Math.floor(session.totalDuration / 3600);
  const minutes = Math.floor((session.totalDuration % 3600) / 60);

  useEffect(() => {
    if (!sessionLoading && sessionReady) {
      navigate("/practice");
    }
  }, [sessionLoading, sessionReady, navigate]);

  const handleStartSession = () => {
    const payload = {
      uid: user?.uid,
      sessionId: session.session_id,
      session: {
        status: SessionStatuses.ACTIVE,
        uid_status: `${user?.uid}#active`,
      },
      idToken: token,
    };

    dispatch(startScheduledSessionRequest(payload));
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(newState) => {
        setOpen(newState);
      }}
    >
      <Dialog.Trigger asChild>
        <button
          className={`mt-3 ${buttonStyle} px-4 py-2 rounded-lg transition
          ${isAlert ? "animate-pulse ring-2 ring-opacity-40" : ""}`}
        >
          View Session
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-90 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-90">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">
              Session Details
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-gray-700">
                <X />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Title</p>
              <p className="text-base">{session.title}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Instrument</p>
              <p className="text-base">{session.instrument}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Duration</p>
              <p className="text-base">{`${hours}h ${minutes}m`}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Goals</p>
              {session.goals?.length ? (
                <ul className="list-disc pl-5 text-base">
                  {session.goals.map((g: Goal) => (
                    <li key={g.id}>{g.text}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-base">No goals set</p>
              )}
            </div>
          </div>

          <button
            onClick={handleStartSession}
            disabled={sessionLoading}
            className="mt-6 w-full px-4 py-2 rounded-lg transition bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 flex items-center justify-center gap-2"
          >
            {sessionLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Starting...
              </>
            ) : (
              "Start"
            )}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
