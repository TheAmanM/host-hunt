import type { HostingProvider, CombinedDNSData } from "../types";

export const HOSTING_SIGNATURES: HostingProvider[] = [
  {
    id: "vercel",
    name: "Vercel",
    color: "bg-black",
    icon: "▲",
    patterns: ["vercel.app", "vercel-dns.com", "76.76.21.21"],
  },
  {
    id: "netlify",
    name: "Netlify",
    color: "bg-teal-600",
    icon: "💠",
    patterns: ["netlify.app", "netlify.com", "netlify.global"],
  },
  {
    id: "cloudflare",
    name: "Cloudflare Pages / CDN",
    color: "bg-orange-500",
    icon: "☁️",
    patterns: ["cloudflare.com", "cloudflare.net", "pages.dev"],
  },
  {
    id: "github",
    name: "GitHub Pages",
    color: "bg-gray-700",
    icon: "🐙",
    patterns: ["github.io", "githubusercontent.com", "185.199.108.153"],
  },
  {
    id: "heroku",
    name: "Heroku",
    color: "bg-purple-600",
    icon: "🏩",
    patterns: ["herokuapp.com", "herokudns.com"],
  },
  {
    id: "aws",
    name: "AWS (S3/CloudFront)",
    color: "bg-yellow-600",
    icon: "📦",
    patterns: ["amazonaws.com", "cloudfront.net", "awsdns"],
  },
  {
    id: "google",
    name: "Google Cloud / Firebase",
    color: "bg-blue-600",
    icon: "🔥",
    patterns: [
      "firebaseapp.com",
      "googlehosted.com",
      "googledomains.com",
      "199.36.158.100",
    ],
  },
  {
    id: "shopify",
    name: "Shopify",
    color: "bg-green-600",
    icon: "🛍️",
    patterns: ["myshopify.com", "shops.myshopify.com"],
  },
  {
    id: "wordpress",
    name: "WordPress.com",
    color: "bg-blue-800",
    icon: "📝",
    patterns: ["wordpress.com", "wp.com"],
  },
  {
    id: "squarespace",
    name: "Squarespace",
    color: "bg-stone-800",
    icon: "⬛",
    patterns: ["squarespace.com", "squarespacedns.com"],
  },
  {
    id: "wix",
    name: "Wix",
    color: "bg-yellow-400 text-black",
    icon: "⭐",
    patterns: ["wixdns.net", "wix.com"],
  },
];

export const detectProvider = (
  dnsRecords: CombinedDNSData,
): HostingProvider | null => {
  // Convert the complex object to a single string for easy substring matching
  const flattenedData = JSON.stringify(dnsRecords).toLowerCase();

  for (const provider of HOSTING_SIGNATURES) {
    for (const pattern of provider.patterns) {
      if (flattenedData.includes(pattern)) {
        return provider;
      }
    }
  }
  return null;
};
