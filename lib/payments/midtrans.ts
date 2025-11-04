import type { BookingStatus, PaymentStatus } from "@/lib/supabase/status";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_SNAP_BASE_URL =
  process.env.MIDTRANS_SNAP_BASE_URL ??
  process.env.MIDTRANS_BASE_URL ??
  "https://app.sandbox.midtrans.com";
const MIDTRANS_API_BASE_URL =
  process.env.MIDTRANS_API_BASE_URL ?? "https://api.sandbox.midtrans.com";

export type MidtransStatusResponse = {
  order_id?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
  status_message?: string;
};

export class MidtransTransactionError extends Error {
  readonly status: number;
  readonly detail?: unknown;

  constructor(
    message: string,
    options: { status?: number; detail?: unknown } = {}
  ) {
    super(message);
    this.name = "MidtransTransactionError";
    this.status = options.status ?? 500;
    this.detail = options.detail;
  }
}

export type MidtransCustomer = {
  firstName?: string | null;
  email?: string | null;
};

export type MidtransItem = {
  id: string;
  price: number;
  quantity: number;
  name?: string | null;
};

export type CreateMidtransTransactionParams = {
  orderId: string;
  amount: number;
  courtName?: string | null;
  customer?: MidtransCustomer | null;
  items?: MidtransItem[] | null;
  successRedirectUrl?: string | null;
};

const DEFAULT_ITEM_ID = "court-reservation";
const DEFAULT_ITEM_NAME = "Booking Lapangan CourtEase";

function sanitizeItems(
  items: MidtransItem[] | null | undefined,
  fallbackName: string | null | undefined,
  amount: number
) {
  const normalized = Array.isArray(items) ? items : [];
  const validItems = normalized
    .map((item) => ({
      id: typeof item.id === "string" ? item.id.trim() : "",
      price: Number(item.price),
      quantity: Number(item.quantity),
      name: item.name ?? fallbackName ?? DEFAULT_ITEM_NAME,
    }))
    .filter(
      (
        item
      ): item is {
        id: string;
        price: number;
        quantity: number;
        name: string;
      } =>
        Boolean(item.id) &&
        Number.isFinite(item.price) &&
        item.price > 0 &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0
    );

  if (validItems.length > 0) {
    return validItems;
  }

  return [
    {
      id: DEFAULT_ITEM_ID,
      price: amount,
      quantity: 1,
      name: fallbackName ?? DEFAULT_ITEM_NAME,
    },
  ];
}

function sanitizeCustomer(customer: MidtransCustomer | null | undefined) {
  const first_name =
    typeof customer?.firstName === "string" && customer.firstName.trim()
      ? customer.firstName.trim()
      : "CourtEase User";
  const email =
    typeof customer?.email === "string" && customer.email.trim()
      ? customer.email.trim()
      : "no-reply@courtease.id";

  return { first_name, email };
}

