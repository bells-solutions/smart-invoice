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
                  Dashboard
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
                  Clients
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
                  Invoices
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
            <!-- Quick Actions -->
            <div class="hidden md:flex items-center space-x-2 mr-4">
              <router-link
                to="/invoices/new"
                class="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <PlusIcon class="w-4 h-4 mr-1" />
                New Invoice
              </router-link>
            </div>

            <!-- User Profile Dropdown -->
            <div class="relative ml-3" ref="userMenuRef">
              <button
                @click="toggleUserMenu"
                class="flex items-center max-w-xs bg-white rounded-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:bg-gray-50 transition-colors duration-200"
                id="user-menu-button"
              >
                <div class="flex items-center">
                  <div
                    class="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
                  >
                    <span class="text-sm font-medium text-white">
                      {{ getInitials() }}
                    </span>
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
                  <button
                    @click="handleLogout"
                    class="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                    role="menuitem"
                  >
                    <ArrowRightOnRectangleIcon class="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500" />
                    Sign out
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
            Dashboard
          </router-link>
          <router-link
            to="/clients"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            @click="closeMobileMenu"
          >
            Clients
          </router-link>
          <router-link
            to="/invoices"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            @click="closeMobileMenu"
          >
            Invoices
          </router-link>
          <router-link
            to="/invoices/new"
            class="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
            @click="closeMobileMenu"
          >
            New Invoice
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
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  DocumentTextIcon,
  BriefcaseIcon,
  UsersIcon,
  PlusIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const authStore = useAuthStore();

const showUserMenu = ref(false);
const showMobileMenu = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value;
}

function closeMobileMenu() {
  showMobileMenu.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (
    userMenuRef.value &&
    !userMenuRef.value.contains(event.target as Node) &&
    showUserMenu.value
  ) {
    showUserMenu.value = false;
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
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
