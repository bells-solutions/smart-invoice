<template>
  <Layout>
    <h2 class="text-2xl font-bold mb-6">{{ isEdit ? 'Edit Invoice' : 'Create Invoice' }}</h2>

    <div class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="saveInvoice">
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Client</label>
            <select
              v-model="form.clientId"
              required
              class="shadow border rounded w-full py-2 px-3 text-gray-700"
            >
              <option value="">Select Client</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Status</label>
            <select
              v-model="form.status"
              class="shadow border rounded w-full py-2 px-3 text-gray-700"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Issue Date</label>
            <input
              v-model="form.issueDate"
              type="date"
              required
              class="shadow border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Due Date</label>
            <input
              v-model="form.dueDate"
              type="date"
              required
              class="shadow border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Tax Rate (%)</label>
            <input
              v-model.number="form.taxRate"
              type="number"
              step="0.01"
              min="0"
              class="shadow border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>
        </div>

        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">Items</h3>
            <button
              type="button"
              @click="addItem"
              class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
            >
              Add Item
            </button>
          </div>

          <div class="space-y-2">
            <div v-for="(item, index) in form.items" :key="index" class="grid grid-cols-12 gap-2">
              <div class="col-span-5">
                <input
                  v-model="item.description"
                  type="text"
                  placeholder="Description"
                  required
                  class="shadow border rounded w-full py-2 px-3 text-gray-700"
                />
              </div>
              <div class="col-span-2">
                <input
                  v-model.number="item.quantity"
                  type="number"
                  placeholder="Qty"
                  min="1"
                  required
                  class="shadow border rounded w-full py-2 px-3 text-gray-700"
                />
              </div>
              <div class="col-span-2">
                <input
                  v-model.number="item.unitPrice"
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  min="0"
                  required
                  class="shadow border rounded w-full py-2 px-3 text-gray-700"
                />
              </div>
              <div class="col-span-2">
                <input
                  :value="(item.quantity * item.unitPrice).toFixed(2)"
                  type="text"
                  readonly
                  class="shadow border rounded w-full py-2 px-3 text-gray-700 bg-gray-100"
                />
              </div>
              <div class="col-span-1 flex items-center">
                <button
                  type="button"
                  @click="removeItem(index)"
                  class="text-red-600 hover:text-red-900"
                >
                  ✕
                </button>
              </div>
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
                <span class="font-bold">${{ calculateSubtotal().toFixed(2) }}</span>
              </div>
              <div class="flex justify-between mb-2">
                <span class="text-gray-700">Tax ({{ form.taxRate }}%):</span>
                <span class="font-bold">${{ calculateTax().toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-lg">
                <span class="text-gray-700 font-bold">Total:</span>
                <span class="font-bold">${{ calculateTotal().toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-2">
          <router-link
            to="/invoices"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          >
            Cancel
          </router-link>
          <button
            type="submit"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Save Invoice
          </button>
        </div>
      </form>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { clientService } from '@/services/clients';
import { invoiceService } from '@/services/invoices';
import type { Client, InvoiceItem, InvoiceStatus } from '@/types';
import Layout from '@/components/Layout.vue';

const router = useRouter();
const route = useRoute();

const clients = ref<Client[]>([]);
const isEdit = computed(() => !!route.params.id);

const form = ref({
  clientId: '',
  status: 'draft' as InvoiceStatus,
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  taxRate: 0,
  notes: '',
  items: [] as InvoiceItem[],
});

onMounted(async () => {
  try {
    clients.value = await clientService.getAll();
    
    if (isEdit.value) {
      const invoice = await invoiceService.getOne(route.params.id as string);
      form.value = {
        clientId: invoice.clientId,
        status: invoice.status,
        issueDate: invoice.issueDate.split('T')[0],
        dueDate: invoice.dueDate.split('T')[0],
        taxRate: invoice.taxRate,
        notes: invoice.notes || '',
        items: invoice.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };
    } else {
      addItem();
    }
  } catch (error) {
    console.error('Failed to load data:', error);
  }
});

function addItem() {
  form.value.items.push({
    description: '',
    quantity: 1,
    unitPrice: 0,
  });
}

function removeItem(index: number) {
  form.value.items.splice(index, 1);
}

function calculateSubtotal() {
  return form.value.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
}

function calculateTax() {
  return (calculateSubtotal() * form.value.taxRate) / 100;
}

function calculateTotal() {
  return calculateSubtotal() + calculateTax();
}

async function saveInvoice() {
  try {
    if (isEdit.value) {
      await invoiceService.update(route.params.id as string, form.value);
    } else {
      await invoiceService.create(form.value);
    }
    router.push('/invoices');
  } catch (error) {
    console.error('Failed to save invoice:', error);
  }
}
</script>
