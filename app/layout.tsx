import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediDesk",
  description:
    "MediDesk medical web application with role-based access for admins, doctors, and patients."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
