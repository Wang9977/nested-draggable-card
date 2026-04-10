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
