/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        screens: {
            xs: "375px",
            sm: "600px",
            md: "768px",
            lg: "1024px",
            xl: "1280px",
            "2xl": "1440px",
            "3xl": "1920px",
        },
        fontFamily: {
            ubuntu: ["var(--font-ubuntu)", "system-ui"],
            quicksand: ["var(--font-quicksand)", "system-ui"],
        },

        extend: {
            fontSize: {
                10: "10px",
                11: "11px",
                13: "13px",
                14: "14px",
                15: "15px",
                16: "16px",
                18: "18px",
                20: "20px",
                21: "21px",
                22: "22px",
                23: "23px",
                24: "24px",
                28: "28px",
                29: "29px",
                30: "30px",
                35: "35px",
                37: "37px",
                44: "44px",
                46: "46px",
                48: "48px",
                54: "54px",
                58: "58px",
                62: "62px",
                66: "66px",
                70: "70px",
                79: "79px",
                90: "90px",
                100: "100px",
            },
            colors: {
                matteBlack: "#171717",

                creme: "#fefae0",

                green: {
                    primary: "#606c38",
                },
            },
            animation: {
                text: "text 4s ease infinite",
                "overlay-show": "overlay-show 350ms cubic-bezier(.4, 0, .6 ,1)",
                "content-show": "content-show 350ms cubic-bezier(.4, 0, .6 ,1)",
            },
            keyframes: {
                text: {
                    "0%, 100%": {
                        "background-size": "200% 200%",
                        "background-position": "left center",
                    },
                    "50%": {
                        "background-size": "200% 200%",
                        "background-position": "right center",
                    },
                },
                "overlay-show": {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                "content-show": {
                    from: { opacity: "0", transform: "translateY(-5%)" },
                    to: { opacity: "1", transform: "translateY(0%)" },
                },
                "slide-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-collapsible-content-height)" },
                },
                "slide-up": {
                    from: { height: "var(--radix-collapsible-content-height)" },
                    to: { height: "0" },
                },
            },
        },
    },
    plugins: [],
};
