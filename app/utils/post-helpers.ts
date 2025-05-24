"use client"

// Hàm trợ giúp để chuyển đổi dữ liệu bài đăng từ localStorage thành định dạng phù hợp cho FeedPost
export function formatNewPost(postData: any) {
  return {
    username: postData.username || "Anonymous",
    userImage: postData.userImage || "/placeholder.svg?height=40&width=40",
    timeAgo: "Just now",
    content: postData.title || "New post",
    mediaType: "ai-submission",
    likes: 0,
    comments: 0,
    isNew: true,
    submission: {
      id: postData.id,
      userId: "user-1",
      username: postData.username || "Anonymous",
      userImage: postData.userImage || "/placeholder.svg?height=40&width=40",
      originalVideoId: "sample-video-1",
      rewrittenContent: postData.content || "",
      videoSubmission: postData.videoUrl || "",
      contentEvaluation: {
        score: 85,
        feedback:
          "Your rewritten content demonstrates a good understanding of the key points from the video. You've used appropriate vocabulary and maintained good grammar throughout.",
        strengths: [
          "Clear organization of ideas",
          "Good use of technical vocabulary",
          "Accurate representation of the video content",
        ],
        weaknesses: ["Could include more specific examples", "Some sentences could be more concise"],
        grammarScore: 90,
        contentScore: 85,
        originalityScore: 80,
      },
      videoEvaluation: {
        score: 82,
        feedback:
          "Your video presentation shows confidence and good pronunciation. The pacing is appropriate and you maintain good eye contact.",
        strengths: ["Clear pronunciation", "Good pacing", "Confident delivery"],
        weaknesses: ["Occasional hesitation", "Could improve intonation for emphasis"],
        grammarScore: 85,
        contentScore: 80,
        originalityScore: 82,
      },
      overallScore: 84,
      createdAt: new Date(),
      status: "published",
    },
  }
}
