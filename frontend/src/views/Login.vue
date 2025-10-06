<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4"
  >
    <div class="max-w-md w-full">
      <!-- Logo/Brand Section -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4"
        >
          <DocumentTextIcon class="w-8 h-8 text-white" />
        </div>
        <h1
          class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
        >
          Welcome Back
        </h1>
        <p class="text-gray-600">Sign in to your SmartInvoice account</p>
      </div>

      <!-- Login Card -->
      <div
        class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div class="p-8">
          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- Error Message -->
            <div
              v-if="error"
              class="p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <div class="flex items-center">
                <ExclamationTriangleIcon class="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <p class="text-red-700 text-sm font-medium">{{ error }}</p>
              </div>
            </div>

            <!-- Email Field -->
            <div class="space-y-2">
              <label
                class="block text-sm font-semibold text-gray-700"
                for="email"
              >
                Email Address
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                >
                  <UserIcon class="w-5 h-5 text-gray-400" />
                </div>
                <input
                  v-model="email"
                  type="email"
                  id="email"
                  required
                  class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label
                class="block text-sm font-semibold text-gray-700"
                for="password"
              >
                Password
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                >
                  <LockClosedIcon class="w-5 h-5 text-gray-400" />
                </div>
                <input
                  v-model="password"
                  type="password"
                  id="password"
                  required
                  class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <ArrowPathIcon class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Signing in...
              </span>
              <span v-else class="flex items-center justify-center">
                <ArrowRightOnRectangleIcon class="w-5 h-5 mr-2" />
                Sign In
              </span>
            </button>
          </form>
        </div>

        <!-- Footer -->
        <div class="px-8 pb-8">
          <div class="text-center">
            <p class="text-gray-600 text-sm">
              Don't have an account?
              <router-link
                to="/register"
                class="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Create one here
              </router-link>
            </p>
          </div>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="mt-8 text-center">
        <p class="text-xs text-gray-500">
          Secure login powered by SmartInvoice
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
  UserIcon,
  LockClosedIcon,
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function handleLogin() {
  loading.value = true;
  error.value = "";

  try {
    await authStore.login(email.value, password.value);
    router.push("/dashboard");
  } catch (err: any) {
    error.value = err.response?.data?.message || "Login failed";
  } finally {
    loading.value = false;
  }
}
</script>
