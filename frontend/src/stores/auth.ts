import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authService } from '@/services/auth';
import type { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(authService.getUser());
  const isAuthenticated = ref(!!localStorage.getItem('token'));

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
    firstName: string;
    lastName: string;
    companyName?: string;
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

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
  };
});
