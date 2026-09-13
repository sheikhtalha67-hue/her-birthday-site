import { Fraunces, Nunito, Caveat } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-body",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-hand",
});

export const metadata = {
  title: "Happy Birthday, Sweety",
  description: "A little something made just for you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${nunito.variable} ${caveat.variable}`}>
        {children}
      </body>
    </html>
  );
}
