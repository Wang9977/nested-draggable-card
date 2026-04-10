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
