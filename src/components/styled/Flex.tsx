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
