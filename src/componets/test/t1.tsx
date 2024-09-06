import React, { useState } from 'react';

const AppT = () => {
  const [items, setItems] = useState([
    'Item 1',
    'Item 2',
    'Item 3',
    'Item 4',
  ]);

  const onDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const onDrop = (e, index) => {
    e.preventDefault();
    const fromIndex = e.dataTransfer.getData('text/plain');
    const updatedItems = [...items];
    const [movedItem] = updatedItems.splice(fromIndex, 1);
    updatedItems.splice(index, 0, movedItem);
    setItems(updatedItems);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <ul>
      {items.map((item, index) => (
        <li
          key={index}
          draggable
          onDragStart={(e) => onDragStart(e, index)}
          onDrop={(e) => onDrop(e, index)}
          onDragOver={onDragOver}
          style={{
            padding: '8px',
            margin: '4px 0',
            backgroundColor: '#f4f4f4',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'move',
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
};

export default AppT;
