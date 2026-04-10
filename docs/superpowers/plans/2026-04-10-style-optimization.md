# 项目样式优化 Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Refactor all styles to styled-components with comprehensive design system tokens, modern animations, and responsive design.

**Architecture:** Create a design token system (colors, spacing, typography, shadows), convert all styles to styled-components, build reusable styled components library, implement responsive utilities, and add modern animations.

**Tech Stack:** styled-components, TypeScript, React

---

## File Structure

**New files to create:**

- `src/styles/tokens.ts` - Design system tokens (colors, spacing, typography, shadows, breakpoints)
- `src/styles/GlobalStyles.tsx` - Global styled component for reset and base styles
- `src/styles/theme.ts` - Theme object exporting all tokens
- `src/components/styled/*.tsx` - Reusable styled components (Button, Card, Container, etc.)

**Files to modify:**

- `src/module/Card.tsx` - Replace CSS module with styled-components
- `src/module/Wrapper.tsx` - Replace CSS module with styled-components
- `src/module/Container.tsx` - Replace CSS module with styled-components
- `src/module/index.module.scss` - Will be deprecated
- `src/App.tsx` - Add GlobalStyles provider
- `src/App.css` - Will be removed

---

## Task 1: Install styled-components and dependencies

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install styled-components and babel plugin**

```bash
cd /Users/wangyuan198/Documents/study/nested-draggable-card
npm install styled-components @types/styled-components babel-plugin-styled-components
```

Expected: Installation completes successfully

- [ ] **Step 2: Verify installation**

```bash
npm list styled-components @types/styled-components
```

Expected: Both packages listed in node_modules

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add styled-components dependencies"
```

---

## Task 2: Create design system tokens

**Files:**

- Create: `src/styles/tokens.ts`

- [ ] **Step 1: Create tokens file with color palette**

```typescript
// src/styles/tokens.ts

// Color Palette - Modern/Friendly Blue Theme
export const colors = {
  // Primary Colors
  primary: "#1677ff",
  primaryLight: "#40a9ff",
  primaryDark: "#0050b3",

  // Secondary Colors
  secondary: "#52c41a",
  secondaryLight: "#85ce61",
  secondaryDark: "#389e0d",

  // Status Colors
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  info: "#1677ff",

  // Neutral Colors
  white: "#ffffff",
  black: "#000000",
  gray100: "#fafafa",
  gray200: "#f5f5f5",
  gray300: "#f0f0f0",
  gray400: "#d9d9d9",
  gray500: "#bfbfbf",
  gray600: "#8c8c8c",
  gray700: "#595959",
  gray800: "#262626",
  gray900: "#141414",

  // Text Colors
  text: {
    primary: "#262626",
    secondary: "#8c8c8c",
    tertiary: "#bfbfbf",
    inverse: "#ffffff",
  },

  // Background Colors
  bg: {
    primary: "#ffffff",
    secondary: "#fafafa",
    tertiary: "#f5f5f5",
    overlay: "rgba(0, 0, 0, 0.45)",
  },

  // Interactive Colors
  hover: "#e6f7ff",
  active: "#bae0ff",
  disabled: "#f5f5f5",

  // Drag & Drop Feedback
  dragFeedback: "#1677ff",
  dragFeedbackBg: "rgba(22, 119, 255, 0.08)",
  dragFeedbackBorder: "#1677ff",
};

// Spacing Scale (8px base)
export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  xxl: "32px",
  xxxl: "48px",
};

// Typography
export const typography = {
  // Font Families
  fontFamily: {
    base: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    mono: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },

  // Font Sizes
  fontSize: {
    xs: "12px",
    sm: "13px",
    base: "14px",
    md: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "32px",
  },

  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Border Radius
export const borderRadius = {
  none: "0",
  sm: "2px",
  md: "4px",
  lg: "8px",
  xl: "12px",
  full: "9999px",
};

// Shadows
export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
  dragOver:
    "0 0 0 2px rgba(22, 119, 255, 0.2), inset 0 0 0 1px rgba(22, 119, 255, 0.2)",
};

// Transitions
export const transitions = {
  fast: "0.15s ease-in-out",
  base: "0.3s ease-in-out",
  slow: "0.5s ease-in-out",

  // Common properties
  color: "color 0.3s ease-in-out",
  background: "background-color 0.3s ease-in-out",
  border: "border-color 0.3s ease-in-out",
  all: "all 0.3s ease-in-out",
};

