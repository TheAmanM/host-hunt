import type { HostingProvider, CombinedDNSData } from "../types";

import vercelIcon from "/icon/vercel.svg";
import netlifyIcon from "/icon/netlify.svg";
import cloudflareIcon from "/icon/cloudflare.svg";
import githubIcon from "/icon/github.svg";
import herokuIcon from "/icon/heroku.svg";
import cloudfrontIcon from "/icon/cloudfront.svg";
import googleCloudIcon from "/icon/google-cloud.svg";
import shopifyIcon from "/icon/shopify.svg";
import wordpressIcon from "/icon/wordpress.svg";
import squarespaceIcon from "/icon/squarespace.svg";
import wixIcon from "/icon/wix.svg";

export const HOSTING_SIGNATURES: HostingProvider[] = [
  {
    id: "vercel",
    name: "Vercel",
    color: "bg-black",
    icon: vercelIcon,
    patterns: ["vercel.app", "vercel-dns.com", "76.76.21.21"],
  },
  {
    id: "netlify",
    name: "Netlify",
    color: "bg-teal-600",
    icon: netlifyIcon,
    patterns: ["netlify.app", "netlify.com", "netlify.global"],
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    color: "bg-orange-500",
    icon: cloudflareIcon,
    patterns: [
      "cloudflare.com",
      "cloudflare.net",
      "pages.dev",
      "gold.foundationdns.net",
      "gold.foundationdns.com",
      "gold.foundationdns.org",
      "23.227.38.33",
    ],
  },
  {
    id: "github",
    name: "GitHub Pages",
    color: "bg-gray-700",
    icon: githubIcon,
    patterns: ["github.io", "githubusercontent.com", "185.199.108.153"],
  },
  {
    id: "heroku",
    name: "Heroku",
    color: "bg-purple-600",
    icon: herokuIcon,
    patterns: [
      "herokuapp.com",
      "herokudns.com",
      "heroku.go-vip.net",
      "192.0.66.110",
    ],
  },
  {
    id: "aws",
    name: "AWS (CloudFront / S3)",
    color: "bg-yellow-600",
    icon: cloudfrontIcon,
    patterns: ["amazonaws.com", "cloudfront.net", "awsdns"],
  },
  {
    id: "google",
    name: "Google Cloud / Firebase",
    color: "bg-blue-600",
    icon: googleCloudIcon,
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
    icon: shopifyIcon,
    patterns: ["myshopify.com", "shops.myshopify.com"],
  },
  {
    id: "wordpress",
    name: "WordPress.com",
    color: "bg-[#32373C]",
    icon: wordpressIcon,
    patterns: ["wordpress.com", "wp.com"],
  },
  {
    id: "squarespace",
    name: "Squarespace",
    color: "bg-stone-800",
    icon: squarespaceIcon,
    patterns: ["squarespace.com", "squarespacedns.com"],
  },
  {
    id: "wix",
    name: "Wix",
    color: "bg-[#f1f5f9] text-black",
    icon: wixIcon,
    patterns: ["wixdns.net", "wix.com"],
  },
];

export const detectProvider = (
  dnsRecords: CombinedDNSData,
): HostingProvider | null => {
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
