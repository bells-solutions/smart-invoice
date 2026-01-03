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
      path: "/forgot-password",
      name: "ForgotPassword",
      meta: {
        title: "Forgot Password",
      },
      component: () => import("@/views/ForgotPassword.vue"),
    },
    {
      path: "/reset-password",
      name: "ResetPassword",
      meta: {
        title: "Reset Password",
      },
      component: () => import("@/views/ResetPassword.vue"),
    },
    {
      path: "/verify-email",
      name: "VerifyEmail",
      meta: {
        title: "Verify Email",
      },
      component: () => import("@/views/VerifyEmail.vue"),
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
    {
      path: "/profile",
      name: "Profile",
      component: () => import("@/views/Profile.vue"),
      meta: { title: "Profile", requiresAuth: true },
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
    (to.path === "/login" ||
      to.path === "/register" ||
      to.path === "/forgot-password" ||
      to.path === "/reset-password" ||
      to.path === "/verify-email") &&
    authStore.isAuthenticated
  ) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