// Breakpoints
export const breakpoints = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// Z-Index Scale
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  notification: 800,
  drag: 1000,
};

// Export all tokens as a single theme object
export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
};

export default theme;
```

- [ ] **Step 2: Verify tokens file compiles**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/styles/tokens.ts
git commit -m "feat: add comprehensive design system tokens"
```

---

## Task 3: Create global styles component

**Files:**

- Create: `src/styles/GlobalStyles.tsx`

- [ ] **Step 1: Create GlobalStyles component**

```typescript
// src/styles/GlobalStyles.tsx
import { createGlobalStyle } from "styled-components";
import { theme } from "./tokens";

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    font-family: ${theme.typography.fontFamily.base};
    font-size: ${theme.typography.fontSize.base};
    line-height: ${theme.typography.lineHeight.normal};
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.bg.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  code {
    font-family: ${theme.typography.fontFamily.mono};
  }

  input, button, select, textarea {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.bg.tertiary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.gray400};
    border-radius: ${theme.borderRadius.sm};

    &:hover {
      background: ${theme.colors.gray500};
    }
  }
`;

export default GlobalStyles;
```

- [ ] **Step 2: Verify component compiles**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/styles/GlobalStyles.tsx
git commit -m "feat: add global styles component with modern reset"
```

---

## Task 4: Create reusable styled components library

**Files:**

- Create: `src/components/styled/index.ts`
- Create: `src/components/styled/Box.tsx`
- Create: `src/components/styled/Button.tsx`
- Create: `src/components/styled/Card.tsx`
- Create: `src/components/styled/Text.tsx`
- Create: `src/components/styled/Flex.tsx`

- [ ] **Step 1: Create Box component (basic layout primitive)**

```typescript
// src/components/styled/Box.tsx
import styled from "styled-components";
import { theme } from "../../styles/tokens";

interface BoxProps {
  padding?: keyof typeof theme.spacing | string;
  margin?: keyof typeof theme.spacing | string;
  backgroundColor?: string;
  borderRadius?: keyof typeof theme.borderRadius | string;
  border?: string;
  boxShadow?: string;
  display?: string;
  position?: string;
  width?: string;
  height?: string;
  overflow?: string;
  cursor?: string;
  transition?: string;
}

export const Box = styled.div<BoxProps>`
  ${(props) =>
    props.padding &&
    `padding: ${
      theme.spacing[props.padding as keyof typeof theme.spacing] ||
      props.padding
    };`}
  ${(props) =>
    props.margin &&
    `margin: ${
      theme.spacing[props.margin as keyof typeof theme.spacing] || props.margin
    };`}
  ${(props) =>
    props.backgroundColor && `background-color: ${props.backgroundColor};`}
  ${(props) =>
    props.borderRadius &&
    `border-radius: ${
      theme.borderRadius[
        props.borderRadius as keyof typeof theme.borderRadius
      ] || props.borderRadius
    };`}
  ${(props) => props.border && `border: ${props.border};`}
  ${(props) => props.boxShadow && `box-shadow: ${props.boxShadow};`}
  ${(props) => props.display && `display: ${props.display};`}
  ${(props) => props.position && `position: ${props.position};`}
  ${(props) => props.width && `width: ${props.width};`}
  ${(props) => props.height && `height: ${props.height};`}
  ${(props) => props.overflow && `overflow: ${props.overflow};`}
  ${(props) => props.cursor && `cursor: ${props.cursor};`}
  ${(props) => props.transition && `transition: ${props.transition};`}
`;

export default Box;
```

- [ ] **Step 2: Create Flex component (flexbox layout)**

```typescript
// src/components/styled/Flex.tsx
import styled from "styled-components";

interface FlexProps {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  align?: string;
  justify?: string;
  gap?: string;
  wrap?: "wrap" | "nowrap";
  flex?: string;
}

export const Flex = styled.div<FlexProps>`
  display: flex;
  flex-direction: ${(props) => props.direction || "row"};
  align-items: ${(props) => props.align || "center"};
  justify-content: ${(props) => props.justify || "flex-start"};
  gap: ${(props) => props.gap || "0"};
  flex-wrap: ${(props) => props.wrap || "nowrap"};
  flex: ${(props) => props.flex || "none"};
