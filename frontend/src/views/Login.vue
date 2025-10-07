<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4"
  >
    <!-- Language Switcher -->
    <div class="absolute top-4 right-4 z-10" data-testid="language-switcher">
      <div class="relative">
        <button
          data-testid="language-switcher"
          @click.stop="toggleLanguageMenu"
          class="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
        >
          <GlobeAltIcon class="w-4 h-4 mr-2" />
          {{ currentLanguage.toUpperCase() }}
          <ChevronDownIcon class="ml-2 h-4 w-4" />
        </button>

        <!-- Language Dropdown -->
        <div
          v-if="showLanguageMenu"
          class="absolute right-0 top-full mt-1 w-32 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[100] border border-gray-200"
          data-testid="language-dropdown"
        >
          <div class="py-1">
            <button
              v-for="lang in availableLanguages"
              :key="lang.code"
              :data-testid="`language-${lang.code}`"
              @click.stop="changeLanguage(lang.code)"
              class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              :class="{
                'bg-blue-50 text-blue-700': currentLanguage === lang.code,
              }"
            >
              <span class="mr-2">{{ lang.flag }}</span>
              {{ lang.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

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
          {{ $t("auth.welcomeBack") }}
        </h1>
        <p class="text-gray-600">{{ $t("auth.signInDescription") }}</p>
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
                <ExclamationTriangleIcon
                  class="w-5 h-5 text-red-500 mr-3 flex-shrink-0"
                />
                <p class="text-red-700 text-sm font-medium">{{ error }}</p>
              </div>
            </div>

            <!-- Email Field -->
            <div class="space-y-2">
              <label
                class="block text-sm font-semibold text-gray-700"
                for="email"
              >
                {{ $t("auth.emailAddress") }}
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
                  :placeholder="$t('auth.enterEmail')"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label
                class="block text-sm font-semibold text-gray-700"
                for="password"
              >
                {{ $t("auth.password") }}
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
                  :placeholder="$t('auth.enterPassword')"
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
                {{ $t("auth.signingIn") }}
              </span>
              <span v-else class="flex items-center justify-center">
                <ArrowRightOnRectangleIcon class="w-5 h-5 mr-2" />
                {{ $t("auth.signIn") }}
              </span>
            </button>
          </form>
        </div>

        <!-- Footer -->
        <div class="px-8 pb-8">
          <div class="text-center">
            <p class="text-gray-600 text-sm">
              {{ $t("auth.dontHaveAccount") }}
              <router-link
                to="/register"
                class="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                {{ $t("auth.createOneHere") }}
              </router-link>
            </p>
          </div>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="mt-8 text-center">
        <p class="text-xs text-gray-500">
          {{ $t("auth.secureLogin") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
  UserIcon,
  LockClosedIcon,
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  ChevronDownIcon,
} from "@heroicons/vue/24/outline";

const { locale, t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const showLanguageMenu = ref(false);

const currentLanguage = computed(() => locale.value);

const availableLanguages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

function toggleLanguageMenu() {
  showLanguageMenu.value = !showLanguageMenu.value;
}

function changeLanguage(langCode: string) {
  locale.value = langCode;
  localStorage.setItem("user-language", langCode);
  showLanguageMenu.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (showLanguageMenu.value) {
    showLanguageMenu.value = false;
  }
}

async function handleLogin() {
  loading.value = true;
  error.value = "";

  try {
    await authStore.login(email.value, password.value);
    router.push("/dashboard");
  } catch (err: any) {
    error.value = err.response?.data?.message || t("auth.loginFailed");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  // Load saved language preference
  const savedLanguage = localStorage.getItem("user-language");
  if (
    savedLanguage &&
    availableLanguages.some((lang) => lang.code === savedLanguage)
  ) {
    locale.value = savedLanguage;
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
