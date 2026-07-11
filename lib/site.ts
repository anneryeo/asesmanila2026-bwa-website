// Canonical domain for this standalone site. Change it here (or via
// NEXT_PUBLIC_SITE_URL) and every metadata/JSON-LD reference follows.
export const siteConfig = {
  name: "ASES Manila",
  shortName: "ASES",
  domain: "buildwithases.asesmanila.com",
  url: "https://buildwithases.asesmanila.com/",
  title: "Build with ASES — Show Us What You Are Building",
  description:
    "Build with ASES is a builder session by ASES Manila where students show the projects they are actually building and get honest feedback in a room of founders, operators, and the companies who hire. Apply to present or join as a watcher.",
  keywords: [
    "Build with ASES",
    "Build with ASES Manila",
    "student builder session Manila",
    "pitch your project Manila",
    "startup feedback Philippines",
    "student demo night Manila",
    "show your build Manila",
    "founder feedback session",
    "ASES",
    "ASES Manila",
    "ASES Philippines",
    "ASES Stanford",
    "student entrepreneurship Manila",
    "startup community Manila",
    "student builders Manila",
    "student founders Philippines",
  ],
  email: "asesmanila.team@gmail.com",
  location: "Manila, Philippines",
  parentSiteUrl: "https://www.asesmanila.com",
  sameAs: [
    "https://www.facebook.com/asesmnl",
    "https://www.instagram.com/asesmanila/",
    "https://www.linkedin.com/company/asesmanila/posts/?feedView=all",
  ],
} as const;

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  siteConfig.url.replace(/\/$/, "");
