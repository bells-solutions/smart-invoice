<template>
  <Layout>
    <!-- Hero Section -->
    <div class="mb-8">
      <div
        class="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl"
      >
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold mb-2">
              Welcome back
              {{ user?.firstName }} {{ user?.lastName || user?.companyName }}!
            </h1>
            <p class="text-blue-100 text-lg">
              Here's what's happening with your invoices today.
            </p>
          </div>
          <div class="hidden md:block">
            <StarIcon class="w-24 h-24 text-blue-200 opacity-80" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
      <span class="ml-3 text-gray-600">Loading your dashboard...</span>
    </div>

    <div v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">
                Total Invoices
              </p>
              <p class="text-3xl font-bold text-gray-900">
                {{ stats?.totalInvoices || 0 }}
              </p>
            </div>
            <div class="bg-blue-100 p-3 rounded-full">
              <DocumentTextIcon class="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <CheckCircleIcon class="w-4 h-4 text-green-500 mr-1" />
            <span class="text-gray-600">All time</span>
          </div>
        </div>

        <div
          class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">
                Total Revenue
              </p>
              <p class="text-3xl font-bold text-green-600">
                ${{ stats?.totalSales?.toFixed(2) || "0.00" }}
              </p>
            </div>
            <div class="bg-green-100 p-3 rounded-full">
              <CurrencyDollarIcon class="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <CheckCircleIcon class="w-4 h-4 text-green-500 mr-1" />
            <span class="text-green-600">+12% from last month</span>
          </div>
        </div>

        <div
          class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">
                Pending Payments
              </p>
              <p class="text-3xl font-bold text-orange-600">
                {{ stats?.unpaidInvoices || 0 }}
              </p>
            </div>
            <div class="bg-orange-100 p-3 rounded-full">
              <ClockIcon class="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <ExclamationTriangleIcon class="w-4 h-4 text-orange-500 mr-1" />
            <span class="text-orange-600">Needs attention</span>
          </div>
        </div>

        <div
          class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">
                Outstanding Amount
              </p>
              <p class="text-3xl font-bold text-red-600">
                ${{ stats?.unpaidAmount?.toFixed(2) || "0.00" }}
              </p>
            </div>
            <div class="bg-red-100 p-3 rounded-full">
              <ExclamationTriangleIcon class="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <ExclamationTriangleIcon class="w-4 h-4 text-red-500 mr-1" />
            <span class="text-red-600">Action required</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div
        class="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8"
      >
        <div class="flex items-center mb-6">
          <div class="bg-blue-100 p-2 rounded-lg mr-3">
            <BoltIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Quick Actions</h3>
            <p class="text-gray-600">Get started with common tasks</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <router-link
            to="/invoices/new"
            class="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <div class="flex items-center">
              <PlusIcon class="w-8 h-8 mr-3" />
              <div>
                <div class="font-semibold text-lg">Create Invoice</div>
                <div class="text-blue-100 text-sm">Start a new invoice</div>
              </div>
            </div>
          </router-link>

          <router-link
            to="/clients"
            class="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <div class="flex items-center">
              <UsersIcon class="w-8 h-8 mr-3" />
              <div>
                <div class="font-semibold text-lg">Manage Clients</div>
                <div class="text-green-100 text-sm">Add or edit clients</div>
              </div>
            </div>
          </router-link>

          <router-link
            to="/invoices"
            class="group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <div class="flex items-center">
              <DocumentTextIcon class="w-8 h-8 mr-3" />
              <div>
                <div class="font-semibold text-lg">View Invoices</div>
                <div class="text-purple-100 text-sm">See all your invoices</div>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <div class="bg-indigo-100 p-2 rounded-lg mr-3">
              <ClockIcon class="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">Recent Activity</h3>
              <p class="text-gray-600">Your latest invoice updates</p>
            </div>
          </div>
          <router-link
            to="/invoices"
            class="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
          >
            View all
            <ChevronRightIcon class="w-4 h-4 ml-1" />
          </router-link>
        </div>
        <div class="text-center py-8 text-gray-500">
          <InboxIcon class="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Recent activity will appear here</p>
          <p class="text-sm text-gray-400 mt-1">
            Create your first invoice to get started
          </p>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { invoiceService } from "@/services/invoices";
import type { DashboardStats } from "@/types";
import Layout from "@/components/Layout.vue";
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  PlusIcon,
  UsersIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  InboxIcon,
  StarIcon,
} from "@heroicons/vue/24/outline";

const stats = ref<DashboardStats | null>(null);
const loading = ref(true);
const user = ref(JSON.parse(localStorage.getItem("user") || "{}"));

onMounted(async () => {
  try {
    stats.value = await invoiceService.getDashboardStats();
  } catch (error) {
    console.error("Failed to load dashboard stats:", error);
  } finally {
    loading.value = false;
  }
});
</script>
