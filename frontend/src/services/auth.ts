import api from "./api";
import type { User } from "@/types";

export const authService = {
  async register(data: {
    email: string;
    password: string;
    accountType: "individual" | "company";
    firstName?: string;
    lastName?: string;
    phone?: string;
    town?: string;
    address?: string;
    companyName?: string;
    taxpayerNumber?: string;
    commercialRegister?: string;
    poBox?: string;
  }) {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  setToken(token: string) {
    localStorage.setItem("token", token);
  },

  setUser(user: User) {
    localStorage.setItem("user", JSON.stringify(user));
  },

  getUser(): User | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
