import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../types/redux";
import { resetSession } from "../../redux/session/actions";

/**
 * Centralizes navigation that was previously driven by session flags
 * (toHome, toCongrats). Listening here ensures a single navigation
 * transition and avoids double-redirect flicker.
 */
export default function NavigationListener() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { toHome, loading } = useSelector((s: RootState) => s.Session);

  useEffect(() => {
    if (toHome && !loading) {
      dispatch(resetSession());
      navigate("/home");
    }
  }, [toHome, loading, navigate, dispatch]);

  return null;
}
