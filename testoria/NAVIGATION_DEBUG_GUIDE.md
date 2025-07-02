# Testing Navigation Guard - Instruksi Debug

## Masalah
User dengan cookies valid tetap berada di home page (/) padahal seharusnya auto redirect ke dashboard sesuai role.

## Solusi yang Diimplementasi

### 1. Server-side Middleware Redirect
- **File**: `src/middleware.ts`
- **Fungsi**: Menangani redirect di server-side sebelum halaman dimuat
- **Kelebihan**: Lebih reliable, tidak bergantung pada JavaScript client

### 2. Debug Panel
- **File**: `src/components/DebugPanel.tsx` 
- **Lokasi**: Tombol merah di kanan bawah halaman home
- **Fungsi**: Monitoring cookies, testing login, dan debugging

### 3. Debug Utilities
- **File**: `src/utils/debugAuth.ts`
- **Akses**: `window.debugAuth` di browser console
- **Fungsi**: Testing manual redirect dan auth state

## Cara Testing

### 1. Buka Aplikasi
```bash
npm run dev
```

### 2. Akses Home Page
- Buka `http://localhost:3000`
- Lihat console browser untuk log middleware

### 3. Test dengan Debug Panel
- Klik tombol "🔧 Debug" di kanan bawah
- Gunakan tombol "Simulate Login" untuk test:
  - **Admin** → seharusnya redirect ke `/dashboard-admin`
  - **Creator** → seharusnya redirect ke `/dashboard-creator` 
  - **Customer** → seharusnya redirect ke `/dashboard-customer`

### 4. Test dengan Browser Console
```javascript
// Lihat status auth
window.debugAuth.showAuthCookies()

// Simulate login
window.debugAuth.simulateLogin('customer')

// Test redirect manual
window.debugAuth.testRedirect()

// Clear cookies
window.debugAuth.clearAuthCookies()
```

### 5. Test dengan Login Real
1. Akses `/login`
2. Login dengan akun valid
3. Seharusnya redirect ke dashboard
4. Jika berhasil, coba akses `/` lagi
5. Seharusnya langsung redirect ke dashboard

## Monitoring Log

### Middleware Log (Server Console)
```
=== MIDDLEWARE ROOT PATH CHECK ===
Middleware: Root path accessed
Middleware: Auth cookie exists: true
Middleware: Role cookie: customer
Middleware: *** REDIRECTING *** authenticated user to: /dashboard-customer
=== END MIDDLEWARE REDIRECT ===
```

### Browser Console Log
```
NavigationGuard: Client-side ready
debugAuth utilities loaded
```

## Troubleshooting

### Jika Middleware Tidak Jalan
1. Periksa `src/middleware.ts` config matcher
2. Pastikan cookies `Authorization` dan `user-role` ada
3. Restart development server

### Jika Cookies Tidak Ada
1. Login ulang
2. Periksa `src/app/api/login/route.ts`
3. Pastikan cookie setting benar

### Jika Redirect Loop
1. Clear semua cookies
2. Restart browser
3. Coba login ulang

## Expected Behavior

1. **User tidak login** → tetap di home page `/`
2. **User login sebagai admin** → redirect ke `/dashboard-admin`
3. **User login sebagai creator** → redirect ke `/dashboard-creator`
4. **User login sebagai customer** → redirect ke `/dashboard-customer`

## Debug Commands

### Check Current State
```javascript
// Tampilkan semua cookies
document.cookie

// Check auth status
window.debugAuth.showAuthCookies()

// Manual diagnostic
window.debugAuth.diagnose()
```

### Force Clear Everything
```javascript
// Clear semua auth cookies
window.debugAuth.clearAuthCookies()

// Atau manual
document.cookie = "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
document.cookie = "user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
```

### Test Redirect Logic
```javascript
// Test redirect untuk role tertentu
window.debugAuth.testRedirect('admin')
window.debugAuth.testRedirect('creator') 
window.debugAuth.testRedirect('customer')
```

## File yang Dimodifikasi

1. **`src/middleware.ts`** - Server-side redirect logic
2. **`src/components/NavigationGuard.tsx`** - Simplified client guard
3. **`src/components/DebugPanel.tsx`** - Debug interface
4. **`src/app/page.tsx`** - Added debug panel
5. **`src/utils/debugAuth.ts`** - Debug utilities

## Next Steps

Jika masih belum bekerja:
1. Periksa log server dan browser console
2. Test dengan debug panel
3. Gunakan browser developer tools untuk inspect cookies
4. Coba dengan browser incognito/private mode