export async function createMidtransTransaction({
  orderId,
  amount,
  courtName,
  customer,
  items,
  successRedirectUrl,
}: CreateMidtransTransactionParams): Promise<{
  token: string;
  redirect_url: string | null;
}> {
  if (!MIDTRANS_SERVER_KEY) {
    throw new MidtransTransactionError(
      "Midtrans belum dikonfigurasi. Isi MIDTRANS_SERVER_KEY di environment server.",
      { status: 500 }
    );
  }

  const trimmedOrderId = orderId.trim();

  if (!trimmedOrderId) {
    throw new MidtransTransactionError("ID pesanan Midtrans tidak valid.", {
      status: 400,
    });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new MidtransTransactionError("Jumlah pembayaran tidak valid.", {
      status: 400,
    });
  }

  const payload: Record<string, unknown> = {
    transaction_details: {
      order_id: trimmedOrderId,
      gross_amount: amount,
    },
    customer_details: sanitizeCustomer(customer ?? null),
    item_details: sanitizeItems(items ?? null, courtName ?? null, amount),
    credit_card: {
      secure: true,
    },
  };

  if (successRedirectUrl && successRedirectUrl.trim()) {
    payload.callbacks = {
      finish: successRedirectUrl.trim(),
    };
  }

  const response = await fetch(
    `${MIDTRANS_SNAP_BASE_URL}/snap/v1/transactions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString(
          "base64"
        )}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => null);
    throw new MidtransTransactionError("Gagal membuat transaksi Midtrans.", {
      status: 502,
      detail,
    });
  }

  const data = (await response.json().catch((error) => {
    throw new MidtransTransactionError(
      "Midtrans mengembalikan respons tidak valid.",
      {
        status: 502,
        detail: error instanceof Error ? error.message : error,
      }
    );
  })) as Record<string, unknown> | null;

  if (!data || typeof data !== "object") {
    throw new MidtransTransactionError(
      "Midtrans mengembalikan respons tidak valid.",
      { status: 502 }
    );
  }

  const token = (() => {
    if (typeof data.token === "string" && data.token.trim()) {
      return data.token;
    }

    if (typeof data.snap_token === "string" && data.snap_token.trim()) {
      return data.snap_token;
    }

    return null;
  })();

  if (!token) {
    throw new MidtransTransactionError(
      "Midtrans mengembalikan respons tidak valid.",
      { status: 502, detail: data }
    );
  }

  const redirectUrl =
    typeof data.redirect_url === "string" && data.redirect_url.trim()
      ? data.redirect_url
      : null;

  return {
    token,
    redirect_url: redirectUrl,
  };
}

export async function getMidtransTransactionStatus(
  orderId: string
): Promise<MidtransStatusResponse | null> {
  if (!MIDTRANS_SERVER_KEY) {
    console.warn(
      "Midtrans server key is not configured. Unable to verify transaction status."
    );
    return null;
  }

  const trimmedOrderId = orderId.trim();

  if (!trimmedOrderId) {
    return null;
  }

  const response = await fetch(
    `${MIDTRANS_API_BASE_URL}/v2/${encodeURIComponent(trimmedOrderId)}/status`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString(
          "base64"
        )}`,
      },
    }
  );

  if (!response.ok) {
    let detail: string | Record<string, unknown> | null = null;

    try {
      const raw = await response.text();

      if (raw.trim()) {
        try {
          detail = JSON.parse(raw);
        } catch {
          detail = raw;
        }
      }
    } catch (readError) {
      console.error("Failed to read Midtrans error response", readError);
    }

    console.error("Failed to fetch Midtrans transaction status", {
      orderId: trimmedOrderId,
      status: response.status,
      statusText: response.statusText,
      detail,
    });
    return null;
  }

  const data = (await response.json().catch((error) => {
    console.error("Invalid Midtrans status response", error);
    return null;
  })) as MidtransStatusResponse | null;

  if (!data || typeof data !== "object") {
    return null;
  }

  return data;
}

function normalizeMidtransValue(value: unknown) {
  return typeof value === "string" ? value.toLowerCase() : "";
}

export function mapMidtransStatusToBooking(
  status: MidtransStatusResponse | null
): { paymentStatus: PaymentStatus; bookingStatus: BookingStatus } | null {
  if (!status) {
    return null;
  }

  const transactionStatus = normalizeMidtransValue(status.transaction_status);
  const fraudStatus = normalizeMidtransValue(status.fraud_status);

  if (!transactionStatus) {
    return null;
  }

  switch (transactionStatus) {
    case "settlement":
      return { paymentStatus: "paid", bookingStatus: "confirmed" };
    case "capture":
      if (fraudStatus === "challenge") {
        return {
          paymentStatus: "waiting_confirmation",
          bookingStatus: "pending",
        };
      }

      return { paymentStatus: "paid", bookingStatus: "confirmed" };
    case "authorize":
      return {
        paymentStatus: "waiting_confirmation",
        bookingStatus: "pending",
      };
    case "pending":
      return { paymentStatus: "pending", bookingStatus: "pending" };
    case "expire":
    case "expired":
      return { paymentStatus: "expired", bookingStatus: "cancelled" };
    case "deny":
    case "cancel":
    case "failure":
      return { paymentStatus: "cancelled", bookingStatus: "cancelled" };
    case "refund":
    case "partial_refund":
    case "chargeback":
    case "partial_chargeback":
      return { paymentStatus: "cancelled", bookingStatus: "cancelled" };
    default:
      return null;
  }
}
