// src/api/services/authService.ts
import api from "../axios";
import type { AuthResponse } from "../../types/auth";

export const authService = {
  login: async (credentials: Record<string, string>): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/login", credentials);
    return response.data;
  },
  me: async () => {
    const response = await api.get("/me");
    return response.data;
  },
};
