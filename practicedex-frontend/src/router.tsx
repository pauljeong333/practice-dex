import { useSelector } from "react-redux";
import { RootState } from "./types/redux";
import {
  Navigate,
  Outlet,
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import PracticePage from "./pages/PracticePage";
import CongratsPage from "./pages/CongratsPage";
import HistoryPage from "./pages/HistoryPage";
import UserPage from "./pages/UserPage";
import Loader from "./components/utility/Loader";
import NavigationListener from "./components/navigation/NavigationListener";
import Dashboard from "./pages/Dashboard";

interface PrivateLayoutProps {
  isAuthenticated: boolean;
}

const PrivateLayout = ({ isAuthenticated }: PrivateLayoutProps) => {
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const Router = () => {
  const isLoggedIn = useSelector(
    (state: RootState) => state.Auth.isAuthenticated
  );
  const appStart = useSelector(
    (state: RootState) => state.Auth.app.appCanStart
  );

  if (!appStart) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      <NavigationListener />
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<PrivateLayout isAuthenticated={isLoggedIn} />}>
          <Route element={<Dashboard />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/user" element={<UserPage />} />
          </Route>
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/congrats" element={<CongratsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
