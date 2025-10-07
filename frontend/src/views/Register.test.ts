import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import { createI18n } from "vue-i18n";
import Register from "./Register.vue";
import { useAuthStore } from "@/stores/auth";

// Mock the auth store
vi.mock("@/stores/auth", () => ({
  useAuthStore: vi.fn(),
}));

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      register: {
        createAccount: "Create your account",
        joinSmartInvoice:
          "Join SmartInvoice and start creating professional invoices",
        accountTypeRequired: "Account Type *",
        individual: "Individual",
        personalAccount: "Personal account for freelancers and individuals",
        company: "Company",
        businessAccount: "Business account for companies and organizations",
        firstName: "First Name",
        firstNameRequired: "First Name *",
        firstNameRequiredIndividual:
          "First name is required for individual accounts",
        optionalCompany: "Optional for companies",
        lastName: "Last Name",
        lastNameRequired: "Last Name *",
        lastNameRequiredIndividual:
          "Last name is required for individual accounts",
        phoneRequired: "Phone *",
        enterValidPhone: "Please enter a valid phone number",
        emailAddressRequired: "Email *",
        invalidEmail: "Please enter a valid email address",
        passwordRequired: "Password *",
        createStrongPassword: "Create a strong password",
        passwordMinLength: "Password must be at least 6 characters long",
        commercialRegister: "Commercial Register",
        address: "Address",
        poBox: "PO Box",
        town: "Town",
        townRequired: "Town *",
        townRequiredCompany: "Town is required for company accounts",
        optional: "Optional",
        companyNameRequired: "Company Name *",
        companyNameRequiredField: "Company name is required",
        taxpayerNumberRequired: "Taxpayer Number *",
        taxpayerNumberRequiredField: "Taxpayer number is required",
        createAccountButton: "Create Account",
        creatingAccount: "Creating Account...",
        alreadyHaveAccount: "Already have an account?",
        signInHere: "Sign in here",
      },
    },
    fr: {
      register: {
        createAccount: "Créez votre compte",
        joinSmartInvoice:
          "Rejoignez SmartInvoice et commencez à créer des factures professionnelles",
        accountTypeRequired: "Type de compte *",
        individual: "Individuel",
        personalAccount: "Compte personnel pour les freelances et particuliers",
        company: "Entreprise",
        businessAccount: "Compte entreprise pour les sociétés et organisations",
        firstName: "Prénom",
        firstNameRequired: "Prénom *",
        firstNameRequiredIndividual:
          "Le prénom est requis pour les comptes individuels",
        optionalCompany: "Optionnel pour les entreprises",
        lastName: "Nom",
        lastNameRequired: "Nom *",
        lastNameRequiredIndividual:
          "Le nom est requis pour les comptes individuels",
        phoneRequired: "Téléphone *",
        enterValidPhone: "Veuillez entrer un numéro de téléphone valide",
        emailAddressRequired: "E-mail *",
        invalidEmail: "Veuillez entrer une adresse e-mail valide",
        passwordRequired: "Mot de passe *",
        createStrongPassword: "Créez un mot de passe fort",
        passwordMinLength:
          "Le mot de passe doit contenir au moins 6 caractères",
        commercialRegister: "Registre du commerce",
        address: "Adresse",
        poBox: "Boîte postale",
        town: "Ville",
        townRequired: "Ville *",
        townRequiredCompany: "La ville est requise pour les comptes entreprise",
        optional: "Optionnel",
        companyNameRequired: "Nom de l'entreprise *",
        companyNameRequiredField: "Le nom de l'entreprise est requis",
        taxpayerNumberRequired: "Numéro de contribuable *",
        taxpayerNumberRequiredField: "Le numéro de contribuable est requis",
        createAccountButton: "Créer un compte",
        creatingAccount: "Création du compte...",
        alreadyHaveAccount: "Vous avez déjà un compte ?",
        signInHere: "Connectez-vous ici",
      },
    },
  },
});

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/register", component: Register },
    { path: "/login", component: { template: "<div>Login</div>" } },
    { path: "/dashboard", component: { template: "<div>Dashboard</div>" } },
  ],
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

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
        plugins: [router, i18n],
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
        plugins: [router, i18n],
      },
    });

    expect(wrapper.text()).toContain("Account Type");
    expect(wrapper.text()).toContain("Individual");
    expect(wrapper.text()).toContain("Company");
  });

  it("should set the account type by default to individual", () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router, i18n],
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
        plugins: [router, i18n],
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
        plugins: [router, i18n],
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
        plugins: [router, i18n],
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
        plugins: [router, i18n],
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
        plugins: [router, i18n],
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
        plugins: [router, i18n],
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
        plugins: [router, i18n],
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
        plugins: [router, i18n],
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
        plugins: [router, i18n],
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
        plugins: [router, i18n],
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

  describe("Localization", () => {
    it("should render language switcher", () => {
      const wrapper = mount(Register, {
        global: {
          plugins: [router, i18n],
        },
      });

      const languageSwitcher = wrapper.find(
        '[data-testid="language-switcher"]'
      );
      expect(languageSwitcher.exists()).toBe(true);
    });

    it("should show language dropdown when clicked", async () => {
      const wrapper = mount(Register, {
        global: {
          plugins: [router, i18n],
        },
      });

      const languageSwitcher = wrapper.find(
        '[data-testid="language-switcher"]'
      );
      await languageSwitcher.trigger("click");

      const dropdown = wrapper.find('[data-testid="language-dropdown"]');
      expect(dropdown.exists()).toBe(true);
      expect(dropdown.isVisible()).toBe(true);
    });

    it("should change language when dropdown option is clicked", async () => {
      const wrapper = mount(Register, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Initially should show English text
      expect(wrapper.text()).toContain("Create your account");

      // Click language switcher
      const languageSwitcher = wrapper.find(
        '[data-testid="language-switcher"]'
      );
      await languageSwitcher.trigger("click");

      // Click French option
      const frenchOption = wrapper.find('[data-testid="language-fr"]');
      await frenchOption.trigger("click");

      // Should show French text
      expect(wrapper.text()).toContain("Créez votre compte");
    });

    it("should persist language selection in localStorage", async () => {
      localStorageMock.setItem.mockClear();

      const wrapper = mount(Register, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Click language switcher
      const languageSwitcher = wrapper.find(
        '[data-testid="language-switcher"]'
      );
      await languageSwitcher.trigger("click");

      // Click French option
      const frenchOption = wrapper.find('[data-testid="language-fr"]');
      await frenchOption.trigger("click");

      // Check localStorage.setItem was called
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "user-language",
        "fr"
      );
    });

    it("should translate form labels correctly", async () => {
      const wrapper = mount(Register, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Reset to English
      i18n.global.locale.value = "en";
      await wrapper.vm.$nextTick();

      // English by default
      expect(wrapper.text()).toContain("First Name *");
      expect(wrapper.text()).toContain("Last Name *");
      expect(wrapper.text()).toContain("Email *");

      // Switch to French
      const languageSwitcher = wrapper.find(
        '[data-testid="language-switcher"]'
      );
      await languageSwitcher.trigger("click");

      const frenchOption = wrapper.find('[data-testid="language-fr"]');
      await frenchOption.trigger("click");

      // French translations
      expect(wrapper.text()).toContain("Prénom *");
      expect(wrapper.text()).toContain("Nom *");
      expect(wrapper.text()).toContain("E-mail *");
    });
  });
});
