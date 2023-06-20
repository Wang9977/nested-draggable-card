
import './App.css';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React, { useRef, useEffect, useState } from 'react';

import { Wrapper } from './module/Wrapper';

function App() {
  const [cards, setCards] = useState([]);
  const id = useRef(0);
  const addCard = ()=>{
    id.current+=1
    let obj = {
      name:'卡片名称'+id.current,
      id:id.current,
      displayDef:'卡片内容'+id.current,
      operator: '交',
    }
    

    setCards([...cards,obj])
  }
  return (
    <div className="App">
      <div><button onClick={addCard}>添加卡片</button></div>

      <div >
        <DndProvider backend={HTML5Backend}>
            <Wrapper
                cards={cards}
                setCards={setCards}
                isReadOnly={false}
            />
        </DndProvider>
      </div>

    </div>
  );
}

export default App;
