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
          <EnvelopeIcon class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t("auth.emailVerification") }}
        </h1>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 px-8 py-8 text-center"
      >
        <ArrowPathIcon
          class="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4"
        />
        <p class="text-gray-600">
          {{ $t("auth.verifyingEmail") }}
        </p>
      </div>

      <!-- Success State -->
      <div
        v-else-if="successMessage"
        class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 px-8 py-8 text-center"
      >
        <div class="mb-4">
          <CheckCircleIcon class="w-16 h-16 text-green-500 mx-auto" />
        </div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">
          {{ $t("auth.emailVerified") }}
        </h2>
        <p class="text-gray-600 mb-6">
          {{ successMessage }}
        </p>
        <router-link
          to="/login"
          class="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5 mr-2" />
          {{ $t("auth.signIn") }}
        </router-link>
      </div>

      <!-- Error State -->
      <div
        v-else-if="errorMessage"
        class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 px-8 py-8 text-center"
      >
        <div class="mb-4">
          <ExclamationCircleIcon class="w-16 h-16 text-red-500 mx-auto" />
        </div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">
          {{ $t("auth.verificationFailed") }}
        </h2>
        <p class="text-red-600 mb-6">
          {{ errorMessage }}
        </p>
        <div class="space-y-3">
          <router-link
            to="/login"
            class="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            <ArrowRightOnRectangleIcon class="w-5 h-5 mr-2" />
            {{ $t("auth.signIn") }}
          </router-link>
          <button
            @click="resendVerification"
            :disabled="resendLoading"
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="resendLoading" class="flex items-center justify-center">
              <ArrowPathIcon class="animate-spin -ml-1 mr-3 h-4 w-4" />
              {{ $t("auth.sending") }}
            </span>
            <span v-else>
              {{ $t("auth.resendVerification") }}
            </span>
          </button>
        </div>
      </div>

      <!-- Invalid Token State -->
      <div
        v-else
        class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 px-8 py-8 text-center"
      >
        <div class="mb-4">
          <ExclamationCircleIcon class="w-16 h-16 text-yellow-500 mx-auto" />
        </div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">
          {{ $t("auth.invalidToken") }}
        </h2>
        <p class="text-gray-600 mb-6">
          {{ $t("auth.invalidTokenDescription") }}
        </p>
        <router-link
          to="/login"
          class="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5 mr-2" />
          {{ $t("auth.signIn") }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  EnvelopeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";
import { authService } from "@/services/auth";

const route = useRoute();

const loading = ref(false);
const resendLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const token = ref("");

onMounted(async () => {
  token.value = route.query.token as string;

  if (!token.value) {
    errorMessage.value = "Missing verification token.";
    return;
  }

  loading.value = true;

  try {
    const response = await authService.verifyEmail(token.value);
    successMessage.value = response.message;
  } catch (error: any) {
    errorMessage.value =
      error.response?.data?.message || "Verification failed. Please try again.";
  } finally {
    loading.value = false;
  }
});

const resendVerification = async () => {
  // This would require the user ID or email, which we don't have here
  // In a real implementation, you might want to redirect to a resend verification page
  // or implement a different flow
  resendLoading.value = true;

  try {
    // For now, we'll just show a message that they need to log in to resend
    errorMessage.value =
      "Please log in to your account to resend verification email.";
  } finally {
    resendLoading.value = false;
  }
};
</script>
