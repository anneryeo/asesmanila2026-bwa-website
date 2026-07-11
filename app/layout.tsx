import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { siteConfig, siteUrl } from "@/lib/site";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const cocogoose = localFont({
  src: [
    {
      path: "../public/fonts/Cocogoose-Pro-Thin-trial.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/fonts/Cocogoose-Pro-Thin-Italic-trial.ttf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../public/fonts/Cocogoose-Pro-Ultralight-trial.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/Cocogoose-Pro-Ultralight-Italic-trial.ttf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../public/fonts/Cocogoose-Pro-Light-trial.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Cocogoose-Pro-Light-Italic-trial.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/fonts/Cocogoose-Pro-Semilight-trial.ttf",
      weight: "350",
      style: "normal",
    },
    {
      path: "../public/fonts/Cocogoose-Pro-Semilight-Italic-trial.ttf",
      weight: "350",
      style: "italic",
    },
    {
      path: "../public/fonts/Cocogoose-Pro-Regular-trial.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Cocogoose-Pro-Italic-trial.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/Cocogoose-Pro-Bold-trial.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Cocogoose-Pro-Bold-Italic-trial.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../public/fonts/Cocogoose-Pro-Darkmode-trial.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/fonts/Cocogoose-Pro-Darkmode-Italic-trial.ttf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-cocogoose",
  display: "swap",
  fallback: ["Mona Sans", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  category: "education",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "PH",
    "geo.placename": "Manila, Philippines",
    "geo.position": "14.5995;120.9842",
    ICBM: "14.5995, 120.9842",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    // Cross-browser icon set — Safari, Chrome, Firefox, Brave, Edge all read
    // from this list and pick what they support.
    icon: [
      { url: "/images/ases-logoplain-white.svg", type: "image/svg+xml" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icon-32.png",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export const viewport: Viewport = {
  // White-primary surface: light UI chrome, white theme color.
  themeColor: "#FFFFFF",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "EducationalOrganization"],
  "@id": `${siteUrl}/#organization`,
  name: siteConfig.name,
  alternateName: [siteConfig.shortName, "ASES Manila", "ASES Philippines"],
  url: siteConfig.parentSiteUrl,
  description: siteConfig.description,
  email: siteConfig.email,
  logo: {
    "@type": "ImageObject",
    url: `${siteUrl}/images/ases-logoplain-white.svg`,
    contentUrl: `${siteUrl}/images/ases-logoplain-white.svg`,
  },
  areaServed: "Manila, Philippines",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Manila",
    addressCountry: "PH",
  },
  parentOrganization: {
    "@type": "Organization",
    name: "ASES — Association for the Advancement of Student Entrepreneurship and Startups",
    url: "https://www.ases.stanford.edu",
    sameAs: "https://www.ases.stanford.edu",
  },
  knowsAbout: [
    "student entrepreneurship",
    "startup communities",
    "founders",
    "product development",
    "venture creation",
  ],
  sameAs: siteConfig.sameAs,
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: `Build with ASES — ${siteConfig.name}`,
  url: siteUrl,
  description: siteConfig.description,
  about: {
    "@id": `${siteUrl}/#organization`,
  },
  inLanguage: "en-PH",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cocogoose.variable} ${montserrat.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema, websiteSchema]),
          }}
        />
      </head>
      <body className="relative min-h-screen overflow-x-hidden bg-white text-navy-900 antialiased">
        <main className="relative z-10 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
