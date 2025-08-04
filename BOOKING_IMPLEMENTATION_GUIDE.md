# Hướng dẫn test chức năng đặt lịch hẹn

## Chức năng đã implement:

### 1. Flow đặt lịch mới:
- **Bước 1**: Đăng nhập tài khoản premium
- **Bước 2**: Chọn coach từ màn `/member/appointments`
- **Bước 3**: Sau khi chọn coach, tự động chuyển đến `/member/chat`
- **Bước 4**: Trong chat, click nút "Đặt lịch hẹn" để mở modal 4 bước
- **Bước 5**: Hoàn tất đặt lịch và tự động navigate về chat

### 2. Modal đặt lịch 4 bước:
1. **Chọn ngày**: Sử dụng Calendar component
2. **Chọn giờ**: Hiển thị slots dựa trên working hours của tất cả coach
3. **Thông tin**: Nhập lý do và ghi chú
4. **Xác nhận**: Review và confirm booking

### 3. Tính năng chính:
- Lấy working hours từ tất cả coach
- Chia slots thành buổi sáng/chiều
- Kiểm tra slots đã bị đặt (disabled)
- Mỗi member chỉ đặt được 1 slot cho 1 ngày
- Sau khi book thành công, navigate về chat room

### 4. Files đã tạo/sửa:
- `src/components/member/BookingSteps.jsx` - Modal 4 bước mới
- `src/services/appointmentService.js` - Thêm API endpoints
- `src/components/member/ChatPage.jsx` - Sử dụng BookingSteps
- `src/components/member/AppointmentManagement.jsx` - Navigate về chat
- `src/styles/ChatPage.css` - Thêm styling

### 5. API endpoints cần:
- `POST /appointment/book` - Đặt lịch hẹn
- `GET /appointment/booked-slots?date=YYYY-MM-DD` - Lấy slots đã book
- `GET /appointment/available-slots-by-date?date=YYYY-MM-DD` - Lấy slots available

## Cách test:

1. **Chọn coach**:
   ```
   1. Đăng nhập member premium
   2. Vào /member/appointments  
   3. Chọn 1 coach có working hours
   4. Confirm chọn coach
   5. Sẽ tự động navigate về /member/chat
   ```

2. **Đặt lịch hẹn**:
   ```
   1. Trong chat page, click "Đặt lịch hẹn"
   2. Modal 4 bước sẽ hiện
   3. Bước 1: Chọn ngày (Calendar)
   4. Bước 2: Chọn giờ (slots từ working hours)
   5. Bước 3: Nhập thông tin
   6. Bước 4: Xác nhận và book
   ```

3. **Kiểm tra kết quả**:
   ```
   - Message "Đã đặt lịch thành công!"
   - Tự động navigate về /member/chat
   - Slot đã book sẽ bị disable cho user khác
   ```

## Lưu ý:
- Working hours phải được config cho từng coach
- API endpoints cần implement ở backend
- Slots 30 phút/slot, từ working hours của coach
- Validation: không book quá khứ, không book slot đã được đặt
