import React from 'react';
import './globals.css';

export const metadata = {
  title: 'RPtM Converter (Resource Pack to Mod)',
  description: 'Resource Pack to Mod Converter. Convert your packs to RPtM mods.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <meta name="google-site-verification" content="bAOoNhpOSqDWF7-4xJ2zJsPtXz6BHK7kEh9_XjLjQ24" />
      <body>{children}</body>
    </html>
  );
}
