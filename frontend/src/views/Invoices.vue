<template>
  <Layout>
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div class="mb-4 sm:mb-0">
          <h1 class="text-3xl font-bold text-gray-900">
            {{ $t("invoices.title") }}
          </h1>
          <p class="mt-1 text-gray-600">{{ $t("invoices.description") }}</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <router-link
            to="/invoices/new"
            class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <PlusIcon class="w-5 h-5 mr-2" />
            {{ $t("invoices.newInvoice") }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
      <span class="ml-3 text-gray-600">{{
        $t("invoices.loadingInvoices")
      }}</span>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="invoices.length === 0"
      class="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100"
    >
      <div
        class="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6"
      >
        <DocumentTextIcon class="w-12 h-12 text-blue-600" />
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">
        {{ $t("invoices.noInvoicesYet") }}
      </h3>
      <p class="text-gray-600 mb-6">
        {{ $t("invoices.noInvoicesDescription") }}
      </p>
      <router-link
        to="/invoices/new"
        class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
      >
        <PlusIcon class="w-5 h-5 mr-2" />
        {{ $t("invoices.createFirstInvoice") }}
      </router-link>
    </div>

    <!-- Invoices Table -->
    <div
      v-else
      class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
    >
      <!-- Table Header -->
      <div
        class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">All Invoices</h3>
          <div class="text-sm text-gray-600">
            {{ invoices.length }} invoice{{ invoices.length !== 1 ? "s" : "" }}
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
                  <TagIcon class="w-4 h-4 mr-1 text-gray-400" />
                  Invoice #
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                <div class="flex items-center">
                  <UserIcon class="w-4 h-4 mr-1 text-gray-400" />
                  Client
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                <div class="flex items-center">
                  <CalendarIcon class="w-4 h-4 mr-1 text-gray-400" />
                  Date
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                <div class="flex items-center">
                  <CheckCircleIcon class="w-4 h-4 mr-1 text-gray-400" />
                  Status
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                <div class="flex items-center">
                  <CurrencyDollarIcon class="w-4 h-4 mr-1 text-gray-400" />
                  Total
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="invoice in invoices"
              :key="invoice.id"
              class="hover:bg-gray-50 transition-colors duration-200"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="text-sm font-medium text-gray-900">
                    {{ invoice.invoiceNumber }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-8 w-8">
                    <div
                      class="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center"
                    >
                      <span class="text-xs font-medium text-white">
                        {{
                          (invoice.client?.clientType === "company"
                            ? invoice.client?.companyName ||
                              invoice.client?.name
                            : invoice.client?.name
                          )
                            ?.charAt(0)
                            .toUpperCase()
                        }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">
                      {{
                        invoice.client?.clientType === "company"
                          ? invoice.client?.companyName || invoice.client?.name
                          : invoice.client?.name
                      }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ new Date(invoice.issueDate).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    invoice.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : invoice.status === 'sent'
                      ? 'bg-blue-100 text-blue-800'
                      : invoice.status === 'overdue'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800',
                  ]"
                >
                  <span
                    :class="[
                      'w-2 h-2 rounded-full mr-1.5',
                      invoice.status === 'paid'
                        ? 'bg-green-400'
                        : invoice.status === 'sent'
                        ? 'bg-blue-400'
                        : invoice.status === 'overdue'
                        ? 'bg-red-400'
                        : 'bg-gray-400',
                    ]"
                  ></span>
                  {{
                    invoice.status.charAt(0).toUpperCase() +
                    invoice.status.slice(1)
                  }}
                </span>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900"
              >
                ${{ invoice.total.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="openPreview(invoice.id)"
                    class="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                    title="Preview Invoice"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <router-link
                    :to="`/invoices/${invoice.id}/edit`"
                    class="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                    title="Edit Invoice"
                  >
                    <PencilSquareIcon class="w-4 h-4" />
                  </router-link>
                  <button
                    @click="downloadPDF(invoice.id)"
                    class="text-green-600 hover:text-green-900 transition-colors duration-200"
                    title="Download PDF"
                  >
                    <ArrowDownTrayIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Invoice Preview Modal -->
    <InvoicePreviewModal
      :is-open="previewModalOpen"
      :invoice-id="selectedInvoiceId"
      @close="closePreview"
    />
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { invoiceService } from "@/services/invoices";
import type { Invoice } from "@/types";
import Layout from "@/components/Layout.vue";
import InvoicePreviewModal from "@/components/InvoicePreviewModal.vue";
import {
  PlusIcon,
  DocumentTextIcon,
  TagIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilSquareIcon,
  ArrowDownTrayIcon,
} from "@heroicons/vue/24/outline";

const { t } = useI18n();

const invoices = ref<Invoice[]>([]);
const loading = ref(true);
const previewModalOpen = ref(false);
const selectedInvoiceId = ref<string | null>(null);

onMounted(async () => {
  await loadInvoices();
});

async function loadInvoices() {
  try {
    invoices.value = await invoiceService.getAll();
  } catch (error) {
    console.error("Failed to load invoices:", error);
  } finally {
    loading.value = false;
  }
}

async function downloadPDF(id: string) {
  try {
    await invoiceService.downloadPDF(id);
  } catch (error) {
    console.error("Failed to download PDF:", error);
  }
}

function openPreview(invoiceId: string) {
  selectedInvoiceId.value = invoiceId;
  previewModalOpen.value = true;
}

function closePreview() {
  previewModalOpen.value = false;
  selectedInvoiceId.value = null;
}
</script>
