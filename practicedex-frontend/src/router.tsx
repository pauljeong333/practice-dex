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
// import PracticePage from "./pages/PracticePage";

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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<PrivateLayout isAuthenticated={isLoggedIn} />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/practice" element={<PracticePage />} />
          {/* Add more protected routes here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
