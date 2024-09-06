import  { useState, useEffect, DragEvent } from 'react';

const MAX_ITEMS = 5;

// Funcție pentru a genera un număr aleatoriu între un minim și un maxim specificat
const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const Modal = ({ message, onClose }: { message: string, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="text-lg font-bold">{message}</div>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={onClose}
        >
          Treci la alt exemplu
        </button>
      </div>
    </div>
  );
};

const MathProblem = () => {
  const [items, setItems] = useState<{ id: string, content: string }[]>([]);
  const [droppedItem, setDroppedItem] = useState<string | null>(null);
  const [leftNumber, setLeftNumber] = useState<number>(0);
  const [rightNumber, setRightNumber] = useState<number>(0);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    generateNewExample();
  }, []);

  const generateNewExample = () => {
    const newLeftNumber = getRandomNumber(1, 10);
    const newRightNumber = getRandomNumber(1, 10);
    const sum = newLeftNumber + newRightNumber;

    // Generăm răspunsuri posibile
    const newItems: { id: string, content: string }[] = [];
    while (newItems.length < MAX_ITEMS - 1) {
      const randomAnswer = getRandomNumber(1, 20).toString();
      if (!newItems.some(item => item.content === randomAnswer) && randomAnswer !== sum.toString()) {
        newItems.push({ id: (newItems.length + 1).toString(), content: randomAnswer });
      }
    }

    // Adăugăm răspunsul corect în lista de răspunsuri
    newItems.push({ id: (newItems.length + 1).toString(), content: sum.toString() });

    // Șuffle list and set state
    setItems(newItems.sort(() => Math.random() - 0.5));
    setCorrectAnswer(sum.toString());
    setLeftNumber(newLeftNumber);
    setRightNumber(newRightNumber);
    setDroppedItem(null); // Resetăm răspunsul afișat la ?
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const sourceIndex = e.dataTransfer.getData('text/plain');

    if (sourceIndex && sourceIndex !== null) {
      const sourceIdx = parseInt(sourceIndex, 10);
      const item = items[sourceIdx];
      setDroppedItem(item.content);

      // Verificăm dacă răspunsul selectat este corect
      if (item.content === correctAnswer) {
        setShowModal(true); // Afișăm modalul
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    generateNewExample(); // Generăm un nou exemplu la închiderea modalului
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="text-lg font-bold">Calculați suma a două numere</div>
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 bg-green-400 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
          {leftNumber}
        </div>
        <div className="text-2xl font-bold">+</div>
        <div className="w-20 h-20 bg-green-400 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
          {rightNumber}
        </div>
        <div className="text-2xl font-bold">=</div>
        <div
          className="w-20 h-20 bg-red-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {droppedItem || '?'}
        </div>
      </div>
      <div className="text-lg font-bold">Lista Răspunsurilor</div>
      <div className="flex items-center space-x-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="w-20 h-20 bg-red-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            data-index={index}
          >
            {item.content}
          </div>
        ))}
      </div>
      {showModal && (
        <Modal 
          message="Răspuns corect!" 
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default MathProblem;
