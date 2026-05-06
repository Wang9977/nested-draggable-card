import React, { useMemo, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button, Card, Empty, InputNumber, Typography } from "antd";
import styled from "styled-components";
import Wrapper from "../module/Wrapper";
import { CardData } from "../module/ItemTypes";
import { theme } from "../styles/tokens";

const { Title, Text } = Typography;

const Page = styled.div`
  min-height: 100vh;
  padding: ${theme.spacing.xl};
  background:
    radial-gradient(circle at top left, rgba(22, 119, 255, 0.12), transparent 28%),
    linear-gradient(180deg, ${theme.colors.bg.secondary} 0%, ${theme.colors.bg.primary} 100%);
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(360px, 1.1fr) minmax(320px, 0.9fr);
  gap: ${theme.spacing.xl};

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const PanelCard = styled(Card)`
  height: 100%;
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.md};

  .ant-card-head {
    border-bottom: 1px solid ${theme.colors.gray300};
  }

  .ant-card-body {
    padding: 24px;
  }
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const Canvas = styled.div`
  min-height: 520px;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.xl};
  background: ${theme.colors.bg.secondary};
  border: 1px solid ${theme.colors.gray300};
`;

const JsonBlock = styled.div`
  margin: 0;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.gray100};
  color: ${theme.colors.text.primary};
  overflow: auto;
  font-size: ${theme.typography.fontSize.xs};
  line-height: ${theme.typography.lineHeight.relaxed};
  font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
`;

interface PlaygroundProps {
  cards: CardData[];
  setCards: React.Dispatch<React.SetStateAction<CardData[]>>;
  maxLevel: number;
  setMaxLevel: React.Dispatch<React.SetStateAction<number>>;
}

const JsonRow = styled.div<{ $depth: number }>`
  padding-left: ${({ $depth }) => $depth * 16}px;
  white-space: pre;
`;

const Toggle = styled.summary`
  list-style: none;
  cursor: pointer;

  &::-webkit-details-marker {
    display: none;
  }
`;

const JsonDetails = styled.details`
  &[open] > summary .caret {
    transform: rotate(90deg);
  }
`;

const Caret = styled.span`
  display: inline-block;
  width: 12px;
  color: ${theme.colors.text.secondary};
  transition: transform 0.15s ease;
`;

const KeyText = styled.span`
  color: #8c3fc9;
`;

const StringText = styled.span`
  color: #1f7a45;
`;

const NumberText = styled.span`
  color: #c25100;
`;

const BooleanText = styled.span`
  color: #1677ff;
`;

const NullText = styled.span`
  color: ${theme.colors.text.secondary};
`;

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const formatPrimitive = (value: JsonValue) => {
  if (typeof value === "string") return <StringText>"{value}"</StringText>;
  if (typeof value === "number") return <NumberText>{value}</NumberText>;
  if (typeof value === "boolean") return <BooleanText>{String(value)}</BooleanText>;
  return <NullText>null</NullText>;
};

const JsonNode: React.FC<{
  value: JsonValue;
  depth?: number;
  label?: string;
  isLast?: boolean;
  defaultOpen?: boolean;
}> = ({ value, depth = 0, label, isLast = true, defaultOpen = true }) => {
  const suffix = isLast ? "" : ",";

  if (value === null || typeof value !== "object") {
    return (
      <JsonRow $depth={depth}>
        {label ? (
          <>
            <KeyText>"{label}"</KeyText>: {formatPrimitive(value)}
            {suffix}
          </>
        ) : (
          <>
            {formatPrimitive(value)}
            {suffix}
          </>
        )}
      </JsonRow>
    );
  }

  const isArray = Array.isArray(value);
  const entries = isArray
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(value);
  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";
  const preview = isArray
    ? `Array(${value.length})`
    : `${entries.length} key${entries.length === 1 ? "" : "s"}`;

  if (!entries.length) {
    return (
      <JsonRow $depth={depth}>
        {label ? (
          <>
            <KeyText>"{label}"</KeyText>: {openBracket}
            {closeBracket}
            {suffix}
          </>
        ) : (
          <>
            {openBracket}
            {closeBracket}
            {suffix}
          </>
        )}
      </JsonRow>
    );
  }

  return (
    <JsonDetails open={defaultOpen}>
      <Toggle>
        <JsonRow $depth={depth}>
          <Caret className="caret">▶</Caret>
          {label ? <KeyText>"{label}"</KeyText> : null}
          {label ? ": " : ""}
          {openBracket}
          <NullText> {preview}</NullText>
        </JsonRow>
      </Toggle>
      {entries.map(([entryKey, entryValue], index) => (
        <JsonNode
          key={`${depth}-${entryKey}`}
          value={entryValue}
          depth={depth + 1}
          label={isArray ? undefined : entryKey}
          isLast={index === entries.length - 1}
          defaultOpen={depth < 1}
        />
      ))}
      <JsonRow $depth={depth}>
        {closeBracket}
        {suffix}
      </JsonRow>
    </JsonDetails>
  );
};

const Playground: React.FC<PlaygroundProps> = ({
  cards,
  setCards,
  maxLevel,
  setMaxLevel,
}) => {
  const id = useRef(cards.length);
  const jsonValue = useMemo(() => cards as unknown as JsonValue, [cards]);

  const addCard = () => {
    id.current += 1;
    const nextId = id.current;
    const newCard: CardData = {
      id: nextId,
      name: `卡片名称${nextId}`,
      displayDef: `卡片内容${nextId}`,
      operator: "交",
    };
    setCards((prev) => [...prev, newCard]);
  };

  return (
    <Page>
      <Header>
        <Title level={2} style={{ marginBottom: 8 }}>
          Playground
        </Title>
        <Text type="secondary">
          左侧添加和拖拽卡片，右侧实时展示当前卡片结构绑定的完整数据。
        </Text>
      </Header>
      <Layout>
        <PanelCard title="卡片编辑区">
          <Toolbar>
            <Button type="primary" onClick={addCard}>
              添加卡片
            </Button>
            <span>最大层级</span>
            <InputNumber
              min={1}
              max={10}
              value={maxLevel}
              onChange={(value) => setMaxLevel(value || 1)}
            />
          </Toolbar>
          <Canvas>
            <DndProvider backend={HTML5Backend}>
              <Wrapper
                cards={cards}
                setCards={setCards}
                isReadOnly={false}
                maxLevel={maxLevel}
              />
            </DndProvider>
          </Canvas>
        </PanelCard>
        <PanelCard title="绑定数据">
          {cards.length ? (
            <JsonBlock>
              <JsonNode value={jsonValue} />
            </JsonBlock>
          ) : (
            <Empty description="左侧添加卡片后，这里会实时显示全部绑定数据" />
          )}
        </PanelCard>
      </Layout>
    </Page>
  );
};

export default Playground;
