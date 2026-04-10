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
- **Breakpoints**: Responsive design breakpoints (xs-2xl)
- **Z-Index**: Consistent layering scale

## File Structure

```
src/
├── styles/
│   ├── tokens.ts           # Design system tokens
│   ├── GlobalStyles.tsx    # Global styled component
│   └── responsive.ts       # Media queries and animations
├── components/
│   └── styled/
│       ├── index.ts        # Exports
│       ├── Box.tsx         # Layout primitive
│       ├── Flex.tsx        # Flexbox layout
│       ├── Text.tsx        # Typography
│       ├── Button.tsx      # Button component
│       └── Card.tsx        # Card component
└── module/
    ├── Card.tsx            # Now uses styled-components
    ├── Wrapper.tsx         # Now uses styled-components
    └── ...
```

## Usage Examples

### Using Styled Components

```typescript
import styled from "styled-components";
import { theme } from "./styles/tokens";

const Container = styled.div`
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.bg.primary};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  transition: ${theme.transitions.all};
`;
```

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

## Migration from SCSS to Styled-Components

### Benefits

✅ **Type-safe styling** - Full TypeScript support
✅ **Scoped styles** - No CSS class conflicts
✅ **Dynamic styling** - Props-based conditional styles
✅ **Design tokens** - Consistent colors, spacing, typography
✅ **Better performance** - Only loaded styles
✅ **Maintainability** - Styles live with components
✅ **Responsive design** - Built-in media query utilities
✅ **Animations** - Reusable animation presets

### What Changed

**Removed:**

- ❌ `src/App.css` - Replaced by GlobalStyles
- ❌ `src/module/index.module.scss` - Replaced by styled components

**Added:**

- ✅ `src/styles/tokens.ts` - Design system
- ✅ `src/styles/GlobalStyles.tsx` - Global styles
- ✅ `src/styles/responsive.ts` - Responsive utils
- ✅ `src/components/styled/` - Styled components library

**Converted:**

- ✅ `src/module/Card.tsx` - To styled-components
- ✅ `src/module/Wrapper.tsx` - To styled-components
- ✅ `src/App.tsx` - Added GlobalStyles

## Design System Tokens

### Colors

**Primary:**

- `primary`: #1677ff
- `primaryLight`: #40a9ff
- `primaryDark`: #0050b3

**Secondary:**

- `secondary`: #52c41a
- `secondaryLight`: #85ce61
- `secondaryDark`: #389e0d

**Status:**

- `success`: #52c41a
- `warning`: #faad14
- `error`: #ff4d4f
- `info`: #1677ff

**Neutral & Text:**

- 10-level gray scale: gray100-gray900
- Text colors: primary, secondary, tertiary, inverse
- Background: primary, secondary, tertiary

**Interactive & Feedback:**

- `hover`: #e6f7ff
- `active`: #bae0ff
- `disabled`: #f5f5f5
- `dragFeedback`: #1677ff
- `dragFeedbackBg`: rgba(22, 119, 255, 0.08)

### Spacing

Based on 8px base unit:

- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 24px
- `xxl`: 32px
- `xxxl`: 48px

### Typography

**Font Families:**

- Base: System font stack (-apple-system, BlinkMacSystemFont, etc.)
- Mono: source-code-pro, Menlo, Monaco, etc.

**Font Sizes:**

- xs: 12px, sm: 13px, base: 14px, md: 16px
- lg: 18px, xl: 20px, 2xl: 24px, 3xl: 32px

**Font Weights:**

- light: 300, normal: 400, medium: 500
- semibold: 600, bold: 700

### Shadows

- `sm`: Subtle shadow
- `md`: Medium elevation
- `lg`: Large elevation
- `xl`: Extra large elevation
- `dragOver`: Special shadow for drag feedback

### Transitions

- `fast`: 0.15s ease-in-out
- `base`: 0.3s ease-in-out
- `slow`: 0.5s ease-in-out
- Property-specific: color, background, border, all

