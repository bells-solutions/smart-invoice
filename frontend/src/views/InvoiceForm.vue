<template>
  <Layout>
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ isEdit ? "Edit Invoice" : "Create New Invoice" }}
          </h1>
          <p class="mt-2 text-gray-600">
            {{
              isEdit
                ? "Update invoice details and items"
                : "Fill in the details to create a professional invoice"
            }}
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <div class="text-right">
            <div class="text-sm text-gray-500">Invoice #</div>
            <div class="text-lg font-semibold text-gray-900">
              {{ isEdit ? "Editing" : "Auto-generated" }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <form @submit.prevent="saveInvoice" class="space-y-8">
      <!-- Invoice Details Section -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div
          class="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <DocumentTextIcon class="h-6 w-6 text-blue-600" />
            </div>
            <h3 class="ml-3 text-lg font-medium text-gray-900">
              Invoice Details
            </h3>
          </div>
        </div>

        <div class="px-6 py-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Client Selection -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                <span class="flex items-center">
                  <UserIcon class="h-4 w-4 mr-1 text-gray-400" />
                  Client *
                </span>
              </label>
              <select
                v-model="form.clientId"
                required
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="">Select a client</option>
                <option
                  v-for="client in clients"
                  :key="client.id"
                  :value="client.id"
                >
                  {{ client.name }}
                </option>
              </select>
            </div>

            <!-- Invoice Type -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                <span class="flex items-center">
                  <DocumentTextIcon class="h-4 w-4 mr-1 text-gray-400" />
                  Invoice Type
                </span>
              </label>
              <select
                v-model="form.type"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="normal">📄 Normal Invoice</option>
                <option value="proforma">📋 Proforma Invoice</option>
              </select>
            </div>

            <!-- Status -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                <span class="flex items-center">
                  <CheckCircleIcon class="h-4 w-4 mr-1 text-gray-400" />
                  Status
                </span>
              </label>
              <select
                v-model="form.status"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="draft">📝 Draft</option>
                <option value="sent">📤 Sent</option>
                <option value="paid">💰 Paid</option>
                <option value="overdue">⚠️ Overdue</option>
              </select>
            </div>

            <!-- Issue Date -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                <span class="flex items-center">
                  <CalendarDaysIcon class="h-4 w-4 mr-1 text-gray-400" />
                  Issue Date *
                </span>
              </label>
              <input
                v-model="form.issueDate"
                type="date"
                required
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>

            <!-- Due Date -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                <span class="flex items-center">
                  <ClockIcon class="h-4 w-4 mr-1 text-gray-400" />
                  Due Date *
                </span>
              </label>
              <input
                v-model="form.dueDate"
                type="date"
                required
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>

            <!-- TVA Tax Section -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="block text-sm font-medium text-gray-700">
                  <span class="flex items-center">
                    <ReceiptPercentIcon class="h-4 w-4 mr-1 text-gray-400" />
                    TVA Tax
                  </span>
                </label>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="form.tvaEnabled"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                  <span class="ml-3 text-sm font-medium text-gray-900"
                    >Enable TVA</span
                  >
                </label>
              </div>
              <div v-if="form.tvaEnabled" class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-500 mb-1"
                    >TVA Rate (%)</label
                  >
                  <input
                    v-model.number="form.tvaRate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="19.25"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1"
                    >TVA Amount</label
                  >
                  <div
                    class="flex items-center h-10 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                  >
                    <span class="text-gray-900 font-medium"
                      >${{ calculateTva().toFixed(2) }}</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- IR Tax Section -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="block text-sm font-medium text-gray-700">
                  <span class="flex items-center">
                    <ReceiptPercentIcon class="h-4 w-4 mr-1 text-gray-400" />
                    IR Tax
                  </span>
                </label>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="form.irEnabled"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                  <span class="ml-3 text-sm font-medium text-gray-900"
                    >Enable IR</span
                  >
                </label>
              </div>
              <div v-if="form.irEnabled" class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-500 mb-1"
                    >IR Rate (%)</label
                  >
                  <input
                    v-model.number="form.irRate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="5.5"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1"
                    >IR Amount</label
                  >
                  <div
                    class="flex items-center h-10 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                  >
                    <span class="text-gray-900 font-medium"
                      >${{ calculateIr().toFixed(2) }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoice Items Section -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div
          class="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <QueueListIcon class="h-6 w-6 text-green-600" />
              </div>
              <h3 class="ml-3 text-lg font-medium text-gray-900">
                Invoice Items
              </h3>
            </div>
            <button
              type="button"
              @click="addItem"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Item
            </button>
          </div>
        </div>

        <div class="px-6 py-6">
          <!-- Items Header -->
          <div
            class="hidden md:grid grid-cols-12 gap-4 mb-4 text-sm font-medium text-gray-500 border-b border-gray-200 pb-2"
          >
            <div class="col-span-5">Description</div>
            <div class="col-span-2 text-center">Quantity</div>
            <div class="col-span-2 text-center">Unit Price</div>
            <div class="col-span-2 text-center">Amount</div>
            <div class="col-span-1"></div>
          </div>

          <!-- Items List -->
          <div class="space-y-4">
            <div
              v-for="(item, index) in form.items"
              :key="index"
              class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors duration-200"
            >
              <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <!-- Description -->
                <div class="col-span-1 md:col-span-5">
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 md:hidden"
                    >Description *</label
                  >
                  <input
                    v-model="item.description"
                    type="text"
                    placeholder="Item description"
                    required
                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                  />
                </div>

                <!-- Quantity -->
                <div class="col-span-1 md:col-span-2">
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 md:hidden"
                    >Quantity *</label
                  >
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    placeholder="1"
                    min="1"
                    required
                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 text-center"
                  />
                </div>

                <!-- Unit Price -->
                <div class="col-span-1 md:col-span-2">
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 md:hidden"
                    >Unit Price *</label
                  >
                  <div class="relative">
                    <span class="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      v-model.number="item.unitPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      min="0"
                      required
                      class="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 text-right"
                    />
                  </div>
                </div>

                <!-- Amount -->
                <div class="col-span-1 md:col-span-2">
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 md:hidden"
                    >Amount</label
                  >
                  <div
                    class="flex items-center justify-center h-10 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                  >
                    <span class="text-gray-900 font-medium"
                      >${{ (item.quantity * item.unitPrice).toFixed(2) }}</span
                    >
                  </div>
                </div>

                <!-- Remove Button -->
                <div class="col-span-1 md:col-span-1 flex justify-center">
                  <button
                    type="button"
                    @click="removeItem(index)"
                    class="inline-flex items-center justify-center w-8 h-8 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                    :disabled="form.items.length === 1"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Item Button (Mobile) -->
          <div class="mt-4 md:hidden">
            <button
              type="button"
              @click="addItem"
              class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Another Item
            </button>
          </div>
        </div>
      </div>
      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2">Notes</label>
        <textarea
          v-model="form.notes"
          rows="3"
          class="shadow border rounded w-full py-2 px-3 text-gray-700"
        ></textarea>
      </div>

      <div class="border-t pt-4 mb-6">
        <div class="flex justify-end space-y-2">
          <div class="w-64">
            <div class="flex justify-between mb-2">
              <span class="text-gray-700">Subtotal:</span>
              <span class="font-bold"
                >${{ calculateSubtotal().toFixed(2) }}</span
              >
            </div>
            <div v-if="form.tvaEnabled" class="flex justify-between mb-2">
              <span class="text-gray-700">TVA ({{ form.tvaRate }}%):</span>
              <span class="font-bold">${{ calculateTva().toFixed(2) }}</span>
            </div>
            <div v-if="form.irEnabled" class="flex justify-between mb-2">
              <span class="text-gray-700">IR ({{ form.irRate }}%):</span>
              <span class="font-bold">${{ calculateIr().toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-lg">
              <span class="text-gray-700 font-bold">Total:</span>
              <span class="font-bold">${{ calculateTotal().toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div
        class="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6"
      >
        <router-link
          to="/invoices"
          class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
        >
          <ArrowLeftIcon class="h-4 w-4 mr-2" />
          Cancel
        </router-link>
        <button
          type="submit"
          :disabled="isSaving"
          class="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <svg
            v-if="isSaving"
            class="animate-spin h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <CheckIcon v-else class="h-4 w-4 mr-2" />
          {{
            isSaving
              ? "Saving..."
              : isEdit
              ? "Update Invoice"
              : "Create Invoice"
          }}
        </button>
      </div>
    </form>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { clientService } from "@/services/clients";
import { invoiceService } from "@/services/invoices";
import type { Client, InvoiceItem, InvoiceStatus, InvoiceType } from "@/types";
import Layout from "@/components/Layout.vue";
import {
  DocumentTextIcon,
  UserIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ClockIcon,
  ReceiptPercentIcon,
  QueueListIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  CheckIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const route = useRoute();

const clients = ref<Client[]>([]);
const isEdit = computed(() => !!route.params.id);
const isSaving = ref(false);

const form = ref({
  clientId: "",
  type: "normal" as InvoiceType,
  status: "draft" as InvoiceStatus,
  issueDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  tvaEnabled: false,
  tvaRate: 19.25,
  irEnabled: false,
  irRate: 5.5,
  notes: "",
  items: [] as InvoiceItem[],
});

onMounted(async () => {
  try {
    clients.value = await clientService.getAll();

    if (isEdit.value) {
      const invoice = await invoiceService.getOne(route.params.id as string);
      form.value = {
        clientId: invoice.clientId,
        type: invoice.type,
        status: invoice.status,
        issueDate: invoice.issueDate.split("T")[0],
        dueDate: invoice.dueDate.split("T")[0],
        tvaEnabled: invoice.tvaEnabled,
        tvaRate: invoice.tvaRate,
        irEnabled: invoice.irEnabled,
        irRate: invoice.irRate,
        notes: invoice.notes || "",
        items: invoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };
    } else {
      addItem();
    }
  } catch (error) {
    console.error("Failed to load data:", error);
  }
});

function addItem() {
  form.value.items.push({
    description: "",
    quantity: 1,
    unitPrice: 0,
  });
}

function removeItem(index: number) {
  form.value.items.splice(index, 1);
}

function calculateSubtotal() {
  return form.value.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
}

function calculateTva() {
  return form.value.tvaEnabled
    ? (calculateSubtotal() * form.value.tvaRate) / 100
    : 0;
}

function calculateIr() {
  return form.value.irEnabled
    ? (calculateSubtotal() * form.value.irRate) / 100
    : 0;
}

function calculateTotal() {
  return calculateSubtotal() + calculateTva(); // IR doesn't affect the total, only displayed when enabled
}

async function saveInvoice() {
  try {
    isSaving.value = true;
    // Build a plain payload to avoid sending reactive proxies
    const payload = {
      clientId: form.value.clientId,
      type: form.value.type,
      status: form.value.status,
      issueDate: form.value.issueDate,
      dueDate: form.value.dueDate,
      tvaEnabled: form.value.tvaEnabled,
      tvaRate: form.value.tvaRate,
      irEnabled: form.value.irEnabled,
      irRate: form.value.irRate,
      notes: form.value.notes,
      items: form.value.items.map((it) => ({
        description: it.description,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
      })),
    };

    if (isEdit.value) {
      await invoiceService.update(route.params.id as string, payload);
    } else {
      await invoiceService.create(payload);
    }
    router.push("/invoices");
  } catch (error) {
    console.error("Failed to save invoice:", error);
  } finally {
    isSaving.value = false;
  }
}
</script>
