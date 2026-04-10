import styled from "styled-components";
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
