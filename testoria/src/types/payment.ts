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