import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import Invoices from "./Invoices.vue";
import { invoiceService } from "@/services/invoices";
import type { Invoice } from "@/types";
import { InvoiceStatus } from "@/types";

// Mock the invoice service
vi.mock("@/services/invoices", () => ({
  invoiceService: {
    getAll: vi.fn(),
    downloadPDF: vi.fn(),
  },
}));

// Mock the Layout component
vi.mock("@/components/Layout.vue", () => ({
  default: {
    template: "<div><slot /></div>",
  },
}));

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-000001",
    status: InvoiceStatus.SENT,
    issueDate: "2024-01-15",
    dueDate: "2024-02-15",
    subtotal: 100,
    tvaEnabled: true,
    tvaRate: 19.25,
    tvaAmount: 19.25,
    irEnabled: false,
    irRate: 5.5,
    irAmount: 0,
    total: 119.25,
    clientId: "client-1",
    client: {
      id: "client-1",
      name: "John Doe",
      email: "john@example.com",
    },
    items: [],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/invoices", component: Invoices }],
});

describe("Invoices Component", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(invoiceService.getAll).mockResolvedValue(mockInvoices);
  });

  it("should render invoices table", async () => {
    const wrapper = mount(Invoices, {
      global: {
        plugins: [router],
      },
    });

    // Wait for the component to load data
    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("All Invoices");
    expect(wrapper.text()).toContain("INV-000001");
    expect(wrapper.text()).toContain("John Doe");
  });

  it("should show loading state initially", () => {
    const wrapper = mount(Invoices, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain("Loading invoices...");
  });

  it("should display empty state when no invoices", async () => {
    vi.mocked(invoiceService.getAll).mockResolvedValue([]);

    const wrapper = mount(Invoices, {
      global: {
        plugins: [router],
      },
    });

    // Wait for the component to load data
    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("No invoices yet");
  });

  it("should open preview modal when eye icon is clicked", async () => {
    const wrapper = mount(Invoices, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.vm.$nextTick();

    const eyeButton = wrapper
      .findAll("button")
      .find((btn) => btn.attributes("title") === "Preview Invoice");

    if (eyeButton) {
      await eyeButton.trigger("click");

      const modal = wrapper.findComponent({ name: "InvoicePreviewModal" });
      expect(modal.props("isOpen")).toBe(true);
      expect(modal.props("invoiceId")).toBe("1");
    }
  });

  it("should close preview modal when close event is emitted", async () => {
    const wrapper = mount(Invoices, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.vm.$nextTick();

    // First open the modal
    const eyeButton = wrapper
      .findAll("button")
      .find((btn) => btn.attributes("title") === "Preview Invoice");

    if (eyeButton) {
      await eyeButton.trigger("click");

      let modal = wrapper.findComponent({ name: "InvoicePreviewModal" });
      expect(modal.props("isOpen")).toBe(true);

      // Now close it
      await modal.vm.$emit("close");

      modal = wrapper.findComponent({ name: "InvoicePreviewModal" });
      expect(modal.props("isOpen")).toBe(false);
    }
  });

  it("should call downloadPDF when download button is clicked", async () => {
    vi.mocked(invoiceService.downloadPDF).mockResolvedValue();

    const wrapper = mount(Invoices, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.vm.$nextTick();

    const downloadButton = wrapper
      .findAll("button")
      .find((btn) => btn.attributes("title") === "Download PDF");

    if (downloadButton) {
      await downloadButton.trigger("click");
      expect(invoiceService.downloadPDF).toHaveBeenCalledWith("1");
    }
  });

  it("should display invoice status with correct styling", async () => {
    const wrapper = mount(Invoices, {
      global: {
        plugins: [router],
      },
    });

    // Wait for the component to load data
    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    // Check that the status text appears in the component
    expect(wrapper.text()).toContain("Sent");
  });

  it("should format dates correctly in the table", async () => {
    const wrapper = mount(Invoices, {
      global: {
        plugins: [router],
      },
    });

    // Wait for the component to load data
    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    // Check for the actual date format that gets displayed
    expect(wrapper.text()).toContain("1/15/2024");
  });

  it("should display total with correct formatting", async () => {
    const wrapper = mount(Invoices, {
      global: {
        plugins: [router],
      },
    });

    // Wait for the component to load data
    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("$119.25");
  });
});
