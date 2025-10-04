<template>
  <Layout>
    <h2 class="text-2xl font-bold mb-6">Dashboard</h2>

    <div v-if="loading" class="text-center">Loading...</div>
    
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm text-gray-600">Total Invoices</div>
          <div class="text-3xl font-bold text-gray-900">{{ stats?.totalInvoices || 0 }}</div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm text-gray-600">Total Sales</div>
          <div class="text-3xl font-bold text-green-600">${{ stats?.totalSales?.toFixed(2) || '0.00' }}</div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm text-gray-600">Unpaid Invoices</div>
          <div class="text-3xl font-bold text-orange-600">{{ stats?.unpaidInvoices || 0 }}</div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm text-gray-600">Unpaid Amount</div>
          <div class="text-3xl font-bold text-red-600">${{ stats?.unpaidAmount?.toFixed(2) || '0.00' }}</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-bold mb-4">Quick Actions</h3>
        <div class="flex space-x-4">
          <router-link
            to="/invoices/new"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Create New Invoice
          </router-link>
          <router-link
            to="/clients"
            class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Manage Clients
          </router-link>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { invoiceService } from '@/services/invoices';
import type { DashboardStats } from '@/types';
import Layout from '@/components/Layout.vue';

const stats = ref<DashboardStats | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    stats.value = await invoiceService.getDashboardStats();
  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
  } finally {
    loading.value = false;
  }
});
</script>
