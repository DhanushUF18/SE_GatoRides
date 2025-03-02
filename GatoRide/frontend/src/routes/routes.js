import { Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import Home from "../pages/Home";
import SignUp from "../components/SignUp";
import Login from "../components/Login";
import Dashboard from "../components/Dashboard";
import VerifyEmail from "../components/VerifyEmail";

// Remove HomeWrapper since we'll show Dashboard directly in Home component

// Keep ProtectedRoute for other protected pages
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

const RouteConfig = [
  {
    path: "/",
    component: Home, // Home component will now include Dashboard content
    exact: true,
  },
  {
    path: "/signup",
    component: SignUp,
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/verify-email/:token",
    component: VerifyEmail,
  },
];

export default RouteConfig;