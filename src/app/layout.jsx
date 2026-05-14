import React from 'react';
import './globals.css';

export const metadata = {
  title: 'RPtM Converter',
  description: 'Convert your resource packs to mods',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
