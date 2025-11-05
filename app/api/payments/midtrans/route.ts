import { NextResponse } from "next/server";
import {
  createMidtransTransaction,
  MidtransTransactionError,
  type MidtransItem,
} from "@/lib/payments/midtrans";

export async function POST(request: Request) {
  type RawItem = {
    id?: unknown;
    price?: unknown;
    quantity?: unknown;
    name?: unknown;
  };

  type MidtransRequestPayload = {
    orderId?: unknown;
    amount?: unknown;
    courtName?: unknown;
    customer?: {
      firstName?: unknown;
      email?: unknown;
    };
    items?: RawItem[];
    successRedirectUrl?: unknown;
  };

  const body = (await request
    .json()
    .catch(() => ({}))) as MidtransRequestPayload;

  const orderId =
    typeof body.orderId === "string" && body.orderId.trim()
      ? body.orderId.trim()
      : `courtease-${Date.now()}`;

  const amount = Number(body.amount ?? 0);

  const sanitizedCustomer = {
    firstName:
      typeof body.customer?.firstName === "string"
        ? body.customer.firstName
        : null,
    email:
      typeof body.customer?.email === "string" ? body.customer.email : null,
  };

  // --- FIX: map ke (MidtransItem | null) lalu filter i !== null sebagai type guard ---
  const sanitizedItems: MidtransItem[] | null = Array.isArray(body.items)
    ? (body.items as RawItem[])
        .map((raw): MidtransItem | null => {
          const id = typeof raw.id === "string" ? raw.id.trim() : "";
          const price = Number(raw.price);
          const quantity = Number(raw.quantity);
          const name = typeof raw.name === "string" ? raw.name : null; // cocok dgn MidtransItem: string | null | undefined

          // validasi minimal
          if (!id) return null;
          if (!Number.isFinite(price) || price <= 0) return null;
          if (!Number.isFinite(quantity) || quantity <= 0) return null;

          return { id, name, price, quantity };
        })
        .filter((i): i is MidtransItem => i !== null)
    : null;

  const successRedirectUrl =
    typeof body.successRedirectUrl === "string" &&
    body.successRedirectUrl.trim()
      ? body.successRedirectUrl.trim()
      : null;

  try {
    const result = await createMidtransTransaction({
      orderId,
      amount,
      courtName:
        typeof body.courtName === "string" && body.courtName.trim()
          ? body.courtName.trim()
          : null,
      customer: sanitizedCustomer,
      items: sanitizedItems,
      successRedirectUrl,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MidtransTransactionError) {
      if (error.detail) {
        console.error("Midtrans error", error.detail);
      }

      const payload: Record<string, unknown> = {
        error: error.message,
      };
      if (typeof error.detail !== "undefined") {
        payload.detail = error.detail;
      }

      return NextResponse.json(payload, { status: error.status });
    }

    console.error("Unexpected Midtrans error", error);
    return NextResponse.json(
      { error: "Gagal membuat transaksi Midtrans." },
      { status: 500 },
    );
  }
}
