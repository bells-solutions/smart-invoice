import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue'),
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/clients',
      name: 'Clients',
      component: () => import('@/views/Clients.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/invoices',
      name: 'Invoices',
      component: () => import('@/views/Invoices.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/invoices/new',
      name: 'NewInvoice',
      component: () => import('@/views/InvoiceForm.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/invoices/:id/edit',
      name: 'EditInvoice',
      component: () => import('@/views/InvoiceForm.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
