export type PaymentStatus = "pending" | "paid" | "failed";

export type PaymentType = {
  _id?: string;
  userId: string;
  packageId: string;
  amount: number;
  status: PaymentStatus;
  paymentDate?: string;
  createdAt?: string;
};

export interface TransactionDetails {
  order_id: string;
  gross_amount: number;
}

export interface CreditCard {
  secure: boolean;
}

export interface CustomerDetails {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface ItemDetail {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface SnapParameter {
  transaction_details: TransactionDetails;
  credit_card?: CreditCard;
  customer_details?: CustomerDetails;
  item_details?: ItemDetail[];
}

export interface SnapResponse {
  token: string;
  redirect_url: string;
}

export class Snap {
  constructor(options: { isProduction: boolean; serverKey: string });
  createTransaction(parameter: SnapParameter): Promise<SnapResponse>;
}
