
import { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "광명시 희망 고등학교",
  description: "개발 장서우",
  icons: {
    icon: "/image/logo2.webp",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