`;

export default Flex;
```

- [ ] **Step 3: Create Text component (typography)**

```typescript
// src/components/styled/Text.tsx
import styled, { css } from "styled-components";
import { theme } from "../../styles/tokens";

interface TextProps {
  size?: keyof typeof theme.typography.fontSize;
  weight?: keyof typeof theme.typography.fontWeight;
  color?: string;
  lineHeight?: keyof typeof theme.typography.lineHeight;
  textAlign?: string;
  whiteSpace?: string;
  overflow?: string;
  textOverflow?: string;
  maxWidth?: string;
}

export const Text = styled.span<TextProps>`
  font-size: ${(props) => theme.typography.fontSize[props.size || "base"]};
  font-weight: ${(props) =>
    theme.typography.fontWeight[props.weight || "normal"]};
  line-height: ${(props) =>
    theme.typography.lineHeight[props.lineHeight || "normal"]};
  color: ${(props) => props.color || theme.colors.text.primary};
  text-align: ${(props) => props.textAlign || "inherit"};
  white-space: ${(props) => props.whiteSpace || "normal"};
  overflow: ${(props) => props.overflow || "visible"};
  text-overflow: ${(props) => props.textOverflow || "clip"};
  max-width: ${(props) => props.maxWidth || "none"};
`;

export default Text;
```

- [ ] **Step 4: Create Button component**

```typescript
// src/components/styled/Button.tsx
import styled from "styled-components";
import { theme } from "../../styles/tokens";

interface StyledButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const sizeStyles = {
  sm: `
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    font-size: ${theme.typography.fontSize.xs};
  `,
  md: `
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    font-size: ${theme.typography.fontSize.base};
  `,
  lg: `
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    font-size: ${theme.typography.fontSize.md};
  `,
};

const variantStyles = {
  primary: `
    background-color: ${theme.colors.primary};
    color: ${theme.colors.text.inverse};
    border: 1px solid ${theme.colors.primary};

    &:hover:not(:disabled) {
      background-color: ${theme.colors.primaryDark};
      border-color: ${theme.colors.primaryDark};
    }

    &:active:not(:disabled) {
      background-color: ${theme.colors.primaryDark};
    }
  `,
  secondary: `
    background-color: ${theme.colors.gray200};
    color: ${theme.colors.text.primary};
    border: 1px solid ${theme.colors.gray400};

    &:hover:not(:disabled) {
      background-color: ${theme.colors.gray300};
      border-color: ${theme.colors.gray500};
    }
  `,
  ghost: `
    background-color: transparent;
    color: ${theme.colors.primary};
    border: 1px solid ${theme.colors.primary};

    &:hover:not(:disabled) {
      background-color: ${theme.colors.hover};
    }
  `,
};

export const Button = styled.button<StyledButtonProps>`
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: ${theme.transitions.all};
  outline: none;

  ${(props) => sizeStyles[props.size || "md"]}
  ${(props) => variantStyles[props.variant || "primary"]}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }
`;

export default Button;
```

- [ ] **Step 5: Create Card component**

```typescript
// src/components/styled/Card.tsx
import styled from "styled-components";
import { theme } from "../../styles/tokens";

interface StyledCardProps {
  elevated?: boolean;
  interactive?: boolean;
}

export const Card = styled.div<StyledCardProps>`
  background-color: ${theme.colors.bg.primary};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.gray300};
  padding: ${theme.spacing.lg};
  box-shadow: ${(props) =>
    props.elevated ? theme.shadows.md : theme.shadows.sm};
  transition: ${theme.transitions.all};

  ${(props) =>
    props.interactive &&
    `
    cursor: pointer;
    
    &:hover {
      box-shadow: ${theme.shadows.lg};
      border-color: ${theme.colors.primary};
    }
  `}
`;

export default Card;
```

- [ ] **Step 6: Create index.ts to export all styled components**

```typescript
// src/components/styled/index.ts
export { Box } from "./Box";
export { Flex } from "./Flex";
export { Text } from "./Text";
export { Button } from "./Button";
export { Card } from "./Card";
```

- [ ] **Step 7: Verify all components compile**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors

- [ ] **Step 8: Commit**

```bash
git add src/components/styled/
git commit -m "feat: add reusable styled components library (Box, Flex, Text, Button, Card)"
```

