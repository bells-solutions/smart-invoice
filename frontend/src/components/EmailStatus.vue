<template>
  <div class="flex items-center space-x-2">
    <!-- Email Status Badge -->
    <div
      v-if="showEmailStatus"
      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
      :class="emailStatusClass"
    >
      <component :is="emailStatusIcon" class="w-3 h-3 mr-1" />
      {{ emailStatusText }}
    </div>

    <!-- Send Email Button -->
    <button
      v-if="canSendEmail"
      @click="sendInvoiceEmail"
      :disabled="sending"
      class="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors duration-200 disabled:opacity-50"
      :title="$t('invoices.sendByEmail')"
    >
      <PaperAirplaneIcon v-if="!sending" class="w-3 h-3 mr-1" />
      <ArrowPathIcon v-else class="w-3 h-3 mr-1 animate-spin" />
      {{ sending ? $t("common.sending") : $t("invoices.sendEmail") }}
    </button>

    <!-- Payment Reminder Button -->
    <button
      v-if="canSendReminder"
      @click="sendPaymentReminder"
      :disabled="sendingReminder"
      class="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-full transition-colors duration-200 disabled:opacity-50"
      :title="$t('invoices.sendReminder')"
    >
      <BellIcon v-if="!sendingReminder" class="w-3 h-3 mr-1" />
      <ArrowPathIcon v-else class="w-3 h-3 mr-1 animate-spin" />
      {{ sendingReminder ? $t("common.sending") : $t("invoices.remind") }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  PaperAirplaneIcon,
  BellIcon,
  ArrowPathIcon,
} from "@heroicons/vue/24/outline";
import { reportsService } from "@/services/reports";

interface Props {
  invoice: {
    id: string;
    status: string;
    dueDate: string;
    lastEmailSent?: string;
    emailDeliveryStatus?: "sent" | "delivered" | "failed" | "pending";
  };
}

const props = defineProps<Props>();
const emit = defineEmits<{
  emailSent: [invoiceId: string];
  reminderSent: [invoiceId: string];
}>();

const sending = ref(false);
const sendingReminder = ref(false);

const showEmailStatus = computed(() => {
  return props.invoice.status === "sent" && props.invoice.emailDeliveryStatus;
});

const canSendEmail = computed(() => {
  return props.invoice.status === "sent";
});

const canSendReminder = computed(() => {
  const dueDate = new Date(props.invoice.dueDate);
  const today = new Date();
  return props.invoice.status === "sent" && dueDate < today;
});

const emailStatusClass = computed(() => {
  const status = props.invoice.emailDeliveryStatus;
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "sent":
      return "bg-blue-100 text-blue-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
});

const emailStatusIcon = computed(() => {
  const status = props.invoice.emailDeliveryStatus;
  switch (status) {
    case "delivered":
      return CheckCircleIcon;
    case "sent":
      return PaperAirplaneIcon;
    case "failed":
      return ExclamationCircleIcon;
    case "pending":
      return ClockIcon;
    default:
      return ClockIcon;
  }
});

const emailStatusText = computed(() => {
  const status = props.invoice.emailDeliveryStatus;
  switch (status) {
    case "delivered":
      return "Delivered";
    case "sent":
      return "Email Sent";
    case "failed":
      return "Failed";
    case "pending":
      return "Pending";
    default:
      return "Unknown";
  }
});

const sendInvoiceEmail = async () => {
  if (sending.value) return;

  sending.value = true;
  try {
    // This would need to be implemented in the invoices service
    // await invoicesService.sendEmail(props.invoice.id);
    emit("emailSent", props.invoice.id);
  } catch (error) {
    console.error("Failed to send email:", error);
  } finally {
    sending.value = false;
  }
};

const sendPaymentReminder = async () => {
  if (sendingReminder.value) return;

  sendingReminder.value = true;
  try {
    await reportsService.sendPaymentReminder(props.invoice.id);
    emit("reminderSent", props.invoice.id);
  } catch (error) {
    console.error("Failed to send reminder:", error);
  } finally {
    sendingReminder.value = false;
  }
};
</script>
