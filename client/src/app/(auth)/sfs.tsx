export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` text-sm bg-black text-foreground antialiased`}
      >
        
      </body>
    </html>
  );
}
