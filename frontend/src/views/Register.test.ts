import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import Register from "./Register.vue";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/register", component: Register },
    { path: "/login", component: { template: "<div>Login</div>" } },
    { path: "/dashboard", component: { template: "<div>Dashboard</div>" } },
  ],
});

// Mock the auth store
vi.mock("@/stores/auth", () => ({
  useAuthStore: vi.fn(),
}));

describe("Register Component", () => {
  let mockAuthStore: any;

  beforeEach(() => {
    setActivePinia(createPinia());

    mockAuthStore = {
      register: vi.fn(),
      user: null,
      isAuthenticated: false,
    };

    (useAuthStore as any).mockReturnValue(mockAuthStore);
  });

  it("should render registration form", () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.find("h2").text()).toBe("Create your account");
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it("should show account type selection", () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain("Account Type");
    expect(wrapper.text()).toContain("Individual");
    expect(wrapper.text()).toContain("Company");
  });

  it("should set the account type by default to individual", () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    });

    // Check that individual fields are shown by default
    expect(wrapper.find('input[id="firstName"]').exists()).toBe(true);
    expect(wrapper.find('input[id="lastName"]').exists()).toBe(true);
    expect(wrapper.find('input[id="phone"]').exists()).toBe(true);
  });

  it("should show company fields when company account type is selected", async () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    });

    // Click on company account type
    const companyCard = wrapper
      .findAll("div")
      .find(
        (div) =>
          div.text().includes("Company") &&
          div.classes().includes("cursor-pointer")
      );

    if (companyCard) {
      await companyCard.trigger("click");

      // Check that company fields are shown
      expect(wrapper.find('input[id="companyName"]').exists()).toBe(true);
      expect(wrapper.find('input[id="taxpayerNumber"]').exists()).toBe(true);
    }
  });

  it("should validate required fields for individual registration", async () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    });

    const submitButton = wrapper.find('button[type="submit"]');

    // Initially should be disabled due to missing required fields
    expect(submitButton.attributes("disabled")).toBeDefined();

    // Fill in required fields
    await wrapper.find('input[id="firstName"]').setValue("John");
    await wrapper.find('input[id="lastName"]').setValue("Doe");
    await wrapper.find('input[id="phone"]').setValue("+1234567890");
    await wrapper.find('input[type="email"]').setValue("john@example.com");
    await wrapper.find('input[type="password"]').setValue("password123");

    // Should be enabled now
    expect(submitButton.attributes("disabled")).toBeUndefined();
  });

  it("should validate required fields for company registration", async () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    });

    // Switch to company account type
    const companyCard = wrapper
      .findAll("div")
      .find(
        (div) =>
          div.text().includes("Company") &&
          div.classes().includes("cursor-pointer")
      );

    if (companyCard) {
      await companyCard.trigger("click");

      const submitButton = wrapper.find('button[type="submit"]');

      // Initially should be disabled
      expect(submitButton.attributes("disabled")).toBeDefined();

      // Fill in required company fields
      await wrapper.find('input[id="companyName"]').setValue("Test Company");
      await wrapper.find('input[id="taxpayerNumber"]').setValue("123456789");
      await wrapper.find('input[id="town"]').setValue("Test City");
      await wrapper.find('input[type="email"]').setValue("company@example.com");
      await wrapper.find('input[type="password"]').setValue("password123");

      // Should be enabled now
      expect(submitButton.attributes("disabled")).toBeUndefined();
    }
  });

  it("should show validation errors for invalid email", async () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    });

    const emailInput = wrapper.find('input[type="email"]');
    await emailInput.setValue("invalid-email");
    await emailInput.trigger("blur");

    // Should show error message
    expect(wrapper.text()).toContain("Please enter a valid email address");
  });

  it("should show validation errors for short password", async () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    });

    const passwordInput = wrapper.find('input[type="password"]');
    await passwordInput.setValue("123");
    await passwordInput.trigger("blur");

    // Should show error message
    expect(wrapper.text()).toContain(
      "Password must be at least 6 characters long"
    );
  });

  it("should call register method on form submission", async () => {
    mockAuthStore.register.mockResolvedValue({});

    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    });

    // Fill in required fields
    await wrapper.find('input[id="firstName"]').setValue("John");
    await wrapper.find('input[id="lastName"]').setValue("Doe");
    await wrapper.find('input[id="phone"]').setValue("+1234567890");
    await wrapper.find('input[type="email"]').setValue("john@example.com");
    await wrapper.find('input[type="password"]').setValue("password123");

    // Submit form
    await wrapper.find("form").trigger("submit.prevent");

    expect(mockAuthStore.register).toHaveBeenCalledWith({
      accountType: "individual",
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
      email: "john@example.com",
      password: "password123",
      town: "",
      address: "",
      companyName: "",
      taxpayerNumber: "",
      commercialRegister: "",
      poBox: "",
    });
  });

  it("should navigate to dashboard on successful registration", async () => {
    mockAuthStore.register.mockResolvedValue({});

    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    });

    // Fill in required fields
    await wrapper.find('input[id="firstName"]').setValue("John");
    await wrapper.find('input[id="lastName"]').setValue("Doe");
    await wrapper.find('input[id="phone"]').setValue("+1234567890");
    await wrapper.find('input[type="email"]').setValue("john@example.com");
    await wrapper.find('input[type="password"]').setValue("password123");

    // Submit form
    await wrapper.find("form").trigger("submit.prevent");

    // Wait for navigation
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(router.currentRoute.value.path).toBe("/dashboard");
  });

  it("should show error message on registration failure", async () => {
    mockAuthStore.register.mockRejectedValue({
      response: { data: { message: "User already exists" } },
    });

    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    });

    // Fill in required fields
    await wrapper.find('input[id="firstName"]').setValue("John");
    await wrapper.find('input[id="lastName"]').setValue("Doe");
    await wrapper.find('input[id="phone"]').setValue("+1234567890");
    await wrapper.find('input[type="email"]').setValue("john@example.com");
    await wrapper.find('input[type="password"]').setValue("password123");

    // Submit form
    await wrapper.find("form").trigger("submit.prevent");

    // Should show error message
    expect(wrapper.text()).toContain("User already exists");
  });

  it("should have a link to login page", () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    });

    const loginLink = wrapper.find('a[href="/login"]');
    expect(loginLink.exists()).toBe(true);
    expect(loginLink.text()).toContain("Sign in here");
  });

  it("should show loading state during registration", async () => {
    mockAuthStore.register.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    });

    // Fill in required fields
    await wrapper.find('input[id="firstName"]').setValue("John");
    await wrapper.find('input[id="lastName"]').setValue("Doe");
    await wrapper.find('input[id="phone"]').setValue("+1234567890");
    await wrapper.find('input[type="email"]').setValue("john@example.com");
    await wrapper.find('input[type="password"]').setValue("password123");

    // Submit form
    await wrapper.find("form").trigger("submit.prevent");

    // Should show loading text
    expect(wrapper.text()).toContain("Creating Account...");
  });
});
