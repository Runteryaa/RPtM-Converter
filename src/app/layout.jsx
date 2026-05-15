import React from 'react';
import './globals.css';

export const viewport = {
  themeColor: '#4f46e5',
};

export const metadata = {
  metadataBase: new URL('https://rptm.pages.dev'),
  title: 'RPtM Converter | Resource Pack to Mod Converter',
  description: 'Free and open source Resource Pack to Mod Converter tool to convert Minecraft resource packs into mods in your browser. MPtMLib required.',
  keywords: ['minecraft', 'RPtM Converter', 'resource pack converter', 'resource pack to mod', 'fabric mod', 'modding tools', 'RPtM'],
  authors: [{ name: 'Runterya', url: 'https://github.com/Runteryaa' }],
  icons: {
    icon: '/rptm.png',
  },
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'bAOoNhpOSqDWF7-4xJ2zJsPtXz6BHK7kEh9_XjLjQ24',
  },
  openGraph: {
    title: 'RPtM Converter | Resource Pack to Mod',
    description: 'Convert any Minecraft Resource Pack to Mod instantly. RPtM',
    url: 'https://rptm.pages.dev',
    siteName: 'RPtM Converter',
    images: [
      {
        url: 'https://rptm.pages.dev/rptm.png',
        width: 9,
        height: 9,
        alt: 'RPtM Converter',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "RPtM Converter",
        "url": "https://rptm.pages.dev",
        "description": "Convert Minecraft resource packs to mods in your browser. RPtM",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "All",
        "sameAs": [
          "https://github.com/Runteryaa/RPtM",
          "https://modrinth.com/mod/rptmlib/"
        ],
        "softwareRequirements": "https://modrinth.com/mod/rptmlib/",
        "author": {
          "@id": "https://rptm.pages.dev/#identity"
        }
      },
      {
        "@type": "Person",
        "@id": "https://rptm.pages.dev/#identity",
        "name": "Runterya",
        "url": "https://github.com/Runteryaa",
        "sameAs": [
          "https://github.com/Runteryaa"
        ]
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
