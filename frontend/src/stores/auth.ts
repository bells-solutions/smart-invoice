import { defineStore } from "pinia";
import { ref } from "vue";
import { authService } from "@/services/auth";
import type { User } from "@/types";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(authService.getUser());
  const isAuthenticated = ref(!!localStorage.getItem("token"));

  async function login(email: string, password: string) {
    const response = await authService.login(email, password);
    authService.setToken(response.access_token);
    authService.setUser(response.user);
    user.value = response.user;
    isAuthenticated.value = true;
    return response;
  }

  async function register(data: {
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
    const response = await authService.register(data);
    authService.setToken(response.access_token);
    authService.setUser(response.user);
    user.value = response.user;
    isAuthenticated.value = true;
    return response;
  }

  function logout() {
    authService.logout();
    user.value = null;
    isAuthenticated.value = false;
  }

  async function updateProfile(updateData: {
    accountType?: "individual" | "company";
    firstName?: string;
    lastName?: string;
    phone?: string;
    town?: string;
    address?: string;
    companyName?: string;
    taxpayerNumber?: string;
    commercialRegister?: string;
    poBox?: string;
    currency?: string;
  }) {
    const response = await authService.updateProfile(updateData);
    authService.setUser(response);
    user.value = response;
    return response;
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };
});
