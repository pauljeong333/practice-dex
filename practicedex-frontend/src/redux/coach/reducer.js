import { produce } from "immer";
import * as CONSTANTS from "./constants";

const initialState = {
  messages: [],
  loading: false,
  error: null,
};

const coachReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case CONSTANTS.SEND_CHAT_REQUEST:
        draft.error = null;
        draft.messages.push({
          sender: "user",
          text: action.payload.userMessage,
        });
        draft.messages.push({
          sender: "coach",
          text: "",
          pending: true,
        });
        draft.loading = true;
        break;

      case CONSTANTS.SEND_CHAT_SUCCESS:
        const lastUserMsg = draft.messages.findLast(
          (msg) => msg.sender === "coach" && msg.pending
        );
        if (lastUserMsg) {
          (lastUserMsg.text = action.payload.response),
            (lastUserMsg.pending = false);
        }
        draft.loading = false;
        break;

      case CONSTANTS.SEND_CHAT_ERROR:
        draft.error = action.error;
        const failedMsg = draft.messages.findLast(
          (msg) => msg.sender === "coach" && msg.pending
        );
        if (failedMsg) {
          (failedMsg.text = "Sorry, something went wrong. Please try again."),
            (failedMsg.pending = false);
        }
        draft.loading = false;
        break;

      case CONSTANTS.RESET_CHAT:
        draft.messages = [];
        break;
    }
  });

export default coachReducer;
