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

          <!-- Account Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-4">
              Account Type *
            </label>
            <div class="grid grid-cols-2 gap-4">
              <!-- Individual Account -->
              <div
                @click="form.accountType = 'individual'"
                :class="[
                  'relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md',
                  form.accountType === 'individual'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300',
                ]"
              >
                <div class="flex items-center">
                  <div
                    :class="[
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      form.accountType === 'individual'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-400',
                    ]"
                  >
                    <UserIcon class="h-5 w-5" />
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-gray-900">
                      Individual
                    </h3>
                    <p class="text-xs text-gray-500 mt-1">Personal account</p>
                  </div>
                </div>
                <div
                  v-if="form.accountType === 'individual'"
                  class="absolute top-2 right-2"
                >
                  <div
                    class="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center"
                  >
                    <svg
                      class="h-2.5 w-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Company Account -->
              <div
                @click="form.accountType = 'company'"
                :class="[
                  'relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md',
                  form.accountType === 'company'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300',
                ]"
              >
                <div class="flex items-center">
                  <div
                    :class="[
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      form.accountType === 'company'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-400',
                    ]"
                  >
                    <BuildingOfficeIcon class="h-5 w-5" />
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-gray-900">Company</h3>
                    <p class="text-xs text-gray-500 mt-1">Business account</p>
                  </div>
                </div>
                <div
                  v-if="form.accountType === 'company'"
                  class="absolute top-2 right-2"
                >
                  <div
                    class="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center"
                  >
                    <svg
                      class="h-2.5 w-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Name Fields (Individual) -->
          <div
            v-if="form.accountType === 'individual'"
            class="grid grid-cols-2 gap-4"
          >
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

          <!-- Phone (Individual) -->
          <div v-if="form.accountType === 'individual'">
            <label
              for="phone"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone *
            </label>
            <div class="relative">
              <input
                v-model="form.phone"
                type="tel"
                id="phone"
                required
                :class="[
                  'block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200',
                  form.phone && !isValidPhone
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300',
                ]"
                placeholder="+1234567890"
                @blur="validatePhone"
              />
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div
                v-if="form.phone && !isValidPhone"
                class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
              >
                <ExclamationCircleIcon class="h-5 w-5 text-red-500" />
              </div>
            </div>
            <p
              v-if="form.phone && !isValidPhone"
              class="mt-1 text-sm text-red-600"
            >
              Please enter a valid phone number
            </p>
          </div>

          <!-- Company Name (Company) -->
          <div v-if="form.accountType === 'company'">
            <label
              for="companyName"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Company Name *
            </label>
            <div class="relative">
              <input
                v-model="form.companyName"
                type="text"
                id="companyName"
                required
                :class="[
                  'block w-full px-3 py-2 pl-10 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200',
                  form.companyName && !isValidCompanyName
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300',
                ]"
                placeholder="Your Company Ltd."
                @blur="validateCompanyName"
              />
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <BuildingOfficeIcon class="h-5 w-5 text-gray-400" />
              </div>
              <div
                v-if="form.companyName && !isValidCompanyName"
                class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
              >
                <ExclamationCircleIcon class="h-5 w-5 text-red-500" />
              </div>
            </div>
            <p
              v-if="form.companyName && !isValidCompanyName"
              class="mt-1 text-sm text-red-600"
            >
              Company name is required
            </p>
          </div>

          <!-- Taxpayer Number (Company) -->
          <div v-if="form.accountType === 'company'">
            <label
              for="taxpayerNumber"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Taxpayer Number *
            </label>
            <div class="relative">
              <input
                v-model="form.taxpayerNumber"
                type="text"
                id="taxpayerNumber"
                required
                :class="[
                  'block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200',
                  form.taxpayerNumber && !isValidTaxpayerNumber
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300',
                ]"
                placeholder="123456789"
                @blur="validateTaxpayerNumber"
              />
              <div
                v-if="form.taxpayerNumber && !isValidTaxpayerNumber"
                class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
              >
                <ExclamationCircleIcon class="h-5 w-5 text-red-500" />
              </div>
            </div>
            <p
              v-if="form.taxpayerNumber && !isValidTaxpayerNumber"
              class="mt-1 text-sm text-red-600"
            >
              Taxpayer number is required
            </p>
          </div>

          <!-- Town -->
          <div>
            <label
              for="town"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Town{{ form.accountType === "company" ? " *" : "" }}
            </label>
            <div class="relative">
              <input
                v-model="form.town"
                type="text"
                id="town"
                :required="form.accountType === 'company'"
                :class="[
                  'block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200',
                  form.town && !isValidTown
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300',
                ]"
                placeholder="City"
                @blur="validateTown"
              />
              <div
                v-if="form.town && !isValidTown"
                class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
              >
                <ExclamationCircleIcon class="h-5 w-5 text-red-500" />
              </div>
            </div>
            <p
              v-if="form.town && !isValidTown"
              class="mt-1 text-sm text-red-600"
            >
              Town is required for companies
            </p>
            <p
              v-if="form.accountType === 'individual'"
              class="mt-1 text-sm text-gray-500"
            >
              Optional
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

          <!-- Commercial Register (Company, Optional) -->
          <div v-if="form.accountType === 'company'">
            <label
              for="commercialRegister"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Commercial Register
            </label>
            <div class="relative">
              <input
                v-model="form.commercialRegister"
                type="text"
                id="commercialRegister"
                :class="'block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200'"
                placeholder="RC 123456"
              />
            </div>
            <p class="mt-1 text-sm text-gray-500">Optional</p>
          </div>

          <!-- Address -->
          <div>
            <label
              for="address"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Address
            </label>
            <div class="relative">
              <input
                v-model="form.address"
                type="text"
                id="address"
                :class="'block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200'"
                placeholder="123 Main St"
              />
            </div>
            <p class="mt-1 text-sm text-gray-500">Optional</p>
          </div>

          <!-- PO Box (Company, Optional) -->
          <div v-if="form.accountType === 'company'">
            <label
              for="poBox"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              PO Box
            </label>
            <div class="relative">
              <input
                v-model="form.poBox"
                type="text"
                id="poBox"
                :class="'block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200'"
                placeholder="12345"
              />
            </div>
            <p class="mt-1 text-sm text-gray-500">Optional</p>
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
  UserIcon,
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
  accountType: "individual" as "individual" | "company",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  town: "",
  address: "",
  companyName: "",
  taxpayerNumber: "",
  commercialRegister: "",
  poBox: "",
});

