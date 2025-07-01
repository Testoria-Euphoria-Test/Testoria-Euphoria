# Midtrans Webhook Setup Document### 4. Pending Payment Continuation

- **Continue Payment**: User dapat melanjutkan pembayaran yang pending
- **Token Regeneration**: Generate token baru untuk order_id yang sama
- **Same Order ID**: Menggunakan order_id yang sama untuk melanjutkan pembayaran
- **Status Update**: Status ter-update via webhook setelah pembayaran berhasil

### 5. Auto-refresh untuk Status Pendingtion

## Webhook URL Configuration

Webhook endpoint yang harus dikonfigurasi di dashboard Midtrans:

```
https://r1fnwz2s-3000.asse.devtunnels.ms/api/payments/webhook
```

## Status Mapping

Status dari Midtrans akan dimapping ke status internal aplikasi sebagai berikut:

| Midtrans Status                   | App Status | Deskripsi                        |
| --------------------------------- | ---------- | -------------------------------- |
| pending                           | pending    | Menunggu pembayaran              |
| settlement                        | paid       | Pembayaran berhasil              |
| capture (fraud_status: accept)    | paid       | Pembayaran kartu kredit berhasil |
| capture (fraud_status: challenge) | pending    | Menunggu review manual           |
| cancel                            | failed     | Pembayaran dibatalkan            |
| deny                              | failed     | Pembayaran ditolak               |
| expire                            | failed     | Pembayaran expired               |
| failure                           | failed     | Pembayaran gagal                 |

## Features

### 1. Real-time Status Update

- Webhook akan mengupdate status pembayaran secara real-time
- Status ditampilkan di halaman payment history
- ButtonPayment component akan menampilkan status yang tepat

### 2. Auto-refresh untuk Status Pending

- Jika status pembayaran pending, aplikasi akan melakukan auto-refresh setiap 10 detik
- User akan melihat notifikasi "Pembayaran Pending" dengan loading indicator

### 3. Signature Verification

- Webhook memverifikasi signature dari Midtrans untuk keamanan
- Dalam mode development, signature verification di-skip untuk testing

### 4. Error Handling

- Comprehensive error handling untuk berbagai skenario
- Logging detail untuk debugging
- Graceful fallback untuk status yang tidak dikenal

## Testing Webhook

Untuk testing webhook, Anda bisa menggunakan:

1. **Midtrans Simulator**: Gunakan simulator di dashboard Midtrans
2. **Manual Testing**: Send POST request ke endpoint webhook dengan payload yang sesuai
3. **ngrok/devtunnels**: Pastikan webhook URL dapat diakses dari internet

## Environment Variables

Pastikan environment variable berikut sudah dikonfigurasi:

```env
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
NODE_ENV=development # untuk skip signature verification
```

## API Endpoints

- `POST /api/payments/webhook` - Endpoint untuk webhook Midtrans
- `GET /api/payments` - Get payment history
- `POST /api/payments` - Create new payment
- `POST /api/payments/token` - Get Snap token

## Flow Pembayaran

### Normal Payment Flow

1. User click "Bayar Sekarang"
2. Aplikasi membuat payment record dengan status "pending"
3. User redirect ke Midtrans Snap
4. User melakukan pembayaran
5. Midtrans send webhook notification ke aplikasi
6. Aplikasi update status pembayaran berdasarkan notifikasi
7. User melihat status ter-update di UI (auto-refresh untuk pending status)

### Continue Pending Payment Flow

1. User melihat status "Pembayaran Pending" dengan tombol "Lanjutkan Pembayaran"
2. User click "Lanjutkan Pembayaran"
3. Aplikasi mencari payment record yang pending
4. Generate token baru untuk order_id yang sama
5. User redirect ke Midtrans Snap
6. User melakukan pembayaran
7. Midtrans send webhook notification
8. Status ter-update menjadi "paid"
9. User dapat mengakses package
