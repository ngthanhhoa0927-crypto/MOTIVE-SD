# Motive-SD 

Dự án Backend xây dựng bằng **Node.js** sử dụng framework **Hono**, kết hợp **Drizzle ORM** quản lý Database (PostgreSQL chạy trên Docker), và **Zod** để validate dữ liệu đầu vào.

## Công Nghệ Sử Dụng

- **Framework**: [Hono](https://hono.dev/) (Siêu nhẹ, cực nhanh) - Chạy trên `@hono/node-server`
- **Database**: PostgreSQL (Dockerized)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Validate & Schema**: Zod & `@hono/zod-validator`
- **Security**: 
  - Hash mật khẩu bằng `bcryptjs`
  - JSON Web Token (JWT) bằng `hono/jwt`

---

## Hướng Dẫn Cài Đặt (Setup)

### 1. Khởi động Cơ sở dữ liệu (PostgreSQL)
Dự án có sẵn file `docker-compose.yml` để chạy Database. Mở Terminal tại thư mục gốc và gõ lệnh:
```bash
docker-compose up -d
```
*(Yêu cầu máy phải cài sẵn Docker Desktop).*

### 2. Cấu hình biến môi trường
Tạo file `.env` (nếu chưa có) nằm chung thư mục với code Backend (trong thư mục `backend`) với nội dung sau:
```env
# Kết nối đến DB vừa chạy bằn Docker
DATABASE_URL=postgresql://admin:secretPasswd@localhost:5432/motiveSD

# Khóa bí mật dùng cho JWT (Nên random một đoạn mã dài)
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Cài đặt các thư viện
Mở Terminal, trỏ vào khu vực của backend và cài npm packages:
```bash
cd backend
npm install
```

### 4. Thiết lập Datatable (Migrations & Drizzle Studio)
Chạy các dòng lệnh sau tương tác với Database thông qua config của Drizzle:
- **Tạo migration (từ schema)**: `npm run db:generate`
- **Push migration (cập nhật DB)**: `npm run db:migrate`
- *(Tuỳ chọn)* Nếu muốn xem giao diện quản lý Database trực quan: `npm run db:studio`

### 5. Khởi động Backend
Khởi chạy Server ở chế độ nhà phát triển (tự động restart khi sửa code):
```bash
npm run dev
```
> Server sẽ luôn sẵn sàng nhận Request tại địa chỉ: **http://localhost:3000**
