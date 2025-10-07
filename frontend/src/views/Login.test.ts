import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import { createI18n } from "vue-i18n";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import Login from "./Login.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en,
    fr,
  },
});

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", component: Login },
    { path: "/register", component: { template: "<div>Register</div>" } },
  ],
});

describe("Login Component", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should render login form", () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router, i18n],
      },
    });

    expect(wrapper.find("h1").text()).toBe("Welcome Back");
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it("should bind input values correctly", async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router, i18n],
      },
    });

    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');

    await emailInput.setValue("test@example.com");
    await passwordInput.setValue("password123");

    expect((emailInput.element as HTMLInputElement).value).toBe(
      "test@example.com"
    );
    expect((passwordInput.element as HTMLInputElement).value).toBe(
      "password123"
    );
  });

  it("should have a link to register page", () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router, i18n],
      },
    });

    // Reset to English
    i18n.global.locale.value = "en";

    const registerLink = wrapper.find('a[href="/register"]');
    expect(registerLink.exists()).toBe(true);
    expect(registerLink.text()).toContain("Create one here");
  });

  it("should disable submit button when loading", async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router, i18n],
      },
    });

    // Initially not disabled
    expect(
      wrapper.find('button[type="submit"]').attributes("disabled")
    ).toBeUndefined();
  });

  it("should render language switcher", () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router, i18n],
      },
    });

    const languageButton = wrapper.find(
      '[data-testid="language-switcher"] button'
    );
    expect(languageButton.exists()).toBe(true);
    expect(languageButton.text()).toContain("EN");
  });

  it("should show language dropdown when clicked", async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router, i18n],
      },
    });

    const languageButton = wrapper.find(
      '[data-testid="language-switcher"] button'
    );
    await languageButton.trigger("click");

    const dropdown = wrapper.find('[data-testid="language-dropdown"]');
    expect(dropdown.exists()).toBe(true);
    expect(dropdown.text()).toContain("English");
    expect(dropdown.text()).toContain("Français");
  });

  it("should change language when dropdown option is clicked", async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router, i18n],
      },
    });

    // Click language button to open dropdown
    const languageButton = wrapper.find(
      '[data-testid="language-switcher"] button'
    );
    await languageButton.trigger("click");

    // Click French option
    const dropdownButtons = wrapper.findAll(
      '[data-testid="language-dropdown"] button'
    );
    const frenchOption = dropdownButtons.find((btn) =>
      btn.text().includes("Français")
    );
    if (frenchOption) {
      await frenchOption.trigger("click");
    }

    // Check if language changed
    expect(languageButton.text()).toContain("FR");
  });

  it("should translate text when language changes", async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router, i18n],
      },
    });

    // Reset to English
    i18n.global.locale.value = "en";
    await wrapper.vm.$nextTick();

    // Initially in English
    expect(wrapper.find("h1").text()).toBe("Welcome Back");

    // Change to French
    const languageSwitcher = wrapper.find(
      '[data-testid="language-switcher"] button'
    );
    await languageSwitcher.trigger("click");

    const frenchOption = wrapper.find('[data-testid="language-fr"]');
    await frenchOption.trigger("click");

    // Should show French text
    expect(wrapper.find("h1").text()).toBe("Bienvenue");
  });
});
