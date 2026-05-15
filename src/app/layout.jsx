import React from 'react';
import './globals.css';

export const metadata = {
  title: 'RPtM Converter',
  description: 'Convert your resource packs to mods',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <meta name="google-site-verification" content="bAOoNhpOSqDWF7-4xJ2zJsPtXz6BHK7kEh9_XjLjQ24" />
      <body>{children}</body>
    </html>
  );
}
