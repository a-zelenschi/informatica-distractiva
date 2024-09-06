import * as React from 'react';
import RLDD from 'react-list-drag-and-drop/lib/RLDD';

// Date de test pentru iteme
const fruits = [
  { id: 1, title: 'Apple', icon: '🍎' },
  { id: 2, title: 'Banana', icon: '🍌' },
  { id: 3, title: 'Cherry', icon: '🍒' }
];

interface Item {
  id: number;
  title: string;
  icon: string;
}

interface State {
  items: Item[];
}

export default class HorizontalExample extends React.PureComponent<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { items: fruits };
  }

  render() {
    const items = this.state.items;
    return (
      <div style={styles.container}>
        <h2>Horizontal Example: Draggable List of Fruits</h2>
        <p>Drag and drop items to re-order the list.</p>
        <RLDD
          cssClasses="example-list-container"
          layout="horizontal"
          items={items}
          itemRenderer={this.itemRenderer}
          onChange={this.handleRLDDChange}
        />
      </div>
    );
  }

  private itemRenderer = (item: Item, index: number): JSX.Element => {
    return (
      <div className="item" key={item.id} style={styles.item}>
        <div className="icon" style={styles.icon}>{item.icon}</div>
        <div className="title" style={styles.title}>{item.title}</div>
        <div className="small" style={styles.small}>
          item.id: {item.id} - index: {index}
        </div>
      </div>
    );
  };

  private handleRLDDChange = (reorderedItems: Array<Item>) => {
    this.setState({ items: reorderedItems });
  };
}

// Stiluri CSS incluse direct în componentă pentru simplificare
const styles = {
  container: {
    padding: '20px'
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f1f1f1',
    borderRadius: '4px',
    cursor: 'pointer',
    userSelect: 'none' // Previne selectarea textului la drag-and-drop
  },
  icon: {
    fontSize: '24px',
    marginRight: '10px'
  },
  title: {
    fontSize: '18px'
  },
  small: {
    fontSize: '12px',
    color: '#888'
  }
};
