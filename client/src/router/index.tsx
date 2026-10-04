import { createBrowserRouter, Navigate, useNavigate } from "react-router-dom";
import AuthWithPhone from "@/widgets/auth/ui/Auth";
import { ChatWorkspace } from "@/widgets/chat-workspace/ui/ChatWorkspace";
import { PHONE_STORAGE_KEY } from "@/shared/constants";

export function ChatRoute() {
  const currentUserPhone = localStorage.getItem(PHONE_STORAGE_KEY);
  const navigate = useNavigate();

  if (!currentUserPhone) {
    return <Navigate to="/" replace />;
  }

  function logout() {
    localStorage.removeItem(PHONE_STORAGE_KEY);
    navigate("/", { replace: true });
  }

  return <ChatWorkspace currentUserPhone={currentUserPhone} onLogout={logout} />;
}

// eslint-disable-next-line react-refresh/only-export-components
export const routes = [
  { element: <AuthWithPhone />, path: "/" },
  { element: <ChatRoute />, path: "/chats" }
];

// eslint-disable-next-line react-refresh/only-export-components
export const router = createBrowserRouter(routes);
