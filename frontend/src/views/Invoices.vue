<template>
  <Layout>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Invoices</h2>
      <router-link
        to="/invoices/new"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Create Invoice
      </router-link>
    </div>

    <div v-if="loading" class="text-center">Loading...</div>

    <div
      v-else-if="invoices.length === 0"
      class="bg-white rounded-lg shadow p-6 text-center text-gray-600"
    >
      No invoices yet. Create your first invoice to get started.
    </div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Invoice #
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Client
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Total
            </th>
            <th
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="invoice in invoices" :key="invoice.id">
            <td class="px-6 py-4 whitespace-nowrap">
              {{ invoice.invoiceNumber }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ invoice.client?.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ formatDate(invoice.issueDate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="getStatusClass(invoice.status)"
                class="px-2 py-1 rounded text-xs font-semibold"
              >
                {{ invoice.status.toUpperCase() }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${{ invoice.total }}</td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <button
                @click="downloadPDF(invoice.id)"
                class="text-green-600 hover:text-green-900 mr-4"
              >
                PDF
              </button>
              <router-link
                :to="`/invoices/${invoice.id}/edit`"
                class="text-blue-600 hover:text-blue-900 mr-4"
              >
                Edit
              </router-link>
              <button
                @click="deleteInvoice(invoice.id)"
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { invoiceService } from "@/services/invoices";
import type { Invoice, InvoiceStatus } from "@/types";
import Layout from "@/components/Layout.vue";

const invoices = ref<Invoice[]>([]);
const loading = ref(true);

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

async function deleteInvoice(id: string) {
  if (!confirm("Are you sure you want to delete this invoice?")) return;

  try {
    await invoiceService.delete(id);
    await loadInvoices();
  } catch (error) {
    console.error("Failed to delete invoice:", error);
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

function getStatusClass(status: InvoiceStatus) {
  const classes: Record<InvoiceStatus, string> = {
    draft: "bg-gray-200 text-gray-800",
    sent: "bg-blue-200 text-blue-800",
    paid: "bg-green-200 text-green-800",
    overdue: "bg-red-200 text-red-800",
  };
  return classes[status];
}
</script>
