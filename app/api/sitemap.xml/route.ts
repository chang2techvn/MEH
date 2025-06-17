import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  // Lấy ngày hiện tại cho lastmod
  const date = new Date().toISOString().split("T")[0]
  // Danh sách các trang tĩnh
  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/community", priority: "0.8", changefreq: "daily" },
    { url: "/resources", priority: "0.7", changefreq: "weekly" },
    { url: "/profile", priority: "0.5", changefreq: "monthly" },
  ]

  // Tạo XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>https://englishmastery.com${page.url}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
  `,
    )
    .join("")}
</urlset>`

  // Trả về sitemap dưới dạng XML
  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
    },
  })
}
