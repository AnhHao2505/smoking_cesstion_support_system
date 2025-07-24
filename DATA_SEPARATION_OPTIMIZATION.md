# Tối ưu hóa phân tách Data giữa các Component

## Vấn đề trước khi tối ưu

### 🔴 Vấn đề chính

- Các component `/member/daily-checkin`, `/member/daily-record`, và `/member/smoking-status` đang fetch data chung từ các service giống nhau
- Dẫn đến lỗi **"Không phải tài nguyên của bạn"** không cần thiết
- Component `DailyCheckin` fetch data thống kê không cần thiết cho việc đánh giá nghiện thuốc

### 🔴 Các vấn đề cụ thể

1. **DailyCheckin** fetch `getQuitPlanData()` và `getLatestAssessment()` để hiển thị progress
2. **DailyLog** fetch data từ `memberDashboardService`
3. **SmokingStatus** fetch data từ nhiều service khác nhau
4. Tất cả đều fetch data có thể gây conflict về quyền truy cập

## Giải pháp tối ưu hóa

### ✅ Nguyên tắc phân tách trách nhiệm

#### 1. **DailyCheckin** - Chỉ tập trung đánh giá nghiện thuốc

```jsx
// TRƯỚC KHI TỐI ỰU
useEffect(() => {
	const fetchData = async () => {
		const basicProgress = await getBasicProgress(userId);
		const latestStatus = await getLatestAssessment(userId);
		// ... fetch nhiều data không cần thiết
	};
	fetchData();
}, [userId]);

// SAU KHI TỐI ỰU
useEffect(() => {
	// DailyCheckin không cần fetch data thống kê
	// Chỉ tập trung vào form đánh giá nghiện thuốc
	setLoading(false);
}, [userId]);
```

**Thay đổi:**

- ❌ Bỏ fetch `getBasicProgress()`
- ❌ Bỏ fetch `getLatestAssessment()`
- ❌ Bỏ hiển thị progress indicators
- ✅ Chỉ tạo đánh giá mới với `submitAddictionAssessment()`
- ✅ Thêm link chuyển đến `/member/smoking-status` để xem thống kê

#### 2. **SmokingStatusView** - Hiển thị tất cả thống kê

```jsx
// Component này sẽ là nơi duy nhất hiển thị:
- Lịch sử đánh giá nghiện thuốc
- Thống kê tiến độ cai thuốc
- Xu hướng thay đổi mức độ nghiện
- Gợi ý và recommendations
```

#### 3. **DailyLog** - Chỉ xử lý daily records

```jsx
// Sẽ có service riêng: dailyLogService.js
- Chỉ fetch daily records
- Không fetch quit plan data
- Không fetch smoking status
```

### ✅ Các service độc lập

#### `dailyCheckinService.js`

```javascript
export const submitAddictionAssessment = async (assessmentData) => {
	// Chỉ tạo đánh giá mới
};

export const calculateAddictionScore = (formData) => {
	// Tính điểm nghiện từ form
};

export const getAddictionLevel = (totalPoints) => {
	// Xác định mức độ nghiện
};
```

#### `smokingStatusService.js`

```javascript
export const getSmokingStatusHistory = async (userId, limit) => {
	// Lấy lịch sử đánh giá
};

export const getCurrentSmokingStatus = async (userId) => {
	// Lấy trạng thái hiện tại
};

export const getAddictionTrend = async (userId) => {
	// Phân tích xu hướng
};
```

## Lợi ích sau khi tối ưu

### 🚀 Performance

- Giảm số lượng API calls không cần thiết
- Tránh fetch data duplicate
- Component load nhanh hơn

### 🔒 Security

- Tránh lỗi "Không phải tài nguyên của bạn"
- Mỗi component chỉ fetch data nó thực sự cần
- Kiểm soát quyền truy cập tốt hơn

### 🧹 Clean Code

- Mỗi component có trách nhiệm rõ ràng
- Dễ debug và maintain
- Code dễ hiểu hơn

### 📱 User Experience

- Form đánh giá load nhanh hơn
- Thống kê được tập trung ở một nơi
- Navigation rõ ràng giữa các tính năng

## Flow người dùng được tối ưu

```
1. User vào /member/daily-checkin
   ↓
2. Hoàn thành form đánh giá (không fetch data thống kê)
   ↓
3. Sau khi submit, chuyển đến /member/smoking-status
   ↓
4. Xem tất cả thống kê, lịch sử, xu hướng tại đây
   ↓
5. User có thể tạo đánh giá mới từ nút "Đánh giá mới"
```

## Code example

### DailyCheckin - Tối ưu hóa

```jsx
// Chỉ có alert gợi ý
<Alert
	message="Xem thống kê chi tiết"
	description={
		<div>
			Sau khi hoàn thành đánh giá, bạn có thể xem thống kê chi tiết tại{" "}
			<Button
				type="link"
				onClick={() => navigate("/member/smoking-status")}
			>
				Trạng thái nghiện thuốc
			</Button>
		</div>
	}
	type="info"
	showIcon
/>

// Form đánh giá đơn giản, không fetch data
```

### SmokingStatusView - Hiển thị đầy đủ

```jsx
// Hiển thị đầy đủ thống kê
<Row gutter={[16, 16]}>
  <Col><Statistic title="Mức độ nghiện" value={status.level} /></Col>
  <Col><Statistic title="Điểm đánh giá" value={status.score} /></Col>
  <Col><Statistic title="Điếu/ngày" value={status.dailySmoking} /></Col>
</Row>

// Lịch sử đánh giá
<Table dataSource={statusHistory} columns={historyColumns} />

// Xu hướng thay đổi
<Progress percent={trend.change} />
```

## Checklist triển khai

- [x] Tối ưu `DailyCheckin.jsx` - bỏ fetch data thống kê
- [x] Tạo `dailyCheckinService.js` độc lập
- [x] Cập nhật `SmokingStatusView.jsx` với `smokingStatusService.js`
- [ ] Tạo `dailyLogService.js` cho DailyLog component
- [ ] Tạo `dailyRecordService.js` cho DailyRecord component
- [ ] Test các trang đảm bảo không có lỗi quyền truy cập
- [ ] Monitor performance improvement

## Kết luận

Việc phân tách data giúp:

- **DailyCheckin**: Tập trung vào đánh giá nghiện thuốc
- **SmokingStatus**: Hiển thị tất cả thống kê và lịch sử
- **DailyLog/DailyRecord**: Xử lý riêng daily tracking

Mỗi component có trách nhiệm rõ ràng, tránh conflict và cải thiện performance.
