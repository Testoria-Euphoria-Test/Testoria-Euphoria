import crypto from "crypto";

export function verifyMidtransSignature({
    order_id,
    status_code,
    gross_amount,
    signature_key,
    serverKey,
}: {
    order_id: string;
    status_code: string;
    gross_amount: string;
    signature_key: string;
    serverKey: string;
}) {
    const rawSignature = order_id + status_code + gross_amount + serverKey ;
    const expectedSignature = crypto.createHash("sha512").update(rawSignature).digest("hex");
    return expectedSignature === signature_key;
}