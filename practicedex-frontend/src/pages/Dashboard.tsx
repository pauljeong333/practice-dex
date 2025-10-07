import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../types/redux";
import {
  getScheduledSessionsRequest,
  getUserSessionsRequest,
} from "../redux/session/actions";

export default function Dashboard() {
  const dispatch = useDispatch();

  const { token } = useSelector((s: RootState) => s.Auth);
  const { user } = useSelector((s: RootState) => s.User);

  useEffect(() => {
    dispatch(
      getUserSessionsRequest({
        uid: user?.uid,
        idToken: token,
      })
    );
    dispatch(
      getScheduledSessionsRequest({
        uid: user?.uid,
        idToken: token,
      })
    );
  }, [user?.uid, token, dispatch]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Page Content */}
      <div className="flex-1 bg-gray-100 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
