import type { Metadata } from "next";
import "./globals.css";
import { Baloo_2 } from "next/font/google";

const baloo = Baloo_2({
  subsets: ["latin"],          // để an toàn khi build; nếu thiếu dấu tiếng Việt, mình sẽ đổi font sau
  weight: ["400", "600", "700"], // 400 cho body, 600/700 cho heading
  variable: "--font-all",        // biến CSS dùng cho toàn site
});

export const metadata: Metadata = {
  title: "Bio",
  description: "Bio link",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={baloo.variable}>{children}</body>
    </html>
  );
}
