const createAssistantPrompt = `
✅ PROMPT YÊU CẦU NGHIÊN CỨU & NHÂN BẢN NHÂN VẬT:

Bạn cần phân tích và mô phỏng lại nhân vật "[Tên nhân vật]" với độ chính xác cao nhất, nhằm mục đích tạo bản sao kỹ thuật số (digital clone / AI persona).

Kết quả trả về cần giống tính cách, tư duy, ngôn ngữ, hành vi, và phản ứng của nhân vật gốc đến mức tối đa.

Yêu cầu quan trọng:
- Trả lời đầy đủ 7 phần dưới đây.
- Ưu tiên dẫn chứng thực tế từ hành động, lời nói, bối cảnh để chứng minh phân tích.
- Mọi mô tả phải đủ chi tiết để huấn luyện hoặc viết prompt nhân bản AI mà không làm sai lệch bản chất nhân vật.
- Nếu có, hãy so sánh với các nhân vật tương đồng hoặc đối lập để làm nổi bật cá tính riêng.

---

1. Thông tin nhận diện cá nhân
- Họ tên đầy đủ, biệt danh, cách người khác gọi
- Tuổi, giới tính, dân tộc, vùng miền, quốc tịch
- Ngoại hình chi tiết: khuôn mặt, vóc dáng, ánh mắt, trang phục, phong thái
- Giọng nói: tông, âm lượng, nhấn nhá, cách xưng hô

2. Tư duy – Tính cách – Hành vi đặc trưng
- Tính cách nổi bật, điểm phân biệt với người khác
- Triết lý sống / giá trị cốt lõi ảnh hưởng quyết định
- Phong cách tư duy: logic, cảm tính, trực giác, đạo đức
- Thói quen lặp lại (daily habits)
- Nỗi sợ, điểm yếu tiềm ẩn
- Phản ứng trong các tình huống cụ thể: stress, mâu thuẫn, khen chê
- Cách thể hiện cảm xúc (kiềm chế, bùng nổ, giấu kín...)

3. Bối cảnh sống & định hình nhân vật
- Gia đình, tuổi thơ, những người ảnh hưởng sâu sắc
- Nghề nghiệp hiện tại & kỹ năng chuyên biệt
- Cột mốc, biến cố, vết thương tâm lý trong quá khứ
- Tầng lớp xã hội, môi trường văn hóa – chính trị – xã hội sống trong
- Mối quan hệ chủ chốt và vai trò trong các mối quan hệ đó

4. Mục tiêu – Động lực – Xung đột
- Mục tiêu sống sâu xa nhất của nhân vật
- Mong muốn ngắn hạn – dài hạn
- Những thứ khiến nhân vật hành động ngay lập tức (trigger)
- Xung đột nội tâm sâu sắc nhất và cách giải quyết
- Những thứ nhân vật ghét cay đắng / tôn thờ tuyệt đối

5. Hành vi & Phản ứng trong ngữ cảnh
- Khi bị phản bội, bị xúc phạm, bị tổn thương
- Khi chiến thắng, khi được yêu thương, khi thất bại
- Cách đối xử với người lạ, người thân, kẻ thù
- Giao tiếp trên mạng xã hội, phản ứng với thông tin trái chiều
- Ví dụ: một ngày của nhân vật trôi qua như thế nào

6. Cách thể hiện cá tính bằng ngôn ngữ
- Giọng văn mô phỏng: học thuật, cảm xúc, hài hước, lạnh lùng, thân thiện...
- Từ vựng thường dùng, cấu trúc câu đặc trưng, câu cửa miệng
- Mẫu đoạn văn / chat / nhật ký / status do nhân vật viết
- Có dùng emoji, từ lóng, tiếng nước ngoài không? Cách dùng ra sao?
- Những từ ngữ hoặc kiểu nói không bao giờ dùng

7. Vai trò – Archetype – Phân tích đối chiếu
- Vai trò nhân vật trong tổ chức / cộng đồng / cốt truyện
- Archetype tương ứng (The Hero, The Outlaw, The Lover...)
- So sánh với một nhân vật khác để làm nổi bật sự độc đáo
- Điểm nổi bật khiến người khác nhớ mãi về nhân vật này

---

🧪 Nếu có:
- File dữ liệu gốc: Trích đoạn gốc, đoạn hội thoại, câu quote thực tế

- Thang đo tính cách OCEAN (Big Five) nếu áp dụng:
  - Openness
  - Conscientiousness
  - Extraversion
  - Agreeableness
  - Neuroticism

---

📌 Ghi chú cuối cùng:
Mục tiêu là: khi người khác chỉ đọc mô tả, họ có thể viết ra một AI mô phỏng nhân vật này thật như thật, khiến người dùng cảm giác "đúng là nhân vật đó đang nói chuyện".
`;

export default createAssistantPrompt;
