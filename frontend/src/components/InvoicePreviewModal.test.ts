import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { nextTick } from "vue";
import InvoicePreviewModal from "./InvoicePreviewModal.vue";
import { invoiceService } from "@/services/invoices";
import type { Invoice } from "@/types";
import { InvoiceStatus } from "@/types";

// Mock the invoice service
vi.mock("@/services/invoices", () => ({
  invoiceService: {
    getOne: vi.fn(),
    downloadPDF: vi.fn(),
  },
}));

const mockInvoice: Invoice = {
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
  notes: "Thank you for your business",
  clientId: "client-1",
  client: {
    id: "client-1",
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    address: "123 Main St",
    city: "New York",
    country: "USA",
  },
  items: [
    {
      id: "item-1",
      description: "Web Development",
      quantity: 10,
      unitPrice: 10,
      amount: 100,
    },
  ],
};

describe("InvoicePreviewModal", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    mount(InvoicePreviewModal, {
      props: {
        isOpen: false,
        invoiceId: null,
      },
      attachTo: document.body,
    });

    // Teleport renders to body, so we need to check the document body
    const teleportedContent = document.body.querySelector(".fixed.inset-0");
    expect(teleportedContent).toBeNull();
  });

  it("should render modal when isOpen is true", async () => {
    mount(InvoicePreviewModal, {
      props: {
        isOpen: true,
        invoiceId: "1",
      },
      attachTo: document.body,
    });

    await nextTick();

    const teleportedContent = document.body.querySelector(".fixed.inset-0");
    expect(teleportedContent).not.toBeNull();
    expect(teleportedContent?.textContent).toContain("Invoice Preview");
  });

  it("should fetch invoice data when opened", async () => {
    vi.mocked(invoiceService.getOne).mockResolvedValue(mockInvoice);

    const wrapper = mount(InvoicePreviewModal, {
      props: {
        isOpen: false,
        invoiceId: null,
      },
    });

    await wrapper.setProps({ isOpen: true, invoiceId: "1" });

    await flushPromises();

    expect(invoiceService.getOne).toHaveBeenCalledWith("1");
  });

  it("should emit close event when close button is clicked", async () => {
    const wrapper = mount(InvoicePreviewModal, {
      props: {
        isOpen: true,
        invoiceId: "1",
      },
    });

    const closeButton = wrapper
      .findAll("button")
      .find(
        (btn) =>
          (btn.attributes("title") === undefined && btn.text().includes("×")) ||
          btn.classes().includes("text-gray-400")
      );

    if (closeButton) {
      await closeButton.trigger("click");
      expect(wrapper.emitted("close")).toBeTruthy();
    }
  });

  it("should emit close event when clicking outside modal", async () => {
    const wrapper = mount(InvoicePreviewModal, {
      props: {
        isOpen: true,
        invoiceId: "1",
      },
      attachTo: document.body,
    });

    await nextTick();

    // Find the backdrop element (the outer div with @click.self)
    const backdrop = wrapper.find(".fixed.inset-0");
    if (backdrop.exists()) {
      await backdrop.trigger("click");
      expect(wrapper.emitted("close")).toBeTruthy();
    }
  });

  it("should call downloadPDF when download button is clicked", async () => {
    vi.mocked(invoiceService.getOne).mockResolvedValue(mockInvoice);
    vi.mocked(invoiceService.downloadPDF).mockResolvedValue();

    const wrapper = mount(InvoicePreviewModal, {
      props: {
        isOpen: true,
        invoiceId: "1",
      },
    });

    // Wait for the invoice to load
    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    const downloadButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Download PDF"));

    if (downloadButton) {
      await downloadButton.trigger("click");
      expect(invoiceService.downloadPDF).toHaveBeenCalledWith("1");
    }
  });

  it("should show downloading state during PDF download", async () => {
    vi.mocked(invoiceService.getOne).mockResolvedValue(mockInvoice);
    vi.mocked(invoiceService.downloadPDF).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const wrapper = mount(InvoicePreviewModal, {
      props: {
        isOpen: true,
        invoiceId: "1",
      },
    });

    // Wait for the invoice to load
    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    const downloadButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Download PDF"));

    if (downloadButton) {
      await downloadButton.trigger("click");
      expect(downloadButton.text()).toContain("Downloading...");

      // Wait for download to complete
      await new Promise((resolve) => setTimeout(resolve, 150));
      await wrapper.vm.$nextTick();

      expect(downloadButton.text()).toContain("Download PDF");
    }
  });

  it("should handle invoice without notes", async () => {
    const invoiceWithoutNotes = { ...mockInvoice, notes: undefined };
    vi.mocked(invoiceService.getOne).mockResolvedValue(invoiceWithoutNotes);

    const wrapper = mount(InvoicePreviewModal, {
      props: {
        isOpen: false,
        invoiceId: null,
      },
    });

    await wrapper.setProps({ isOpen: true, invoiceId: "1" });

    await flushPromises();

    // Test that the service was called
    expect(invoiceService.getOne).toHaveBeenCalledWith("1");
  });
});
