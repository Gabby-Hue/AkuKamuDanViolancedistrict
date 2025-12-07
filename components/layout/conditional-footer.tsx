"use client";

import { usePathname } from "next/navigation";
import Footer from "./footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Hide footer on dashboard and its sub-routes
  const hideFooterRoutes = ["/dashboard", "/dashboard/", "/auth/", "/auth"];

  const shouldHideFooter = hideFooterRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (shouldHideFooter) {
    return null;
  }

  return <Footer />;
}
