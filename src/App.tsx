import React, { useState } from "react";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { CardData } from "./module/ItemTypes";
import Playground from "./pages/Playground";
import GlobalStyles from "./styles/GlobalStyles";

function App() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [maxLevel, setMaxLevel] = useState(3);

  return (
    <ConfigProvider locale={zhCN}>
      <GlobalStyles />
      <Playground
        cards={cards}
        setCards={setCards}
        maxLevel={maxLevel}
        setMaxLevel={setMaxLevel}
      />
    </ConfigProvider>
  );
}

export default App;
