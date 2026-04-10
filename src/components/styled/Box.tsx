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
