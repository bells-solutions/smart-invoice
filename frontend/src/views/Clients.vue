<template>
  <Layout>
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div class="mb-4 sm:mb-0">
          <h1 class="text-3xl font-bold text-gray-900">
            {{ $t("clients.title") }}
          </h1>
          <p class="mt-1 text-gray-600">
            {{ $t("clients.description") }}
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="showForm = true"
            class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <UserPlusIcon class="w-5 h-5 mr-2" />
            {{ $t("clients.addNewClient") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
      <span class="ml-3 text-gray-600">{{ $t("clients.loadingClients") }}</span>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="clients.length === 0"
      class="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100"
    >
      <div
        class="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6"
      >
        <UsersIcon class="w-12 h-12 text-blue-600" />
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">
        {{ $t("clients.noClientsYet") }}
      </h3>
      <p class="text-gray-600 mb-6">
        {{ $t("clients.noClientsDescription") }}
      </p>
      <button
        @click="showForm = true"
        class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
      >
        <UserPlusIcon class="w-5 h-5 mr-2" />
        {{ $t("clients.addFirstClient") }}
      </button>
    </div>

    <!-- Clients Table -->
    <div
      v-else
      class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
    >
      <!-- Table Header -->
      <div
        class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ $t("clients.title") }}
          </h3>
          <div class="text-sm text-gray-600">
            {{ clients.length }} client{{ clients.length !== 1 ? "s" : "" }}
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                <div class="flex items-center">
                  <UserIcon class="w-4 h-4 mr-1 text-gray-400" />
                  {{ $t("clients.name") }}
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {{ $t("clients.type") }}
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                <div class="flex items-center">
                  <EnvelopeIcon class="w-4 h-4 mr-1 text-gray-400" />
                  {{ $t("clients.email") }}
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                <div class="flex items-center">
                  <PhoneIcon class="w-4 h-4 mr-1 text-gray-400" />
                  {{ $t("clients.phone") }}
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                <div class="flex items-center">
                  <MapPinIcon class="w-4 h-4 mr-1 text-gray-400" />
                  {{ $t("clients.location") }}
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {{ $t("clients.actions") }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="client in clients"
              :key="client.id"
              class="hover:bg-gray-50 transition-colors duration-200"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div
                      class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-white">
                        {{ client.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ client.name }}
                    </div>
                    <div
                      v-if="
                        client.clientType === 'company' && client.companyName
                      "
                      class="text-xs text-gray-500"
                    >
                      {{ client.companyName }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      client.clientType === 'individual'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800',
                    ]"
                  >
                    <component
                      :is="
                        client.clientType === 'individual'
                          ? UserIcon
                          : BuildingOfficeIcon
                      "
                      class="w-3 h-3 mr-1"
                    />
                    {{
                      client.clientType === "individual"
                        ? $t("register.individual")
                        : $t("register.company")
                    }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <EnvelopeIcon class="w-4 h-4 mr-2 text-gray-400" />
                  <div class="text-sm text-gray-900">{{ client.email }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <PhoneIcon class="w-4 h-4 mr-2 text-gray-400" />
                  <div class="text-sm text-gray-900">
                    {{ client.phone || "-" }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <MapPinIcon class="w-4 h-4 mr-2 text-gray-400" />
                  <div class="text-sm text-gray-900">
                    {{
                      client.city || client.country
                        ? `${client.city || ""}${
                            client.city && client.country ? ", " : ""
                          }${client.country || ""}`
                        : "-"
                    }}
                  </div>
                </div>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium"
              >
                <div class="flex items-center justify-start space-x-2">
                  <button
                    @click="editClient(client)"
                    class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors duration-200"
                  >
                    <PencilIcon class="w-4 h-4 mr-1" />
                    {{ $t("clients.edit") }}
                  </button>
                  <button
                    @click="deleteClient(client.id)"
                    class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors duration-200"
                  >
                    <TrashIcon class="w-4 h-4 mr-1" />
                    {{ $t("clients.delete") }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Client Form Modal -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-gray-600/70 bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 flex flex-col max-h-[90vh]"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 pb-4 flex-shrink-0">
          <div class="flex items-center">
            <div class="bg-blue-100 p-2 rounded-lg mr-3">
              <UserPlusIcon class="w-6 h-6 text-blue-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900">
              {{
                editingClient
                  ? $t("clients.editClient")
                  : $t("clients.addClient")
              }}
            </h3>
          </div>
          <button
            @click="closeForm"
            class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Scrollable Form Content -->
        <div class="flex-1 overflow-y-auto px-6 pb-4">
          <form @submit.prevent="saveClient" class="space-y-4">
            <!-- Client Type Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                {{ $t("clients.clientTypeRequired") }}
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="form.clientType = 'individual'"
                  :class="[
                    'flex items-center justify-center px-4 py-3 border rounded-lg transition-all duration-200',
                    form.clientType === 'individual'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                  ]"
                >
                  <UserIcon class="w-5 h-5 mr-2" />
                  Individual
                </button>
                <button
                  type="button"
                  @click="form.clientType = 'company'"
                  :class="[
                    'flex items-center justify-center px-4 py-3 border rounded-lg transition-all duration-200',
                    form.clientType === 'company'
                      ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                  ]"
                >
                  <BuildingOfficeIcon class="w-5 h-5 mr-2" />
                  Company
                </button>
              </div>
            </div>

            <!-- Individual Fields -->
            <div v-if="form.clientType === 'individual'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t("clients.fullNameRequired") }}
                </label>
                <div class="relative">
                  <div
                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  >
                    <UserIcon class="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            </div>

            <!-- Company Fields -->
            <div v-if="form.clientType === 'company'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t("register.companyNameRequired") }}
                </label>
                <div class="relative">
                  <div
                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  >
                    <BuildingOfficeIcon class="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    v-model="form.companyName"
                    type="text"
                    required
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="ABC Corporation"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t("clients.contactPersonName") }}
                </label>
                <div class="relative">
                  <div
                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  >
                    <UserIcon class="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    v-model="form.name"
                    type="text"
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="John Smith"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t("register.taxpayerNumber") }}
                </label>
                <input
                  v-model="form.taxpayerNumber"
                  type="text"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="123456789"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t("register.commercialRegister") }}
                </label>
                <input
                  v-model="form.commercialRegister"
                  type="text"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="CR123456"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t("clients.clientEmailRequired") }}
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <EnvelopeIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="client@example.com"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t("clients.phone") }}
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <PhoneIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="form.phone"
                  type="text"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t("register.address") }}
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <MapPinIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="form.address"
                  type="text"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="123 Main St"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t("clients.city") }}
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <BuildingOfficeIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="form.city"
                  type="text"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="New York"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t("clients.country") }}
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <GlobeAmericasIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="form.country"
                  type="text"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="United States"
                />
              </div>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeForm"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <XMarkIcon class="w-4 h-4 mr-2" />
                {{ $t("common.cancel") }}
              </button>
              <button
                type="submit"
                class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <CheckIcon class="w-4 h-4 mr-2" />
                {{
                  editingClient
                    ? $t("clients.update")
                    : $t("clients.saveClient")
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
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { clientService } from "@/services/clients";
import type { Client } from "@/types";
import Layout from "@/components/Layout.vue";
import {
  UserPlusIcon,
  UserIcon,
  UsersIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  GlobeAmericasIcon,
  XMarkIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";

const { t } = useI18n();

const clients = ref<Client[]>([]);
const loading = ref(true);
const showForm = ref(false);
const editingClient = ref<Client | null>(null);

const form = ref({
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  clientType: "individual" as "individual" | "company",
  companyName: "",
  taxpayerNumber: "",
  commercialRegister: "",
});

onMounted(async () => {
  await loadClients();
});

async function loadClients() {
  try {
    clients.value = await clientService.getAll();
  } catch (error) {
    console.error("Failed to load clients:", error);
  } finally {
    loading.value = false;
  }
}

function editClient(client: Client) {
  editingClient.value = client;
  form.value = {
    name: client.name,
    email: client.email,
    phone: client.phone || "",
    address: client.address || "",
    city: client.city || "",
    country: client.country || "",
    clientType: client.clientType || "individual",
    companyName: client.companyName || "",
    taxpayerNumber: client.taxpayerNumber || "",
    commercialRegister: client.commercialRegister || "",
  };
  showForm.value = true;
}

async function saveClient() {
  try {
    if (editingClient.value) {
      await clientService.update(editingClient.value.id, form.value);
    } else {
      await clientService.create(form.value);
    }
    await loadClients();
    closeForm();
  } catch (error) {
    console.error("Failed to save client:", error);
  }
}

async function deleteClient(id: string) {
  if (!confirm(t("clients.deleteClientConfirm"))) return;

  try {
    await clientService.delete(id);
    await loadClients();
  } catch (error) {
    console.error("Failed to delete client:", error);
  }
}

function closeForm() {
  showForm.value = false;
  editingClient.value = null;
  form.value = {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    clientType: "individual",
    companyName: "",
    taxpayerNumber: "",
    commercialRegister: "",
  };
}
</script>
