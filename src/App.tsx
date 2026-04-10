import "./App.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import React, { useRef, useState } from "react";
import { Button, ConfigProvider, Card as AntdCard } from "antd";
import zhCN from "antd/locale/zh_CN";
import Wrapper from "./module/Wrapper";
import { CardData } from "./module/ItemTypes";
import GlobalStyles from "./styles/GlobalStyles";

function App() {
  const [cards, setCards] = useState<CardData[]>([]);
  const id = useRef(0);

  const addCard = () => {
    id.current += 1;
    const newCard: CardData = {
      name: `卡片名称${id.current}`,
      id: id.current,
      displayDef: `卡片内容${id.current}`,
      operator: "交",
    };
    setCards((prev) => [...prev, newCard]);
  };

  return (
    <ConfigProvider locale={zhCN}>
      <GlobalStyles />
      <div className="App" style={{ padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={addCard}>
            添加卡片
          </Button>
        </div>
        <div>
          <DndProvider backend={HTML5Backend}>
            <Wrapper cards={cards} setCards={setCards} isReadOnly={false} />
          </DndProvider>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
