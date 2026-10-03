import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthWithPhone from "@/widgets/auth/ui/Auth";
import { ChatWorkspace } from "@/widgets/chat-workspace/ui/ChatWorkspace";
import { PHONE_STORAGE_KEY } from "@/shared/constants";
function ChatRoute() {
  const currentUserPhone = localStorage.getItem(PHONE_STORAGE_KEY ?? "");
  if (!currentUserPhone) {
    return <Navigate to="/" replace />;
  }
  return <ChatWorkspace currentUserPhone={currentUserPhone} />;
}

export const router = createBrowserRouter([
  { element: <AuthWithPhone />, path: "/" },
  { element: <ChatRoute />, path: "/chats" }
]);
