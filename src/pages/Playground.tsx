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

const JsonBlock = styled.pre`
  margin: 0;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.gray100};
  color: ${theme.colors.text.primary};
  overflow: auto;
  font-size: ${theme.typography.fontSize.xs};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const Summary = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  flex-wrap: wrap;
`;

const SummaryItem = styled.div`
  min-width: 120px;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.gray100};
`;

interface PlaygroundProps {
  cards: CardData[];
  setCards: React.Dispatch<React.SetStateAction<CardData[]>>;
  maxLevel: number;
  setMaxLevel: React.Dispatch<React.SetStateAction<number>>;
}

const countNodes = (list: CardData[]): number =>
  list.reduce(
    (total, item) => total + 1 + (item.children?.length ? countNodes(item.children) : 0),
    0
  );

const countGroups = (list: CardData[]): number =>
  list.reduce(
    (total, item) =>
      total +
      (item.children ? 1 : 0) +
      (item.children?.length ? countGroups(item.children) : 0),
    0
  );

const Playground: React.FC<PlaygroundProps> = ({
  cards,
  setCards,
  maxLevel,
  setMaxLevel,
}) => {
  const id = useRef(cards.length);

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

  const summary = useMemo(
    () => ({
      totalNodes: countNodes(cards),
      groupCount: countGroups(cards),
      rootCount: cards.length,
    }),
    [cards]
  );

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
            <>
              <Summary>
                <SummaryItem>
                  <Text type="secondary">根节点</Text>
                  <Title level={4} style={{ margin: "4px 0 0" }}>
                    {summary.rootCount}
                  </Title>
                </SummaryItem>
                <SummaryItem>
                  <Text type="secondary">全部节点</Text>
                  <Title level={4} style={{ margin: "4px 0 0" }}>
                    {summary.totalNodes}
                  </Title>
                </SummaryItem>
                <SummaryItem>
                  <Text type="secondary">条件组</Text>
                  <Title level={4} style={{ margin: "4px 0 0" }}>
                    {summary.groupCount}
                  </Title>
                </SummaryItem>
              </Summary>
              <JsonBlock>{JSON.stringify(cards, null, 2)}</JsonBlock>
            </>
          ) : (
            <Empty description="左侧添加卡片后，这里会实时显示全部绑定数据" />
          )}
        </PanelCard>
      </Layout>
    </Page>
  );
};

export default Playground;
