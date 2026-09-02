// Short, calm, encouraging lines for the finance-companion mascot.
// Grouped by context so each page/situation pulls from the right pool.

export const MASCOT_MESSAGES = {
  greeting_morning: [
    'Chào buổi sáng! Bắt đầu ngày mới thật gọn gàng nhé.',
    'Buổi sáng vui vẻ. Hôm nay bạn muốn quản lý tài chính thế nào?',
    'Một ngày mới, một trang sổ mới.',
    'Chào bạn! Cà phê sáng và vài phút xem lại ví tiền nhé.',
    'Sáng nay có kế hoạch chi tiêu gì không?',
    'Chúc bạn một ngày làm việc hiệu quả và chi tiêu hợp lý.',
    'Bắt đầu ngày mới bằng một mục tiêu nho nhỏ nhé.',
    'Chào buổi sáng! Mình luôn ở đây nếu bạn cần xem lại sổ.',
  ],
  greeting_afternoon: [
    'Chào buổi trưa! Nhớ ghi lại bữa ăn trưa nhé.',
    'Giữa ngày rồi, ví tiền của bạn vẫn ổn chứ?',
    'Buổi trưa nhẹ nhàng, sổ thu chi cũng nhẹ nhàng theo.',
    'Nghỉ trưa một chút, xem qua chi tiêu sáng nay nhé.',
    'Chào bạn! Nửa ngày trôi qua rồi đó.',
    'Một tách trà và vài dòng ghi chép — vừa đủ thư giãn.',
  ],
  greeting_afternoon_late: [
    'Chào buổi chiều! Công việc thế nào rồi?',
    'Buổi chiều rồi, tranh thủ ghi lại vài khoản chi nhé.',
    'Chiều nay bạn chi tiêu có gì đáng nhớ không?',
    'Sắp hết ngày làm việc, cùng tổng kết một chút nhé.',
    'Chào bạn! Đừng quên ghi chú các khoản phát sinh chiều nay.',
  ],
  greeting_evening: [
    'Chào buổi tối! Một ngày nữa sắp khép lại rồi.',
    'Tối rồi, cùng xem lại một ngày chi tiêu của bạn nhé.',
    'Chúc bạn buổi tối thư giãn, sổ sách gọn gàng.',
    'Trước khi nghỉ ngơi, ghi nốt vài khoản hôm nay nhé.',
    'Một ngày trôi qua, cảm ơn bạn đã chăm chỉ ghi chép.',
    'Buổi tối an yên. Hẹn gặp lại ngày mai nhé.',
  ],
  no_transaction_today: [
    'Hôm nay chưa có giao dịch nào cả.',
    'Nếu có phát sinh thu hoặc chi, hãy ghi lại nhé.',
    'Một ngày yên tĩnh về mặt tài chính — cũng tốt đấy chứ!',
    'Chưa ghi gì hôm nay, đừng để quên nhé.',
    'Sổ hôm nay còn trống, bạn có khoản nào cần thêm không?',
    'Ghi chép đều đặn giúp bạn kiểm soát tốt hơn đó.',
  ],
  transaction_saved: [
    'Đã lưu thành công. Tiếp tục phát huy nhé.',
    'Ghi chép xong rồi! Bạn đang làm rất tốt.',
    'Lưu lại rồi đó. Mỗi dòng ghi chép là một bước kiểm soát tốt hơn.',
    'Xong! Sổ của bạn luôn cập nhật, thật gọn gàng.',
    'Đã ghi nhận. Cứ đều đặn thế này nhé.',
    'Tuyệt, một khoản nữa đã được lưu lại an toàn.',
    'Lưu xong rồi, bạn thật chỉn chu.',
  ],
  budget_good: [
    'Tuyệt vời! Bạn đang kiểm soát chi tiêu rất tốt.',
    'Chi tiêu tháng này đang rất ổn, cứ giữ vững phong độ nhé.',
    'Ngân sách vẫn còn dư dả — làm tốt lắm!',
    'Bạn đang chi tiêu thông minh hơn tháng trước đấy.',
    'Kiểm soát tốt như thế này, mục tiêu tiết kiệm sẽ sớm về đích.',
    'Rất đáng khen — chi tiêu trong tầm kiểm soát.',
  ],
  budget_exceeded: [
    'Bạn đã vượt ngân sách tháng này rồi.',
    'Hãy cân nhắc các khoản chi còn lại nhé.',
    'Ngân sách đã vượt mức, mình cùng xem lại nhé.',
    'Chi tiêu tháng này hơi cao, thử siết lại vài khoản xem sao.',
    'Vượt ngân sách một chút rồi, tháng sau mình điều chỉnh nhé.',
    'Đừng lo, nhận ra sớm là đã tốt hơn rồi. Cân nhắc chi tiêu còn lại nhé.',
  ],
  loan_due_soon: [
    'Sắp đến ngày thanh toán khoản vay rồi đó.',
    'Đừng quên kiểm tra khoản vay sắp tới hạn nhé.',
    'Còn vài ngày nữa là đến kỳ trả nợ, chuẩn bị trước nhé.',
    'Nhắc nhẹ: một khoản vay sắp tới ngày thanh toán.',
  ],
  loan_generic: [
    'Trả nợ đúng hạn là cách chăm sóc tương lai tài chính của bạn.',
    'Theo dõi khoản vay đều đặn giúp bạn chủ động hơn.',
    'Mỗi lần trả góp là một bước gần hơn đến tự do tài chính.',
    'Khoản vay của bạn đang được kiểm soát tốt.',
  ],
  card_payment_due_soon: [
    'Đừng quên thanh toán thẻ tín dụng nhé.',
    'Sắp đến ngày thanh toán thẻ rồi đó.',
    'Còn vài ngày nữa là đến hạn thanh toán thẻ tín dụng.',
    'Nhắc nhẹ: một chiếc thẻ sắp tới ngày thanh toán.',
  ],
  card_limit_high: [
    'Bạn đã sử dụng hơn 80% hạn mức của thẻ.',
    'Hạn mức thẻ sắp chạm ngưỡng rồi, cân nhắc chi tiêu nhé.',
    'Thẻ này đang được dùng khá nhiều, thử chậm lại một chút.',
  ],
  card_payment_success: [
    'Tuyệt vời! Bạn vừa thanh toán thành công dư nợ thẻ.',
    'Đã thanh toán xong. Hạn mức của bạn vừa được giải phóng thêm.',
    'Làm tốt lắm! Dư nợ thẻ vừa được giảm bớt.',
  ],
  card_generic: [
    'Dùng thẻ tín dụng khôn ngoan, chi tiêu luôn trong tầm kiểm soát.',
    'Nhớ thanh toán đúng hạn để tránh lãi phát sinh nhé.',
    'Theo dõi sát sao chi tiêu thẻ giúp bạn chủ động hơn.',
    'Mỗi lần quẹt thẻ là một khoản cần nhớ để thanh toán sau này.',
  ],
  loan_near_complete: [
    'Bạn sắp hoàn thành khoản vay này.',
    'Chỉ còn vài kỳ nữa là xong khoản vay rồi!',
    'Sắp về đích với khoản vay này, cố lên nhé.',
    'Gần hoàn thành rồi, đừng bỏ cuộc giữa chừng nhé.',
  ],
  loan_overdue: [
    'Có khoản vay đã quá hạn thanh toán rồi đó.',
    'Một khoản vay đang quá hạn — mình xử lý sớm nhé.',
    'Đừng để quá hạn lâu, hãy kiểm tra khoản vay ngay nhé.',
  ],
  installment_upcoming_total: [
    'Tháng sau bạn có vài khoản trả góp cần thanh toán, chuẩn bị trước nhé.',
    'Nhắc nhẹ: tháng sau có nhiều khoản trả góp đến hạn.',
    'Sắp tới có kha khá khoản trả góp, cân đối ngân sách nhé.',
  ],
  stats_general: [
    'Nhìn lại số liệu để hiểu rõ hơn thói quen chi tiêu của mình.',
    'Biểu đồ này giúp bạn thấy rõ tiền đang đi đâu.',
    'Chi tiêu hợp lý là một khoản đầu tư cho tương lai.',
    'Mỗi khoản tiết kiệm hôm nay đều có giá trị về sau.',
    'Thử so sánh tháng này với tháng trước xem sao.',
    'Hiểu số liệu là bước đầu để chi tiêu thông minh hơn.',
    'Con số không biết nói dối — cùng xem chúng nói gì nhé.',
  ],
  settings_tip: [
    'Sao lưu dữ liệu định kỳ để luôn an tâm nhé.',
    'Một chút chỉnh sửa ở đây giúp sổ hợp với bạn hơn.',
    'Danh mục gọn gàng giúp báo cáo rõ ràng hơn đấy.',
    'Chế độ tối giúp mắt bạn thoải mái hơn vào buổi tối.',
    'Cứ tùy chỉnh sao cho thoải mái nhất khi dùng nhé.',
    'Thỉnh thoảng ghé qua đây dọn dẹp danh mục cũng hay đó.',
  ],
  onboarding_empty: [
    'Bắt đầu hành trình quản lý tài chính của bạn.',
    'Mọi hành trình lớn đều bắt đầu từ một dòng ghi chép nhỏ.',
    'Sổ đang trống, cùng viết những trang đầu tiên nhé.',
    'Chỉ một khoản thu hoặc chi thôi, để bắt đầu nhé.',
  ],
  idle: [
    'Chúc bạn một ngày hiệu quả.',
    'Hôm nay bạn đã cập nhật giao dịch chưa?',
    'Quản lý tiền bạc tốt bắt đầu từ những thói quen nhỏ.',
    'Ghi chép đều đặn — bí quyết đơn giản mà hiệu quả.',
    'Bạn đang làm rất tốt trên hành trình này.',
    'Một bước nhỏ mỗi ngày, một tương lai tài chính vững vàng.',
    'Kiên trì ghi chép, thành quả sẽ đến.',
    'Mình luôn ở đây, đồng hành cùng bạn.',
    'Chi tiêu tỉnh táo, tiết kiệm an tâm.',
    'Cảm ơn bạn đã chăm chút cho sổ thu chi của mình.',
  ],
} as const

export type MascotContext = keyof typeof MASCOT_MESSAGES

export function pickMascotMessage(context: MascotContext): string {
  const pool = MASCOT_MESSAGES[context]
  return pool[Math.floor(Math.random() * pool.length)]
}