const loading = ref(false);
const error = ref("");
const showPassword = ref(false);

// Validation states
const isValidFirstName = ref(true);
const isValidLastName = ref(true);
const isValidEmail = ref(true);
const isValidPassword = ref(true);
const isValidPhone = ref(true);
const isValidTown = ref(true);
const isValidCompanyName = ref(true);
const isValidTaxpayerNumber = ref(true);

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
  if (form.value.accountType === "individual") {
    return (
      form.value.firstName.trim().length > 0 &&
      form.value.lastName.trim().length > 0 &&
      isValidPhone.value &&
      isValidEmail.value &&
      isValidPassword.value
    );
  } else {
    return (
      form.value.companyName.trim().length > 0 &&
      form.value.taxpayerNumber.trim().length > 0 &&
      form.value.town.trim().length > 0 &&
      isValidEmail.value &&
      isValidPassword.value
    );
  }
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

function validatePhone() {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  isValidPhone.value = phoneRegex.test(form.value.phone);
}

function validateTown() {
  if (form.value.accountType === "company") {
    isValidTown.value = form.value.town.trim().length > 0;
  } else {
    isValidTown.value = true; // optional for individual
  }
}

function validateCompanyName() {
  isValidCompanyName.value = form.value.companyName.trim().length > 0;
}

function validateTaxpayerNumber() {
  isValidTaxpayerNumber.value = form.value.taxpayerNumber.trim().length > 0;
}

async function handleRegister() {
  // Validate all fields before submission
  if (form.value.accountType === "individual") {
    validateFirstName();
    validateLastName();
    validatePhone();
  } else {
    validateCompanyName();
    validateTaxpayerNumber();
    validateTown();
  }
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
