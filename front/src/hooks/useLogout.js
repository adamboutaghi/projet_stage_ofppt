import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AxiosClient from "../services/AxiosClient";
import { useAuth } from "../contexts/AuthContext";

export function useLogout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      await AxiosClient.post("/logout");
    } catch {
      // déconnexion locale même si l'API échoue
    }
    logout();
    navigate("/", { replace: true });
  }, [logout, navigate]);

  return handleLogout;
}
