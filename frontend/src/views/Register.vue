<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div
          class="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center"
        >
          <UserPlusIcon class="h-6 w-6 text-white" />
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Join SmartInvoice and start creating professional invoices
        </p>
      </div>

      <!-- Form -->
      <div
        class="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100"
      >
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Error Alert -->
          <div
            v-if="error"
            class="rounded-lg bg-red-50 p-4 border border-red-200"
          >
            <div class="flex">
              <div class="flex-shrink-0">
                <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-red-800">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Name Fields -->
          <div class="grid grid-cols-2 gap-4">
            <!-- First Name -->
            <div>
              <label
                for="firstName"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name *
              </label>
              <div class="relative">
                <input
                  v-model="form.firstName"
                  type="text"
                  id="firstName"
                  required
                  :class="[
                    'block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200',
                    form.firstName && !isValidFirstName
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300',
                  ]"
                  placeholder="John"
                  @blur="validateFirstName"
                />
                <div
                  v-if="form.firstName && !isValidFirstName"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                >
                  <ExclamationCircleIcon class="h-5 w-5 text-red-500" />
                </div>
              </div>
              <p
                v-if="form.firstName && !isValidFirstName"
                class="mt-1 text-sm text-red-600"
              >
                First name is required
              </p>
            </div>

            <!-- Last Name -->
            <div>
              <label
                for="lastName"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name *
              </label>
              <div class="relative">
                <input
                  v-model="form.lastName"
                  type="text"
                  id="lastName"
                  required
                  :class="[
                    'block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200',
                    form.lastName && !isValidLastName
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300',
                  ]"
                  placeholder="Doe"
                  @blur="validateLastName"
                />
                <div
                  v-if="form.lastName && !isValidLastName"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                >
                  <ExclamationCircleIcon class="h-5 w-5 text-red-500" />
                </div>
              </div>
              <p
                v-if="form.lastName && !isValidLastName"
                class="mt-1 text-sm text-red-600"
              >
                Last name is required
              </p>
            </div>
          </div>

          <!-- Company Name -->
          <div>
            <label
              for="companyName"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Company Name
            </label>
            <div class="relative">
              <input
                v-model="form.companyName"
                type="text"
                id="companyName"
                :class="'block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200'"
                placeholder="Your Company Ltd."
              />
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <BuildingOfficeIcon class="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <p class="mt-1 text-sm text-gray-500">
              Optional - Leave blank if individual
            </p>
          </div>

          <!-- Email -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address *
            </label>
            <div class="relative">
              <input
                v-model="form.email"
                type="email"
                id="email"
                required
                :class="[
                  'block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200',
                  form.email && !isValidEmail
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300',
                ]"
                placeholder="john.doe@example.com"
                @blur="validateEmail"
              />
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <EnvelopeIcon class="h-5 w-5 text-gray-400" />
              </div>
              <div
                v-if="form.email && !isValidEmail"
                class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
              >
                <ExclamationCircleIcon class="h-5 w-5 text-red-500" />
              </div>
            </div>
            <p
              v-if="form.email && !isValidEmail"
              class="mt-1 text-sm text-red-600"
            >
              Please enter a valid email address
            </p>
          </div>

          <!-- Password -->
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Password *
            </label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                id="password"
                required
                minlength="6"
                :class="[
                  'block w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200',
                  form.password && !isValidPassword
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300',
                ]"
                placeholder="Create a strong password"
                @blur="validatePassword"
              />
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <LockClosedIcon class="h-5 w-5 text-gray-400" />
              </div>
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword"
              >
                <EyeSlashIcon
                  v-if="showPassword"
                  class="h-5 w-5 text-gray-400 hover:text-gray-600"
                />
                <EyeIcon
                  v-else
                  class="h-5 w-5 text-gray-400 hover:text-gray-600"
                />
              </button>
            </div>
            <div class="mt-2">
              <div class="flex items-center space-x-2">
                <div
                  :class="[
                    'w-2 h-2 rounded-full',
                    passwordStrength >= 1 ? 'bg-red-400' : 'bg-gray-200',
                  ]"
                ></div>
                <div
                  :class="[
                    'w-2 h-2 rounded-full',
                    passwordStrength >= 2 ? 'bg-yellow-400' : 'bg-gray-200',
                  ]"
                ></div>
                <div
                  :class="[
                    'w-2 h-2 rounded-full',
                    passwordStrength >= 3 ? 'bg-green-400' : 'bg-gray-200',
                  ]"
                ></div>
                <span class="text-xs text-gray-500 ml-2">
                  {{ passwordStrengthText }}
                </span>
              </div>
            </div>
            <p
              v-if="form.password && !isValidPassword"
              class="mt-1 text-sm text-red-600"
            >
              Password must be at least 6 characters long
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <ArrowPathIcon
                v-if="loading"
                class="animate-spin h-5 w-5 text-blue-300"
              />
              <UserPlusIcon
                v-else
                class="h-5 w-5 text-blue-300 group-hover:text-blue-200"
              />
            </span>
            {{ loading ? "Creating Account..." : "Create Account" }}
          </button>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <router-link
              to="/login"
              class="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Sign in here
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  UserPlusIcon,
  ExclamationCircleIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  companyName: "",
});

const loading = ref(false);
const error = ref("");
const showPassword = ref(false);

// Validation states
const isValidFirstName = ref(true);
const isValidLastName = ref(true);
const isValidEmail = ref(true);
const isValidPassword = ref(true);

// Password strength calculation
const passwordStrength = computed(() => {
  const password = form.value.password;
  if (!password) return 0;

  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  return Math.min(strength, 3);
});

const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 0:
      return "Very weak";
    case 1:
      return "Weak";
    case 2:
      return "Fair";
    case 3:
      return "Strong";
    default:
      return "";
  }
});

// Form validation
const isFormValid = computed(() => {
  return (
    form.value.firstName.trim().length > 0 &&
    form.value.lastName.trim().length > 0 &&
    isValidEmail.value &&
    isValidPassword.value
  );
});

// Validation functions
function validateFirstName() {
  isValidFirstName.value = form.value.firstName.trim().length > 0;
}

function validateLastName() {
  isValidLastName.value = form.value.lastName.trim().length > 0;
}

function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  isValidEmail.value = emailRegex.test(form.value.email);
}

function validatePassword() {
  isValidPassword.value = form.value.password.length >= 6;
}

async function handleRegister() {
  // Validate all fields before submission
  validateFirstName();
  validateLastName();
  validateEmail();
  validatePassword();

  if (!isFormValid.value) {
    error.value = "Please correct the errors above";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    await authStore.register(form.value);
    router.push("/dashboard");
  } catch (err: any) {
    error.value =
      err.response?.data?.message || "Registration failed. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>