### Breakpoints

- `xs`: 320px
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Z-Index Scale

Organized for proper stacking:

- `hide`: -1
- `base`: 0
- `dropdown`: 100
- `sticky`: 200
- `fixed`: 300
- `modalBackdrop`: 400
- `modal`: 500
- `popover`: 600
- `tooltip`: 700
- `notification`: 800
- `drag`: 1000

## Available Styled Components

### `src/components/styled/`

**Box**

- Layout primitive with padding, margin, positioning
- Props: padding, margin, backgroundColor, borderRadius, border, etc.

**Flex**

- Flexbox layout component
- Props: direction, align, justify, gap, wrap, flex

**Text**

- Typography component with theme integration
- Props: size, weight, color, lineHeight, textAlign, etc.

**Button**

- Button component with variants and sizes
- Variants: primary, secondary, ghost
- Sizes: sm, md, lg
- Props: variant, size, disabled

**Card**

- Card component with elevation support
- Props: elevated, interactive

## Animation Presets

In `src/styles/responsive.ts`:

- `fadeIn`: Opacity animation (0.3s)
- `slideUp`: Slide up + fade (0.3s)
- `slideDown`: Slide down + fade (0.3s)
- `pulse`: Continuous pulsing effect (2s)

## Responsive Design

Use media query helpers for responsive styles:

```typescript
const ResponsiveLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  ${media.md(`
    grid-template-columns: 1fr 1fr;
  `)}

  ${media.lg(`
    grid-template-columns: 1fr 1fr 1fr;
  `)}
`;
```

## Future Enhancements

- [ ] Add dark theme variant
- [ ] Create Storybook for component documentation
- [ ] Add more animation presets
- [ ] Performance optimization with emotion if needed
- [ ] Add CSS-in-JS testing utilities
- [ ] Create component composition examples
- [ ] Add accessibility utilities
- [ ] Document theming patterns

## Build & Performance

- **Bundle size**: Minimal increase from styled-components
- **Compilation**: Zero errors
- **Performance**: Optimized with babel-plugin-styled-components
- **Production ready**: All components tested and verified

## Dependencies

- `styled-components@6.3.12` - CSS-in-JS library
- `@types/styled-components@5.1.36` - TypeScript types
- `babel-plugin-styled-components@2.1.4` - Babel optimization

## Commits

This optimization was completed with the following commits:

1. `264fc95` - chore: add styled-components dependencies
2. `a61712e` - feat: add comprehensive design system tokens
3. `dcb4232` - feat: add global styles component with modern reset
4. `b731f11` - feat: add reusable styled components library
5. `45e1e9e` - feat: add GlobalStyles to App component
6. `0cb4219` - feat: convert Card component to styled-components
7. `012d8a7` - feat: convert Wrapper component to styled-components
8. `6fa4643` - chore: remove deprecated CSS and SCSS files
9. `3bb0e82` - test: verify styled-components migration
10. `7df37af` - feat: add responsive design utilities and animations

## Quick Start Guide

To add a new styled component:

```typescript
import styled from "styled-components";
import { theme } from "./styles/tokens";

const MyComponent = styled.div`
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.bg.primary};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.md};
  transition: ${theme.transitions.all};

  &:hover {
    background-color: ${theme.colors.hover};
  }
`;

export default MyComponent;
```

## Troubleshooting

**Q: Styles not applying?**
A: Make sure GlobalStyles is rendered in App.tsx and all components import theme tokens correctly.

**Q: TypeScript errors with theme?**
A: Ensure imports are correct: `import { theme } from '../styles/tokens'` (adjust path as needed).

**Q: Need to change a color globally?**
A: Update the color value in `src/styles/tokens.ts` and it will apply everywhere that uses it.

**Q: How to add a new animation?**
A: Add it to the `animations` object in `src/styles/responsive.ts` and import it where needed.
