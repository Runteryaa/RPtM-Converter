import React from 'react';
import './globals.css';

export const viewport = {
  themeColor: '#4f46e5',
};

export const metadata = {
  title: 'RPtM Converter | Resource Pack to Mod',
  description: 'Free and instant online tool to convert Minecraft resource packs into Fabric mods in your browser. Supports multiple packs and custom icons.',
  keywords: ['minecraft', 'resource pack converter', 'resource pack to mod', 'fabric mod', 'zip to jar', 'mcpack', 'modding tool', 'RPtM'],
  authors: [{ name: 'Runterya', url: 'https://github.com/Runteryaa' }],
  openGraph: {
    title: 'RPtM Converter | Resource Pack to Mod',
    description: 'Turn any Minecraft Resource Pack into a Mod instantly.',
    url: 'https://rptm.pages.dev',
    siteName: 'RPtM Converter',
    images: [
      {
        url: 'https://rptm.pages.dev/rptm.png',
        width: 9,
        height: 9,
        alt: 'RPtM Converter Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  // Google için yapılandırılmış veri (Sitenin bir web uygulaması olduğunu belirtir)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "RPtM Converter",
    "url": "https://rptm.pages.dev",
    "description": "Convert Minecraft resource packs to mods in your browser.",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "sameAs": [
      "https://github.com/Runteryaa/RPtM",
      "https://modrinth.com/mod/rptmlib/"
    ],
    "softwareRequirements": "https://modrinth.com/mod/rptmlib/"
  };

  return (
    <html lang="en">
      <meta name="google-site-verification" content="bAOoNhpOSqDWF7-4xJ2zJsPtXz6BHK7kEh9_XjLjQ24" />
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