---

## Task 5: Update App.tsx to include GlobalStyles

**Files:**

- Modify: `src/App.tsx`

- [ ] **Step 1: Read current App.tsx**

```bash
cat src/App.tsx
```

- [ ] **Step 2: Update App.tsx to include GlobalStyles**

Find the App component and add GlobalStyles at the top. Update the imports and add GlobalStyles component:

```typescript
// src/App.tsx
import React, { useState } from "react";
import GlobalStyles from "./styles/GlobalStyles";
import { Wrapper, Container } from "./module";
import type { CardData } from "./module/types";

function App() {
  const [cards, setCards] = useState<CardData[]>([]);

  return (
    <>
      <GlobalStyles />
      {/* Rest of your App component */}
    </>
  );
}

export default App;
```

- [ ] **Step 3: Verify App compiles**

```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add GlobalStyles to App component"
```

---

## Task 6: Convert Card.tsx to use styled-components

**Files:**

- Modify: `src/module/Card.tsx`

- [ ] **Step 1: Create styled components for Card**

Add at the top of `src/module/Card.tsx`:

```typescript
import styled from "styled-components";
import { theme } from "../styles/tokens";

const CardWrapper = styled.div`
  position: relative;
  margin-bottom: ${theme.spacing.md};
  cursor: move;

  &:hover {
    .dragIcon {
      color: ${theme.colors.primary};
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardHeaderTitle = styled.div`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
`;

const DragIcon = styled.span`
  margin-right: ${theme.spacing.md};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.base};
  cursor: move;
  transition: ${theme.transitions.color};

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const CardHeaderOpt = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const CardDescription = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.sm};
`;

const DragLine = styled.div`
  display: flex;
  width: 100%;
  height: 2px;
  margin: ${theme.spacing.sm} 0;
`;

const DragLineLeft = styled.div`
  width: 2px;
  height: 2px;
  border-top: 1px solid ${theme.colors.dragFeedback};
  border-right: 1px solid ${theme.colors.dragFeedback};
  transform: rotate(45deg);
  border-radius: ${theme.borderRadius.sm};
`;

const DragLineCenter = styled.div`
  width: 100%;
  background-color: ${theme.colors.dragFeedback};
  height: 1px;
  margin-top: 1px;
`;

const DragLineRight = styled.div`
  width: 2px;
  height: 2px;
  border-top: 1px solid ${theme.colors.dragFeedback};
  border-left: 1px solid ${theme.colors.dragFeedback};
  transform: rotate(-45deg);
  border-radius: ${theme.borderRadius.sm};
`;

const ShadowZone = styled.div<{ position: "top" | "bottom" }>`
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: ${theme.zIndex.drag};

  ${(props) =>
    props.position === "top"
      ? `
        top: 0;
        transform: translateY(-8px);
      `
      : `
        bottom: 0;
        transform: translateY(8px);
      `}
`;

const ShadowContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: ${theme.colors.dragFeedbackBg};
  border: 2px dashed ${theme.colors.dragFeedbackBorder};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: inset 0 0 0 1px rgba(22, 119, 255, 0.2);
`;
```

- [ ] **Step 2: Replace className references with styled components**

Replace all `className` references in the JSX with the new styled components. Update the return statement to use styled components instead of importing from `index.module.scss`.

- [ ] **Step 3: Remove SCSS import**

Remove the line: `import styles from './index.module.scss';`

- [ ] **Step 4: Verify Card.tsx compiles**

```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 5: Commit**

```bash
git add src/module/Card.tsx
git commit -m "feat: convert Card component to styled-components"
```

---

## Task 7: Convert Wrapper.tsx to use styled-components

**Files:**

- Modify: `src/module/Wrapper.tsx`

- [ ] **Step 1: Create styled components for Wrapper**

Add at the top of `src/module/Wrapper.tsx`:

```typescript
import styled from "styled-components";
import { theme } from "../styles/tokens";

const CombineAreaMain = styled.div`
  height: calc(100vh - 200px);
  overflow-x: hidden;
  overflow-y: auto;
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.bg.secondary};
`;

const Main = styled.div`
  display: flex;
`;

const LeftDiv = styled.div`
  width: 15px;
  flex-shrink: 0;
`;

const RightDiv = styled.div`
  flex: 1;
  margin-bottom: ${theme.spacing.md};
  position: relative;
`;
```

- [ ] **Step 2: Replace className references with styled components**

Replace all `className` references in the JSX with the new styled components.

- [ ] **Step 3: Remove SCSS import**

Remove the line importing the styles module.

- [ ] **Step 4: Verify Wrapper.tsx compiles**

```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 5: Commit**

```bash
git add src/module/Wrapper.tsx
git commit -m "feat: convert Wrapper component to styled-components"
```

---

## Task 8: Clean up unused files and styles

**Files:**

- Delete: `src/App.css`
- Delete: `src/module/index.module.scss`
- Modify: `src/App.tsx` (remove CSS import)
- Modify: `src/module/Card.tsx` (already done, verify no remaining imports)

- [ ] **Step 1: Remove App.css import from App.tsx**

Check `src/App.tsx` for: `import './App.css';` and remove it.

- [ ] **Step 2: Delete App.css**

```bash
rm src/App.css
```

- [ ] **Step 3: Verify index.css is only global CSS file**

The `src/index.css` should now only contain base styles. Verify it only has generic resets (it should be very minimal now since GlobalStyles handles everything).

- [ ] **Step 4: Delete SCSS module file**

```bash
rm src/module/index.module.scss
```

- [ ] **Step 5: Verify Container.tsx doesn't import old styles**

Check `src/module/Container.tsx` for any SCSS imports and remove them.

- [ ] **Step 6: Run build to verify everything compiles**

```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 7: Commit cleanup**

```bash
git add src/App.tsx src/module/Container.tsx
git rm src/App.css src/module/index.module.scss
git commit -m "feat: remove deprecated CSS and SCSS files"
```

---

## Task 9: Test the application and verify styles

**Files:**

- No modifications needed, this is verification

- [ ] **Step 1: Start development server**

```bash
npm start
```

Expected: Application starts without errors

- [ ] **Step 2: Visual verification checklist**

In the browser at `http://localhost:3000`, verify:

- [ ] Cards render with proper styling
- [ ] Drag and drop feedback lines show in blue (#1677ff)
- [ ] Hover effects work on cards and buttons
- [ ] Text is readable with proper font sizes
- [ ] Spacing and padding look consistent
- [ ] Colors match the design system
- [ ] Shadows are visible on cards
- [ ] Scrollbar styling is applied

- [ ] **Step 3: Test drag and drop interactions**

- [ ] Drag a card and verify visual feedback
- [ ] Create a condition group
- [ ] Merge cards into groups
- [ ] Reorder cards
- [ ] Verify no console errors

- [ ] **Step 4: If all looks good, commit**

```bash
git add -A
git commit -m "test: verify styled-components migration and visual consistency"
```

---

## Task 10: Add responsive design utilities and animations

**Files:**

- Create: `src/styles/responsive.ts`
- Modify: `src/components/styled/Box.tsx`

- [ ] **Step 1: Create responsive utilities**

```typescript
// src/styles/responsive.ts
import { theme } from "./tokens";

export const media = {
  xs: (styles: string) =>
    `@media (min-width: ${theme.breakpoints.xs}) { ${styles} }`,
  sm: (styles: string) =>
    `@media (min-width: ${theme.breakpoints.sm}) { ${styles} }`,
  md: (styles: string) =>
    `@media (min-width: ${theme.breakpoints.md}) { ${styles} }`,
  lg: (styles: string) =>
    `@media (min-width: ${theme.breakpoints.lg}) { ${styles} }`,
  xl: (styles: string) =>
    `@media (min-width: ${theme.breakpoints.xl}) { ${styles} }`,
  "2xl": (styles: string) =>
    `@media (min-width: ${theme.breakpoints["2xl"]}) { ${styles} }`,
};

export const animations = {
  fadeIn: `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    animation: fadeIn 0.3s ease-in-out;
  `,
  slideUp: `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    animation: slideUp 0.3s ease-in-out;
  `,
  slideDown: `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    animation: slideDown 0.3s ease-in-out;
  `,
  pulse: `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  `,
};
```

- [ ] **Step 2: Add animations to Card component**

Update `src/module/Card.tsx` to add fadeIn animation to CardWrapper:

```typescript
const CardWrapper = styled.div`
  position: relative;
  margin-bottom: ${theme.spacing.md};
  cursor: move;
  ${animations.fadeIn}

  &:hover {
    .dragIcon {
      color: ${theme.colors.primary};
    }
  }
`;
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/styles/responsive.ts src/module/Card.tsx
git commit -m "feat: add responsive design utilities and entrance animations"
```

---

## Task 11: Final verification and documentation

**Files:**

- Create: `STYLES_OPTIMIZATION.md` (documentation)

- [ ] **Step 1: Create styles documentation**

```markdown
# Styles Optimization Documentation

## Overview

The project has been completely refactored from mixed CSS/SCSS to a modern styled-components architecture with a comprehensive design system.

## Design System

All design tokens are centralized in `src/styles/tokens.ts`:

- **Colors**: Primary, secondary, status, neutral, text, background
- **Spacing**: 8px-based scale (xs, sm, md, lg, xl, xxl, xxxl)
- **Typography**: Font families, sizes, weights, line heights
- **Shadows**: Multiple elevation levels for depth
- **Transitions**: Predefined animation durations
- **Breakpoints**: Responsive design breakpoints
- **Z-Index**: Consistent layering scale

## File Structure
```

src/
├── styles/
│ ├── tokens.ts # Design system tokens
│ ├── GlobalStyles.tsx # Global styled component
│ └── responsive.ts # Media queries and animations
├── components/
│ └── styled/
│ ├── index.ts # Exports
│ ├── Box.tsx # Layout primitive
│ ├── Flex.tsx # Flexbox layout
│ ├── Text.tsx # Typography
│ ├── Button.tsx # Button component
│ └── Card.tsx # Card component
└── module/
├── Card.tsx # Now uses styled-components
├── Wrapper.tsx # Now uses styled-components
└── ...

````

## Usage Examples

### Using Styled Components

```typescript
import styled from 'styled-components';
import { theme } from './styles/tokens';

const Container = styled.div`
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.bg.primary};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  transition: ${theme.transitions.all};
`;
````

### Using Responsive Utilities

```typescript
import { media } from "./styles/responsive";
import styled from "styled-components";

const ResponsiveBox = styled.div`
  padding: 16px;

  ${media.md(`
    padding: 24px;
  `)}

  ${media.lg(`
    padding: 32px;
  `)}
`;
```

### Using Animations

```typescript
import { animations } from "./styles/responsive";
import styled from "styled-components";

const AnimatedCard = styled.div`
  ${animations.slideUp}
  background: white;
  padding: 16px;
`;
```

## Migration Guide

If you need to update components to use styled-components:

1. Import styled-components at the top
2. Define styled component constants
3. Replace className references with styled components
4. Use theme tokens for all styling values
5. Remove CSS module imports

## Benefits

✅ **Type-safe styling** - Full TypeScript support
✅ **Scoped styles** - No CSS class conflicts
✅ **Dynamic styling** - Props-based conditional styles
✅ **Design tokens** - Consistent colors, spacing, typography
✅ **Better performance** - Only loaded styles
✅ **Maintainability** - Styles live with components
✅ **Responsive design** - Built-in media query utilities

## Future Enhancements

- [ ] Add dark theme variant
- [ ] Create Storybook for component documentation
- [ ] Add more animation presets
- [ ] Performance optimization with emotion if needed
- [ ] Add CSS-in-JS testing utilities

````

- [ ] **Step 2: Add STYLES_OPTIMIZATION.md to repo**

```bash
git add STYLES_OPTIMIZATION.md
git commit -m "docs: add styles optimization documentation"
````

- [ ] **Step 3: Run final build verification**

```bash
npm run build
```

Expected: Build succeeds with optimized output

- [ ] **Step 4: Verify project still has all functionality**

Start dev server and test:

- Card drag and drop works
- Visual feedback is visible
- All colors are correct
- Spacing is consistent
- No console errors

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "refactor: complete styled-components migration with design system"
```

---

## Success Criteria

✅ All styles converted to styled-components
✅ Design system tokens defined and used throughout
✅ No SCSS or CSS module files remaining
✅ Application renders correctly with all features working
✅ Responsive design utilities in place
✅ Animations and transitions smooth
✅ Build succeeds with no errors
✅ No console warnings or errors when running app
✅ Visual design is modern and consistent
✅ Documentation complete
