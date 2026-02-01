# Design System: Alizé Landing Page
**Project ID:** projects/alize-v1-001

## 1. Visual Theme & Atmosphere
The design evokes a "Premium Tech-Noir" atmosphere. It is dark, sleek, and mysterious, dominated by deep blacks and vibrant, glowing gradients. The aesthetic is "Glassmorphism" — heavy usage of translucent layers with background blurs (backdrop-filter) to create depth and hierarchy. It feels futuristic, intelligent, and private.

## 2. Color Palette & Roles
*   **Abyssal Black (#0a0a0a)**: Used for the main background. Deep and infinite.
*   **Pure White (#ffffff)**: Used for primary text and high-contrast elements.
*   **Electric Indigo (#4f46e5)**: Primary accent color. Used for gradients, buttons, and "blob" effects. Energy and intelligence.
*   **Neon Pink (#ec4899)**: Secondary accent color. Used for gradients and highlights. Creativity and warmth.
*   **Translucent White (#ffffff0d - 5% opacity)**: Used for "Glass" card backgrounds.
*   **Glass Border (#ffffff1a - 10% opacity)**: Used for subtle borders on glass elements.

## 3. Typography Rules
*   **Font Family**: 'Outfit', sans-serif. A modern, geometric typeface.
*   **Headings**: Bold (700) or Semi-Bold (600). Large scale (4rem for H1). Tight letter-spacing.
*   **Body**: Regular (400) or Light (300). Readable, with generous line-height (1.6).

## 4. Component Stylings
*   **Buttons (Primary)**: "Pill-shaped" (rounded-full). Background is a linear gradient (45deg) of Electric Indigo to Neon Pink. Soft shadow glow on hover.
*   **Buttons (Secondary/Nav)**: "Pill-shaped". Glass background (10% white). Thin glass border.
*   **Glass Cards**: "Generously rounded corners" (20px). Background is 5% opacity white with `backdrop-filter: blur(10px)`. 1px solid border at 10% opacity.
*   **Blobs**: Large, amorphous colored shapes (Indigo, Pink, Purple) placed behind the glass layers to create diffused ambient light.

## 5. Layout Principles
*   **Whitespace**: Generous and airy. Sections are separated by large vertical gaps (100px+).
*   **Grid**: Responsive grid for features (auto-fit minmax 250px).
*   **Alignment**: Centralized text for headers/footers. Left-aligned content for feature cards.
*   **Z-Index**: Crucial hierarchy — Background Blobs < Content < Glass Layers < Sticky Navigation.
