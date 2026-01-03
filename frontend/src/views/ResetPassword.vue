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
          <LockClosedIcon class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t("auth.resetPassword") }}
        </h1>
        <p class="text-gray-600">
          {{ $t("auth.resetPasswordDescription") }}
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
        v-if="!successMessage"
        class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50"
      >
        <div class="px-8 pt-8 pb-6">
          <form @submit.prevent="handleResetPassword" class="space-y-6">
            <!-- Password Input -->
            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                {{ $t("auth.newPassword") }}
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                >
                  <LockClosedIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  required
                  minlength="6"
                  class="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  :placeholder="$t('auth.enterNewPassword')"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                  <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            <!-- Confirm Password Input -->
            <div>
              <label
                for="confirmPassword"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                {{ $t("auth.confirmPassword") }}
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                >
                  <LockClosedIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirmPassword"
                  required
                  minlength="6"
                  class="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  :placeholder="$t('auth.confirmNewPassword')"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <EyeIcon
                    v-if="!showConfirmPassword"
                    class="h-5 w-5 text-gray-400"
                  />
                  <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            <!-- Password Match Warning -->
            <div
              v-if="password && confirmPassword && password !== confirmPassword"
              class="p-3 bg-yellow-50 border border-yellow-200 rounded-xl"
            >
              <p class="text-sm text-yellow-800">
                {{ $t("auth.passwordsDoNotMatch") }}
              </p>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="
                loading ||
                password !== confirmPassword ||
                !password ||
                !confirmPassword
              "
              class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <ArrowPathIcon
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                />
                {{ $t("auth.resetting") }}
              </span>
              <span v-else class="flex items-center justify-center">
                <CheckIcon class="w-5 h-5 mr-2" />
                {{ $t("auth.resetPassword") }}
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

      <!-- Success State -->
      <div
        v-else
        class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 px-8 py-8 text-center"
      >
        <div class="mb-4">
          <CheckCircleIcon class="w-16 h-16 text-green-500 mx-auto" />
        </div>
        <p class="text-gray-600 mb-6">
          {{ $t("auth.passwordResetSuccess") }}
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
import { useRouter, useRoute } from "vue-router";
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  CheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";
import { authService } from "@/services/auth";

const router = useRouter();
const route = useRoute();

const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const token = ref("");

onMounted(() => {
  token.value = route.query.token as string;
  if (!token.value) {
    errorMessage.value = "Invalid or missing reset token.";
  }
});

const handleResetPassword = async () => {
  if (loading.value || password.value !== confirmPassword.value) return;

  loading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const response = await authService.resetPassword(
      token.value,
      password.value
    );
    successMessage.value = response.message;
  } catch (error: any) {
    errorMessage.value =
      error.response?.data?.message || "An error occurred. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>
