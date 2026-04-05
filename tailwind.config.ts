import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(210 40% 98%)",
        foreground: "hsl(222 47% 11%)",
        card: "hsl(0 0% 100%)",
        "card-foreground": "hsl(222 47% 11%)",
        popover: "hsl(0 0% 100%)",
        "popover-foreground": "hsl(222 47% 11%)",
        primary: "hsl(215 100% 34%)", /* Cobalt */
        "primary-foreground": "hsl(210 40% 98%)",
        secondary: "hsl(150 61% 45%)", /* Emerald */
        "secondary-foreground": "hsl(210 40% 98%)",
        muted: "hsl(210 40% 96.1%)",
        "muted-foreground": "hsl(215.4 16.3% 46.9%)",
        accent: "hsl(48 96% 53%)",
        "accent-foreground": "hsl(222.2 47.4% 11.2%)",
        destructive: "hsl(0 84.2% 60.2%)",
        "destructive-foreground": "hsl(210 40% 98%)",
        border: "hsl(214.3 31.8% 91.4%)",
        input: "hsl(214.3 31.8% 91.4%)",
        ring: "hsl(215 100% 34%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
