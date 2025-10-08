<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100"
  >
    <!-- Navigation -->
    <nav class="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <!-- Logo/Brand -->
            <div class="flex-shrink-0 flex items-center">
              <div
                class="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg mr-3"
              >
                <DocumentTextIcon class="w-8 h-8 text-white" />
              </div>
              <div>
                <h1
                  class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  SmartInvoice
                </h1>
                <p class="text-xs text-gray-500 -mt-1">
                  Professional Invoicing
                </p>
              </div>
            </div>

            <!-- Navigation Links -->
            <div class="hidden md:ml-10 md:flex md:space-x-1">
              <router-link
                to="/dashboard"
                class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                :class="{
                  'bg-blue-100 text-blue-700': $route.path === '/dashboard',
                }"
              >
                <div class="flex items-center">
                  <BriefcaseIcon class="w-4 h-4 mr-2" />
                  {{ $t("navigation.dashboard") }}
                </div>
                <div
                  v-if="$route.path === '/dashboard'"
                  class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                ></div>
              </router-link>

              <router-link
                to="/clients"
                class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-green-50 hover:text-green-700"
                :class="{
                  'bg-green-100 text-green-700': $route.path === '/clients',
                }"
              >
                <div class="flex items-center">
                  <UsersIcon class="w-4 h-4 mr-2" />
                  {{ $t("navigation.clients") }}
                </div>
                <div
                  v-if="$route.path === '/clients'"
                  class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full"
                ></div>
              </router-link>

              <router-link
                to="/invoices"
                class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-purple-50 hover:text-purple-700"
                :class="{
                  'bg-purple-100 text-purple-700':
                    $route.path.startsWith('/invoices'),
                }"
              >
                <div class="flex items-center">
                  <DocumentTextIcon class="w-4 h-4 mr-2" />
                  {{ $t("navigation.invoices") }}
                </div>
                <div
                  v-if="$route.path.startsWith('/invoices')"
                  class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"
                ></div>
              </router-link>
            </div>
          </div>

          <!-- User Menu -->
          <div class="flex items-center">
            <!-- Language Switcher -->
            <div class="relative mr-4">
              <button
                @click.stop="toggleLanguageMenu"
                class="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-300 transition-colors duration-200"
              >
                <GlobeAltIcon class="w-4 h-4 mr-2 text-black" />
                {{ currentLanguage.toUpperCase() }}
                <ChevronDownIcon class="ml-1.5 h-4 w-4" />
              </button>

              <!-- Language Dropdown -->
              <div
                v-if="showLanguageMenu"
                class="absolute right-0 top-full mt-1 w-32 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[100] border border-gray-200"
              >
                <div class="py-1">
                  <button
                    v-for="lang in availableLanguages"
                    :key="lang.code"
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
            <!-- Add Quick Actions here -->

            <!-- User Profile Dropdown -->
            <div class="relative" ref="userMenuRef">
              <button
                @click="toggleUserMenu"
                class="flex items-center max-w-xs bg-white rounded-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:bg-gray-50 transition-colors duration-200"
                id="user-menu-button"
              >
                <div class="flex items-center">
                  <div
                    class="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200"
                  >
                    <img
                      v-if="authStore.user?.profilePicture"
                      :src="authStore.user.profilePicture"
                      :alt="authStore.user.firstName || 'Profile'"
                      class="h-full w-full object-cover"
                    />
                    <div
                      v-else
                      class="h-full w-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-white">
                        {{ getInitials() }}
                      </span>
                    </div>
                  </div>
                  <ChevronDownIcon class="ml-2 h-4 w-4 text-gray-400" />
                </div>
              </button>

              <!-- Dropdown Menu -->
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50"
                role="menu"
              >
                <div class="px-4 py-3">
                  <p class="text-sm font-medium text-gray-900">
                    {{ authStore.user?.firstName }}
                    {{ authStore.user?.lastName }}
                  </p>
                  <p class="text-sm text-gray-500 truncate">
                    {{ authStore.user?.email }}
                  </p>
                </div>
                <div class="py-1">
                  <router-link
                    to="/profile"
                    @click="showUserMenu = false"
                    class="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                    role="menuitem"
                  >
                    <UsersIcon
                      class="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500"
                    />
                    {{ $t("navigation.profile") }}
                  </router-link>
                  <button
                    @click="handleLogout"
                    class="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                    role="menuitem"
                  >
                    <ArrowRightOnRectangleIcon
                      class="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500"
                    />
                    {{ $t("navigation.logout") }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Mobile menu button -->
            <div class="md:hidden ml-3">
              <button
                @click="toggleMobileMenu"
                class="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <Bars3Icon v-if="!showMobileMenu" class="block h-6 w-6" />
                <XMarkIcon v-else class="block h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div
        v-if="showMobileMenu"
        class="md:hidden bg-white border-t border-gray-200"
      >
        <div class="px-2 pt-2 pb-3 space-y-1">
          <router-link
            to="/dashboard"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            @click="closeMobileMenu"
          >
            {{ $t("navigation.dashboard") }}
          </router-link>
          <router-link
            to="/clients"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            @click="closeMobileMenu"
          >
            {{ $t("navigation.clients") }}
          </router-link>
          <router-link
            to="/invoices"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            @click="closeMobileMenu"
          >
            {{ $t("navigation.invoices") }}
          </router-link>
          <router-link
            to="/profile"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            @click="closeMobileMenu"
          >
            {{ $t("navigation.profile") }}
          </router-link>
          <router-link
            to="/invoices/new"
            class="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
            @click="closeMobileMenu"
          >
            {{ $t("invoices.newInvoice") }}
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-16">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div
              class="bg-gradient-to-r from-blue-600 to-purple-600 p-1 rounded mr-2"
            >
              <DocumentTextIcon class="w-4 h-4 text-white" />
            </div>
            <span class="text-sm text-gray-600"
              >© 2025 SmartInvoice. Professional invoicing made simple.</span
            >
          </div>
          <div class="text-sm text-gray-500">v1.0.0</div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import {
  DocumentTextIcon,
  BriefcaseIcon,
  UsersIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  GlobeAltIcon,
} from "@heroicons/vue/24/outline";

const { locale } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const showUserMenu = ref(false);
const showMobileMenu = ref(false);
const showLanguageMenu = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);

const currentLanguage = computed(() => locale.value);

const availableLanguages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value;
}

function toggleLanguageMenu() {
  showLanguageMenu.value = !showLanguageMenu.value;
}

function closeMobileMenu() {
  showMobileMenu.value = false;
}

function changeLanguage(langCode: string) {
  locale.value = langCode;
  localStorage.setItem("user-language", langCode);
  showLanguageMenu.value = false;

  // Update language preference in backend
  const authStore = useAuthStore();
  authStore.updateProfile({ language: langCode }).catch((error) => {
    console.error("Failed to update language preference:", error);
  });
}

function handleClickOutside(event: MouseEvent) {
  if (
    userMenuRef.value &&
    !userMenuRef.value.contains(event.target as Node) &&
    showUserMenu.value
  ) {
    showUserMenu.value = false;
  }
  // Language menu click outside is handled by the button click stop propagation
  if (showLanguageMenu.value) {
    showLanguageMenu.value = false;
  }
}

function getInitials() {
  const user = authStore.user;
  if (user?.firstName && user?.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(
      0
    )}`.toUpperCase();
  }
  return "U";
}

function handleLogout() {
  authStore.logout();
  router.push("/login");
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
