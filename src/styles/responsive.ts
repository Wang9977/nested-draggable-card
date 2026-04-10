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
