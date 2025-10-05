import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/dashboard",
      meta: {
        title: "Home",
      },
    },
    {
      path: "/login",
      name: "Login",
      meta: {
        title: "Login",
      },
      component: () => import("@/views/Login.vue"),
    },
    {
      path: "/register",
      name: "Register",
      meta: {
        title: "Register",
      },
      component: () => import("@/views/Register.vue"),
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: () => import("@/views/Dashboard.vue"),
      meta: { title: "Dashboard", requiresAuth: true },
    },
    {
      path: "/clients",
      name: "Clients",
      component: () => import("@/views/Clients.vue"),
      meta: { title: "Clients", requiresAuth: true },
    },
    {
      path: "/invoices",
      name: "Invoices",
      component: () => import("@/views/Invoices.vue"),
      meta: { title: "Invoices", requiresAuth: true },
    },
    {
      path: "/invoices/new",
      name: "NewInvoice",
      component: () => import("@/views/InvoiceForm.vue"),
      meta: { title: "New Invoice", requiresAuth: true },
    },
    {
      path: "/invoices/:id/edit",
      name: "EditInvoice",
      component: () => import("@/views/InvoiceForm.vue"),
      meta: { title: "Edit Invoice", requiresAuth: true },
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  document.title = to.meta.title
    ? `${to.meta.title} - Smart Invoice`
    : "Smart Invoice";
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else if (
    (to.path === "/login" || to.path === "/register") &&
    authStore.isAuthenticated
  ) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
