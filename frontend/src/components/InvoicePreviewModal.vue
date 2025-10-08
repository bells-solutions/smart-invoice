<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/70 bg-opacity-50"
        @click.self="close"
      >
        <Transition
          enter-active-class="transition-all duration-300"
          leave-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
          >
            <!-- Modal Header -->
            <div
              class="flex items-center justify-between p-6 border-b border-gray-200"
            >
              <div>
                <h2 class="text-2xl font-bold text-gray-900">
                  {{ t("invoices.preview.title") }}
                </h2>
                <p class="text-gray-600">
                  {{ t("invoices.invoiceNumber") }} {{ invoice?.invoiceNumber }}
                </p>
              </div>
              <div class="flex items-center space-x-3">
                <button
                  @click="downloadPDF"
                  class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                  :disabled="downloading"
                >
                  <ArrowDownTrayIcon v-if="!downloading" class="w-4 h-4 mr-2" />
                  <ArrowPathIcon v-else class="w-4 h-4 mr-2 animate-spin" />
                  {{
                    downloading
                      ? t("invoices.preview.downloading")
                      : t("invoices.preview.downloadPDF")
                  }}
                </button>
                <button
                  @click="close"
                  class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <XMarkIcon class="w-6 h-6" />
                </button>
              </div>
            </div>

            <!-- Modal Content -->
            <div class="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
              <div
                v-if="loading"
                class="flex items-center justify-center py-12"
              >
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
                ></div>
                <span class="ml-3 text-gray-600">{{
                  t("invoices.preview.loading")
                }}</span>
              </div>

              <div v-else-if="invoice" class="space-y-8">
                <!-- Invoice Header -->
                <div
                  class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="text-2xl font-bold text-gray-900 mb-2">
                        {{ t("invoices.preview.invoice") }}
                        {{
                          invoice.type == InvoiceType.PROFORMA
                            ? "Proforma".toUpperCase()
                            : ""
                        }}
                      </h3>
                      <p
                        v-if="invoice.type !== InvoiceType.PROFORMA"
                        class="text-gray-600"
                      >
                        {{ t("invoices.invoiceNumber") }}
                        {{ invoice.invoiceNumber }}
                      </p>
                      <p class="text-gray-600">
                        {{ t("invoices.preview.issueDate") }}
                        {{ formatDate(invoice.issueDate) }}
                      </p>
                      <p class="text-gray-600">
                        {{ t("invoices.preview.dueDate") }}
                        {{ formatDate(invoice.dueDate) }}
                      </p>
                    </div>
                    <div class="text-right">
                      <span
                        :class="[
                          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'sent'
                            ? 'bg-blue-100 text-blue-800'
                            : invoice.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800',
                        ]"
                      >
                        {{
                          invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)
                        }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Client Information -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="bg-gray-50 rounded-lg p-6">
                    <h4 class="text-lg font-semibold text-gray-900 mb-4">
                      {{ t("invoices.preview.from") }}
                    </h4>
                    <div class="text-gray-600">
                      <p class="font-medium">
                        {{
                          user?.companyName ||
                          user?.firstName + " " + user?.lastName
                        }}
                      </p>
                      <p>{{ user?.address }}</p>

                      <p>{{ user?.email }}</p>
                      <p>{{ user?.phone }}</p>
                    </div>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-6">
                    <h4 class="text-lg font-semibold text-gray-900 mb-4">
                      {{ t("invoices.preview.billTo") }}
                    </h4>
                    <div v-if="invoice.client" class="text-gray-600">
                      <p class="font-medium">{{ invoice.client.name }}</p>
                      <p v-if="invoice.client.address">
                        {{ invoice.client.address }}
                      </p>
                      <p v-if="invoice.client.city">
                        {{ invoice.client.city }}, {{ invoice.client.country }}
                      </p>
                      <p>{{ invoice.client.email }}</p>
                      <p v-if="invoice.client.phone">
                        {{ invoice.client.phone }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Invoice Items -->
                <div
                  class="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {{ t("invoices.preview.table.description") }}
                        </th>
                        <th
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {{ t("invoices.preview.table.quantity") }}
                        </th>
                        <th
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {{ t("invoices.preview.table.unitPrice") }}
                        </th>
                        <th
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {{ t("invoices.preview.table.amount") }}
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="item in invoice.items" :key="item.id">
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {{ item.description }}
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {{ item.quantity }}
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {{ formatAmount(item.unitPrice) }}
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                        >
                          {{ formatAmount(item.quantity * item.unitPrice) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Invoice Summary -->
                <div class="bg-gray-50 rounded-lg p-6">
                  <div class="flex justify-end">
                    <div class="w-64 space-y-2">
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600">{{
                          t("invoices.preview.summary.subtotal")
                        }}</span>
                        <span class="font-medium">{{
                          formatAmount(invoice.subtotal)
                        }}</span>
                      </div>
                      <div
                        v-if="invoice.tvaEnabled"
                        class="flex justify-between text-sm"
                      >
                        <span class="text-gray-600">{{
                          t("invoices.preview.summary.tva", {
                            rate: invoice.tvaRate,
                          })
                        }}</span>
                        <span class="font-medium">{{
                          formatAmount(invoice.tvaAmount)
                        }}</span>
                      </div>
                      <div
                        v-if="invoice.irEnabled"
                        class="flex justify-between text-sm"
                      >
                        <span class="text-gray-600">{{
                          t("invoices.preview.summary.ir", {
                            rate: invoice.irRate,
                          })
                        }}</span>
                        <span class="font-medium">{{
                          formatAmount(invoice.irAmount)
                        }}</span>
                      </div>
                      <div
                        v-if="invoice.discountEnabled"
                        class="flex justify-between text-sm"
                      >
                        <span class="text-gray-600">{{
                          t("invoices.preview.summary.discount", {
                            rate: invoice.discountRate,
                          })
                        }}</span>
                        <span class="font-medium text-red-600"
                          >-{{ formatAmount(invoice.discountAmount) }}</span
                        >
                      </div>
                      <div
                        class="border-t border-gray-300 pt-2 flex justify-between text-lg font-bold"
                      >
                        <span>{{ t("invoices.preview.summary.total") }}</span>
                        <span>{{ formatAmount(invoice.total) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Notes -->
                <div v-if="invoice.notes" class="bg-blue-50 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-2">
                    {{ t("invoices.preview.notes") }}
                  </h4>
                  <p class="text-gray-700">{{ invoice.notes }}</p>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { invoiceService } from "@/services/invoices";
import { useCurrency } from "@/composables/useCurrency";
import { InvoiceType, type Invoice } from "@/types";
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import { authService } from "@/services/auth";

const { t } = useI18n();

interface Props {
  isOpen: boolean;
  invoiceId: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const invoice = ref<Invoice | null>(null);
const loading = ref(false);
const downloading = ref(false);
const user = authService.getUser();

const { formatAmount } = useCurrency();

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen && props.invoiceId) {
      await loadInvoice();
    }
  }
);

watch(
  () => props.invoiceId,
  async (newId) => {
    if (props.isOpen && newId) {
      await loadInvoice();
    }
  }
);

async function loadInvoice() {
  if (!props.invoiceId) return;

  loading.value = true;
  try {
    invoice.value = await invoiceService.getOne(props.invoiceId);
  } catch (error) {
    console.error("Failed to load invoice:", error);
  } finally {
    loading.value = false;
  }
}

function close() {
  emit("close");
}

async function downloadPDF() {
  if (!props.invoiceId) return;

  downloading.value = true;
  try {
    await invoiceService.downloadPDF(props.invoiceId);
  } catch (error) {
    console.error("Failed to download PDF:", error);
  } finally {
    downloading.value = false;
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>
