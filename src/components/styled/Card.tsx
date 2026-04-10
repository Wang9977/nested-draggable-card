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
