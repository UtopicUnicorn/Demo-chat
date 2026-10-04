import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AuthWithPhone from "@/widgets/auth/ui/Auth";
import { ChatWorkspace } from "@/widgets/chat-workspace/ui/ChatWorkspace";
import { PHONE_STORAGE_KEY } from "@/shared/constants";

export function AuthRoute() {
  const currentUserPhone = localStorage.getItem(PHONE_STORAGE_KEY);

  if (currentUserPhone) {
    return <Navigate to="/" replace />;
  }

  return <AuthWithPhone />;
}

export function ChatRoute() {
  const currentUserPhone = localStorage.getItem(PHONE_STORAGE_KEY);
  const navigate = useNavigate();

  if (!currentUserPhone) {
    return <Navigate to="/auth" replace />;
  }

  function logout() {
    localStorage.removeItem(PHONE_STORAGE_KEY);
    navigate("/auth", { replace: true });
  }

  return <ChatWorkspace currentUserPhone={currentUserPhone} onLogout={logout} />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<ChatRoute />} path="/" />
      <Route element={<AuthRoute />} path="/auth" />
    </Routes>
  );
}
