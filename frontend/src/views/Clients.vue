<template>
  <Layout>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Clients</h2>
      <button
        @click="showForm = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Add Client
      </button>
    </div>

    <div v-if="loading" class="text-center">Loading...</div>

    <div v-else-if="clients.length === 0" class="bg-white rounded-lg shadow p-6 text-center text-gray-600">
      No clients yet. Add your first client to get started.
    </div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="client in clients" :key="client.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ client.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ client.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ client.phone || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ client.city || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="editClient(client)"
                class="text-blue-600 hover:text-blue-900 mr-4"
              >
                Edit
              </button>
              <button
                @click="deleteClient(client.id)"
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Client Form Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">{{ editingClient ? 'Edit Client' : 'Add Client' }}</h3>
        
        <form @submit.prevent="saveClient">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Phone</label>
            <input
              v-model="form.phone"
              type="text"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Address</label>
            <input
              v-model="form.address"
              type="text"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">City</label>
            <input
              v-model="form.city"
              type="text"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>

          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2">Country</label>
            <input
              v-model="form.country"
              type="text"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>

          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="closeForm"
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { clientService } from '@/services/clients';
import type { Client } from '@/types';
import Layout from '@/components/Layout.vue';

const clients = ref<Client[]>([]);
const loading = ref(true);
const showForm = ref(false);
const editingClient = ref<Client | null>(null);

const form = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
});

onMounted(async () => {
  await loadClients();
});

async function loadClients() {
  try {
    clients.value = await clientService.getAll();
  } catch (error) {
    console.error('Failed to load clients:', error);
  } finally {
    loading.value = false;
  }
}

function editClient(client: Client) {
  editingClient.value = client;
  form.value = {
    name: client.name,
    email: client.email,
    phone: client.phone || '',
    address: client.address || '',
    city: client.city || '',
    country: client.country || '',
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
    console.error('Failed to save client:', error);
  }
}

async function deleteClient(id: string) {
  if (!confirm('Are you sure you want to delete this client?')) return;
  
  try {
    await clientService.delete(id);
    await loadClients();
  } catch (error) {
    console.error('Failed to delete client:', error);
  }
}

function closeForm() {
  showForm.value = false;
  editingClient.value = null;
  form.value = {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  };
}
</script>
