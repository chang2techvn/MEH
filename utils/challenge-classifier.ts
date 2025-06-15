// Hàm phân loại độ khó dựa trên nội dung video
export function classifyChallengeDifficulty(
  title: string,
  description: string,
  duration: number,
): "beginner" | "intermediate" | "advanced" {
  // Chuyển đổi text thành chữ thường để dễ so sánh
  const text = (title + " " + description).toLowerCase()

  // Các từ khóa cho mỗi cấp độ
  const beginnerKeywords = [
    "basic",
    "beginner",
    "elementary",
    "introduction",
    "simple",
    "easy",
    "start",
    "first",
    "101",
    "fundamental",
    "learn",
    "tutorial",
  ]

  const advancedKeywords = [
    "advanced",
    "expert",
    "complex",
    "difficult",
    "professional",
    "master",
    "specialized",
    "in-depth",
    "comprehensive",
    "detailed",
    "technical",
  ]

  // Đếm số từ khóa khớp với mỗi cấp độ
  let beginnerScore = 0
  let advancedScore = 0

  // Kiểm tra từ khóa beginner
  beginnerKeywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      beginnerScore++
    }
  })

  // Kiểm tra từ khóa advanced
  advancedKeywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      advancedScore++
    }
  })

  // Xét thêm độ dài video
  if (duration < 180) {
    // Dưới 3 phút
    beginnerScore++
  } else if (duration > 360) {
    // Trên 6 phút
    advancedScore++
  }

  // Quyết định cấp độ dựa trên điểm số
  if (beginnerScore > advancedScore) {
    return "beginner"
  } else if (advancedScore > beginnerScore) {
    return "advanced"
  } else {
    return "intermediate" // Mặc định là intermediate
  }
}

// Hàm lấy màu badge dựa trên độ khó
export function getDifficultyBadgeColor(difficulty: string): string {
  switch (difficulty) {
    case "beginner":
      return "bg-green-600"
    case "intermediate":
      return "bg-primary"
    case "advanced":
      return "bg-amber-600"
    default:
      return "bg-primary"
  }
}

// Hàm lấy tên hiển thị của độ khó
export function getDifficultyDisplayName(difficulty: string): string {
  switch (difficulty) {
    case "beginner":
      return "Beginner"
    case "intermediate":
      return "Intermediate"
    case "advanced":
      return "Advanced"
    default:
      return "Intermediate"
  }
}
