<template>
  <Layout>
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div class="mb-4 sm:mb-0">
          <h1 class="text-3xl font-bold text-gray-900">
            {{ $t("profile.title") }}
          </h1>
          <p class="mt-1 text-gray-600">
            {{ $t("profile.description") }}
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <div class="text-sm text-gray-500">
            {{ $t("profile.account") }}:
            <span class="font-medium text-gray-700 capitalize">{{
              user?.accountType
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Card -->
    <div class="max-w-4xl mx-auto">
      <div
        class="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100"
      >
        <!-- Header -->
        <div
          class="px-8 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0 relative">
              <div
                v-if="user?.profilePicture"
                class="h-32 w-32 rounded-full overflow-hidden border-4 border-white/30"
              >
                <img
                  :src="user.profilePicture"
                  :alt="user.firstName || 'Profile'"
                  class="h-full w-full object-cover"
                />
              </div>
              <div
                v-else
                class="h-32 w-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <UserIcon class="h-28 w-28 text-white" />
              </div>
              <!-- Upload button overlay -->
              <label
                for="profile-picture-upload"
                :class="[
                  'absolute inset-0 flex h-32 w-32 items-center justify-center bg-black/40 rounded-full transition-opacity cursor-pointer',
                  profilePictureUploading
                    ? 'opacity-100'
                    : 'opacity-0 hover:opacity-100',
                ]"
              >
                <ArrowPathIcon
                  v-if="profilePictureUploading"
                  class="h-6 w-6 text-white animate-spin"
                />
                <CloudArrowUpIcon v-else class="h-6 w-6 text-white" />
              </label>
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                @change="handleProfilePictureUpload"
                :disabled="profilePictureUploading"
                class="hidden"
              />
            </div>
            <div class="ml-6">
              <h2 class="text-2xl font-bold text-white">
                {{ user?.firstName }} {{ user?.lastName || user?.companyName }}
              </h2>
              <p class="text-blue-100">{{ user?.email }}</p>
              <div v-if="user?.profilePicture" class="mt-2">
                <button
                  @click="handleDeleteProfilePicture"
                  :disabled="profilePictureUploading"
                  type="button"
                  class="text-sm bg-blue-300 p-2 rounded-xl text-red-200 hover:cursor-pointer hover:text-red-100 transition-colors disabled:opacity-50"
                >
                  {{
                    profilePictureUploading
                      ? $t("common.loading")
                      : $t("profile.removeProfilePicture")
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="p-8">
          <form @submit.prevent="handleUpdate" class="space-y-8">
            <!-- Success Message -->
            <div
              v-if="success"
              class="rounded-xl bg-green-50 p-6 border border-green-200 shadow-sm"
            >
              <div class="flex">
                <div class="flex-shrink-0">
                  <CheckCircleIcon class="h-6 w-6 text-green-400" />
                </div>
                <div class="ml-4">
                  <h3 class="text-sm font-medium text-green-800">
                    {{ $t("profile.success") }}
                  </h3>
                  <p class="text-sm text-green-700 mt-1">{{ success }}</p>
                </div>
              </div>
            </div>

            <!-- Error Alert -->
            <div
              v-if="error"
              class="rounded-xl bg-red-50 p-6 border border-red-200 shadow-sm"
            >
              <div class="flex">
                <div class="flex-shrink-0">
                  <ExclamationCircleIcon class="h-6 w-6 text-red-400" />
                </div>
                <div class="ml-4">
                  <h3 class="text-sm font-medium text-red-800">
                    {{ $t("profile.error") }}
                  </h3>
                  <p class="text-sm text-red-700 mt-1">{{ error }}</p>
                </div>
              </div>
            </div>

            <!-- Account Type Section -->
            <div class="bg-gray-50 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                {{ $t("profile.accountType") }}
              </h3>
              <div class="flex items-center space-x-4">
                <div class="flex items-center">
                  <div
                    :class="[
                      'flex h-12 w-12 items-center justify-center rounded-full',
                      user?.accountType === 'individual'
                        ? 'bg-blue-500 text-white'
                        : 'bg-purple-500 text-white',
                    ]"
                  >
                    <component
                      :is="
                        user?.accountType === 'individual'
                          ? UserIcon
                          : BuildingOfficeIcon
                      "
                      class="h-6 w-6"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="font-semibold text-lg capitalize">
                      {{ user?.accountType }}
                    </div>
                    <div class="text-sm text-gray-600">
                      {{
                        user?.accountType === "individual"
                          ? $t("profile.personalAccountDescription")
                          : $t("profile.businessAccountDescription")
                      }}
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg
                      class="h-5 w-5 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-blue-700">
                      {{ $t("profile.accountTypeChangeNote") }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Personal Information Section -->
            <div
              v-if="user?.accountType === 'individual'"
              class="bg-gray-50 rounded-xl p-6"
            >
              <h3 class="text-lg font-semibold text-gray-900 mb-6">
                {{ $t("profile.personalInformation") }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    for="firstName"
                    class="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {{ $t("profile.firstNameRequired") }}
                  </label>
                  <input
                    id="firstName"
                    v-model="form.firstName"
                    type="text"
                    required
                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label
                    for="lastName"
                    class="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {{ $t("profile.lastNameRequired") }}
                  </label>
                  <input
                    id="lastName"
                    v-model="form.lastName"
                    type="text"
                    required
                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter your last name"
                  />
                </div>
                <!-- <div class="md:col-span-2">
                  <label
                    for="phone"
                    class="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email *
                  </label>
                  <input
                    id="phone"
                    v-model="form"
                    type="tel"
                    required
                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter your phone number"
                  />
                </div> -->
                <div class="md:col-span-2">
                  <label
                    for="phone"
                    class="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {{ $t("profile.phoneNumberRequired") }}
                  </label>
                  <input
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    required
                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            <!-- Company Information Section -->
            <div
              v-if="user?.accountType === 'company'"
              class="bg-gray-50 rounded-xl p-6"
            >
              <h3 class="text-lg font-semibold text-gray-900 mb-6">
                {{ $t("profile.companyInformation") }}
              </h3>
              <div class="space-y-6">
                <div>
                  <label
                    for="companyName"
                    class="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {{ $t("profile.companyNameRequired") }}
                  </label>
                  <input
                    id="companyName"
                    v-model="form.companyName"
                    type="text"
                    required
                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter your company name"
                  />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      for="taxpayerNumber"
                      class="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {{ $t("profile.taxpayerNumberRequired") }}
                    </label>
                    <input
                      id="taxpayerNumber"
                      v-model="form.taxpayerNumber"
                      type="text"
                      required
                      class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Enter taxpayer number"
                    />
                  </div>
                  <div>
                    <label
                      for="commercialRegister"
                      class="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {{ $t("profile.commercialRegister") }}
                    </label>
                    <input
                      id="commercialRegister"
                      v-model="form.commercialRegister"
                      type="text"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Enter commercial register"
                    />
                  </div>
                  <div>
                    <label
                      for="town"
                      class="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {{ $t("profile.townRequired") }}
                    </label>
                    <input
                      id="town"
                      v-model="form.town"
                      type="text"
                      required
                      class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Enter town"
                    />
                  </div>
                  <div>
                    <label
                      for="poBox"
                      class="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {{ $t("profile.poBox") }}
                    </label>
                    <input
                      id="poBox"
                      v-model="form.poBox"
                      type="text"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Enter PO box"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Address Section -->
            <div class="bg-gray-50 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                {{ $t("profile.addressInformation") }}
              </h3>
              <div>
                <label
                  for="address"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  {{ $t("profile.fullAddress") }}
                </label>
                <textarea
                  id="address"
                  v-model="form.address"
                  rows="4"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your full address"
                ></textarea>
              </div>
            </div>

            <!-- Currency Section -->
            <div class="bg-gray-50 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                {{ $t("profile.currencySettings") }}
              </h3>
              <div>
                <label
                  for="currency"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  {{ $t("profile.preferredCurrency") }}
                </label>
                <select
                  id="currency"
                  v-model="form.currency"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="USD">{{ $t("profile.currency.usd") }}</option>
                  <option value="EUR">{{ $t("profile.currency.eur") }}</option>
                  <option value="XAF">{{ $t("profile.currency.xaf") }}</option>
                </select>
              </div>
            </div>

            <!-- Language Section -->
            <div class="bg-gray-50 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                {{ $t("profile.languageSettings") }}
              </h3>
              <div>
                <label
                  for="language"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  {{ $t("profile.preferredLanguage") }}
                </label>
                <select
                  id="language"
                  v-model="form.language"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="en">{{ $t("profile.language.en") }}</option>
                  <option value="fr">{{ $t("profile.language.fr") }}</option>
                </select>
              </div>
            </div>

            <!-- Submit Section -->
            <div
              class="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200"
            >
              <button
                type="button"
                @click="resetForm"
                class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200"
              >
                {{ $t("profile.resetChanges") }}
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
              >
                <ArrowPathIcon
                  v-if="loading"
                  class="animate-spin -ml-1 mr-3 h-5 w-5"
                />
                <CloudArrowUpIcon v-else class="w-5 h-5 mr-2" />
                {{
                  loading ? $t("profile.updating") : $t("profile.saveChanges")
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import Layout from "@/components/Layout.vue";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
} from "@heroicons/vue/24/outline";

const { t } = useI18n();

const authStore = useAuthStore();

const user = computed(() => authStore.user);

const form = ref({
  firstName: "",
  lastName: "",
  phone: "",
  town: "",
  address: "",
  companyName: "",
  taxpayerNumber: "",
  commercialRegister: "",
  poBox: "",
  currency: "USD",
  language: "en",
});

const loading = ref(false);
const error = ref("");
const success = ref("");
const profilePictureUploading = ref(false);

function initializeForm() {
  const currentUser = authStore.user;
  if (currentUser) {
    form.value = {
      firstName: currentUser.firstName || "",
      lastName: currentUser.lastName || "",
      phone: currentUser.phone || "",
      town: currentUser.town || "",
      address: currentUser.address || "",
      companyName: currentUser.companyName || "",
      taxpayerNumber: currentUser.taxpayerNumber || "",
      commercialRegister: currentUser.commercialRegister || "",
      poBox: currentUser.poBox || "",
      currency: currentUser.currency || "USD",
      language: currentUser.language || "en",
    };
  }
}

function resetForm() {
  initializeForm();
  error.value = "";
  success.value = "";
}

async function handleUpdate() {
  loading.value = true;
  error.value = "";
  success.value = "";

  try {
    const updateData: any = { ...form.value };
    // Remove empty strings and convert to undefined
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === "") {
        updateData[key] = undefined;
      }
    });

    await authStore.updateProfile(updateData);
    success.value = t("profile.profileUpdated");
  } catch (err: any) {
    error.value = err.message || t("profile.updateFailed");
  } finally {
    loading.value = false;
  }
}

async function handleProfilePictureUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // Validate file type
  if (!file.type.startsWith("image/")) {
    error.value = t("profile.invalidFileType");
    return;
  }

  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    error.value = t("profile.fileTooLarge");
    return;
  }

  profilePictureUploading.value = true;
  error.value = "";
  success.value = "";

  try {
    await authStore.uploadProfilePicture(file);
    success.value = t("profile.profilePictureUpdated");
  } catch (err: any) {
    error.value = err.message || t("profile.profilePictureUploadFailed");
  } finally {
    profilePictureUploading.value = false;
    // Reset the input
    target.value = "";
  }
}

async function handleDeleteProfilePicture() {
  if (!confirm(t("profile.confirmDeleteProfilePicture"))) {
    return;
  }

  profilePictureUploading.value = true;
  error.value = "";
  success.value = "";

  try {
    await authStore.deleteProfilePicture();
    success.value = t("profile.profilePictureDeleted");
  } catch (err: any) {
    error.value = err.message || t("profile.profilePictureDeleteFailed");
  } finally {
    profilePictureUploading.value = false;
  }
}

// setTimeout for error and success messages
setTimeout(() => {
  if (error.value) error.value = "";
  if (success.value) success.value = "";
}, 4000);

onMounted(() => {
  initializeForm();
});
</script>
