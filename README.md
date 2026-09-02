# Sổ Thu Chi — Quản lý tài chính cá nhân

Web app quản lý thu chi cá nhân. Chạy hoàn toàn trên trình duyệt, **không có server, không có đăng nhập, không đồng bộ đám mây** — toàn bộ dữ liệu lưu ngay trên thiết bị của bạn (localStorage).

---

## 1. Chạy thử trên máy tính (development)

### Bước 1 — Cài Node.js (chỉ cần làm 1 lần)
Nếu máy bạn chưa có Node.js, tải bản **LTS** tại: https://nodejs.org (cứ bấm Next liên tục khi cài).

Kiểm tra đã cài xong chưa — mở Terminal (macOS) hoặc PowerShell/CMD (Windows), gõ:
```bash
node -v
npm -v
```
Thấy hiện ra số phiên bản là được.

### Bước 2 — Cài thư viện cho project
Giải nén file zip này ra một thư mục, mở Terminal/CMD **tại đúng thư mục đó**, rồi chạy:
```bash
npm install
```
Lệnh này tải các thư viện cần thiết (React, Tailwind...), chỉ cần chạy 1 lần (hoặc mỗi khi bạn thấy báo thiếu package).

### Bước 3 — Chạy thử
```bash
npm run dev
```
Terminal sẽ hiện một đường link kiểu `http://localhost:5173` — mở link đó bằng trình duyệt là thấy app chạy. Sửa code ở đâu, trình duyệt tự cập nhật ngay ở đó (không cần bấm F5).

Nhấn `Ctrl + C` trong Terminal để dừng.

---

## 2. Đóng gói bản chạy thật (production build)

```bash
npm run build
```
Lệnh này tạo ra thư mục **`dist/`** — đây chính là "bản build" hoàn chỉnh, tối ưu tốc độ, sẵn sàng để đưa lên internet.

Muốn xem thử bản build này chạy đúng như thật chưa (trước khi deploy), chạy:
```bash
npm run preview
```

---

## 3. Đưa app lên Internet miễn phí bằng Netlify

Cách nhanh nhất, **không cần biết Git**:

1. Chạy `npm run build` như trên để có thư mục `dist/`.
2. Vào trang: https://app.netlify.com/drop
3. Kéo thả **nguyên thư mục `dist`** vào ô đó.
4. Đợi vài giây — Netlify tự cấp cho bạn một link dạng `ten-ngau-nhien.netlify.app`. Xong, app đã online.

> Muốn đổi tên link cho dễ nhớ: vào **Site settings → Change site name** trên Netlify.

**Cách nâng cao hơn (tự động deploy mỗi khi bạn sửa code):** đẩy source code này lên một repo GitHub, sau đó trên Netlify chọn **Add new site → Import an existing project → GitHub**, trỏ vào repo đó. File `netlify.toml` trong project đã cấu hình sẵn build command (`npm run build`) và thư mục publish (`dist`), nên không cần chỉnh gì thêm.

---

## 4. Cài app như một ứng dụng thật trên điện thoại (PWA)

Sau khi đã có link Netlify:

- **Android (Chrome):** mở link → nhấn menu (⋮) → **"Thêm vào Màn hình chính" / "Install app"**.
- **iPhone (Safari):** mở link → nhấn nút Share (hình vuông có mũi tên) → **"Thêm vào Màn hình chính"**.

App sẽ có icon riêng, mở lên full màn hình như app thật, và **dùng được cả khi không có mạng** (sau lần tải đầu tiên).

---

## 5. Về dữ liệu của bạn

- Toàn bộ dữ liệu (giao dịch, khoản vay, ngân sách, mục tiêu...) lưu trong **localStorage của trình duyệt** trên thiết bị bạn đang dùng.
- **Không tự đồng bộ** giữa điện thoại và máy tính, giữa các trình duyệt khác nhau.
- Nếu xóa lịch sử duyệt web / cache của trình duyệt, dữ liệu có thể mất — nên vào **Cài đặt → Sao lưu (.json)** định kỳ (ví dụ cuối tháng) để lưu file dự phòng. Khi cần, dùng **Khôi phục từ file** để nạp lại.
- Lần đầu mở app, hệ thống tự tạo sẵn vài giao dịch/mục tiêu/khoản vay mẫu để bạn hình dung cách dùng — bạn có thể xóa hết qua **Cài đặt → Xóa toàn bộ dữ liệu** rồi nhập dữ liệu thật của mình.

---

## 6. Cấu trúc thư mục (dành cho lúc bạn muốn tự sửa thêm)

```
src/
  types/            Định nghĩa kiểu dữ liệu (Transaction, Loan, Budget...)
  lib/               Hàm xử lý: tính toán, format tiền, lưu localStorage, export/import
  context/           Nơi quản lý toàn bộ state của app (FinanceContext)
  components/ui/     Các thành phần giao diện dùng chung (Button, Card, Dialog...)
  components/...     Các thành phần theo từng chức năng (dashboard, diary, stats, loans, settings)
  pages/             5 trang chính: Dashboard, Diary, Stats, Loans, Settings
  App.tsx            Khai báo route (đường dẫn) giữa các trang
public/
  icons/             Icon app (PWA)
  favicon.svg
netlify.toml         Cấu hình deploy Netlify
vite.config.ts       Cấu hình build + PWA
```

Muốn nhờ Claude Code hoặc Claude Cowork sửa/thêm tính năng, bạn chỉ cần đưa toàn bộ thư mục này và mô tả điều muốn thay đổi — cấu trúc rõ ràng nên AI đọc và sửa rất nhanh.
