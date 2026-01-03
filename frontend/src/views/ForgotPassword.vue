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
          <KeyIcon class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t("auth.forgotPassword") }}
        </h1>
        <p class="text-gray-600">
          {{ $t("auth.forgotPasswordDescription") }}
        </p>
      </div>

      <!-- Success Message -->
      <div
        v-if="successMessage"
        class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
      >
        <div class="flex items-center">
          <CheckCircleIcon class="w-5 h-5 text-green-400 mr-3" />
          <p class="text-sm text-green-800">{{ successMessage }}</p>
        </div>
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
      >
        <div class="flex items-center">
          <ExclamationCircleIcon class="w-5 h-5 text-red-400 mr-3" />
          <p class="text-sm text-red-800">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Form Card -->
      <div
        class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50"
      >
        <div class="px-8 pt-8 pb-6">
          <form @submit.prevent="handleForgotPassword" class="space-y-6">
            <!-- Email Input -->
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                {{ $t("auth.email") }}
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                >
                  <EnvelopeIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="email"
                  type="email"
                  id="email"
                  required
                  class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  :placeholder="$t('auth.enterEmail')"
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
                <ArrowPathIcon
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                />
                {{ $t("auth.sending") }}
              </span>
              <span v-else class="flex items-center justify-center">
                <PaperAirplaneIcon class="w-5 h-5 mr-2" />
                {{ $t("auth.sendResetLink") }}
              </span>
            </button>
          </form>
        </div>

        <!-- Footer -->
        <div class="px-8 pb-8">
          <div class="text-center">
            <p class="text-gray-600 text-sm">
              {{ $t("auth.rememberPassword") }}
              <router-link
                to="/login"
                class="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                {{ $t("auth.signIn") }}
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  KeyIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/vue/24/outline";
import { authService } from "@/services/auth";

const router = useRouter();

const email = ref("");
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const handleForgotPassword = async () => {
  if (loading.value) return;

  loading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const response = await authService.forgotPassword(email.value);
    successMessage.value = response.message;

    // Optionally redirect to login after a delay
    setTimeout(() => {
      router.push("/login");
    }, 3000);
  } catch (error: any) {
    errorMessage.value =
      error.response?.data?.message || "An error occurred. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>
