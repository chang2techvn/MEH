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
      return "!bg-emerald-500 !text-white border-emerald-500 hover:!bg-emerald-600" // Xanh lá sáng - dễ/mới bắt đầu
    case "intermediate":
      return "!bg-amber-500 !text-white border-amber-500 hover:!bg-amber-600" // Vàng cam - trung bình
    case "advanced":
      return "!bg-rose-500 !text-white border-rose-500 hover:!bg-rose-600" // Đỏ hồng - khó/nâng cao
    default:
      return "!bg-slate-500 !text-white border-slate-500 hover:!bg-slate-600"
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

// Hàm lấy variant badge cho các component UI khác nhau
export function getDifficultyBadgeVariant(difficulty: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (difficulty) {
    case "beginner":
      return "secondary" // Màu xanh lá nhẹ
    case "intermediate":  
      return "default" // Màu vàng
    case "advanced":
      return "destructive" // Màu đỏ
    default:
      return "outline" // Mặc định
  }
}

// Hàm lấy màu Tailwind CSS cho gradient
export function getDifficultyGradientColor(difficulty: string): string {
  switch (difficulty) {
    case "beginner":
      return "from-emerald-400 to-emerald-600" // Gradient xanh lá
    case "intermediate":
      return "from-amber-400 to-amber-600" // Gradient vàng cam
    case "advanced":
      return "from-rose-400 to-rose-600" // Gradient đỏ hồng
    default:
      return "from-slate-400 to-slate-600" // Gradient xám
  }
}

// Hàm lấy style inline cho badge (để đảm bảo màu hiển thị đúng)
export function getDifficultyBadgeStyle(difficulty: string): React.CSSProperties {
  switch (difficulty) {
    case "beginner":
      return {
        backgroundColor: '#10b981', // emerald-500
        color: '#ffffff',
        borderColor: '#10b981'
      }
    case "intermediate":
      return {
        backgroundColor: '#f59e0b', // amber-500
        color: '#ffffff',
        borderColor: '#f59e0b'
      }
    case "advanced":
      return {
        backgroundColor: '#ef4444', // rose-500
        color: '#ffffff',
        borderColor: '#ef4444'
      }
    default:
      return {
        backgroundColor: '#6b7280', // slate-500
        color: '#ffffff',
        borderColor: '#6b7280'
      }
  }
}
