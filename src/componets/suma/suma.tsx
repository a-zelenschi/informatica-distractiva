import { useState, useEffect, DragEvent, TouchEvent } from 'react';

const MAX_ITEMS = 4;

// Funcție pentru a genera un număr aleatoriu între un minim și un maxim specificat
const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const Modal = ({ message, onClose }: { message: string, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-sm w-full">
        <div className="text-lg font-bold text-center">{message}</div>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg w-full"
          onClick={onClose}
        >
          Treci la alt exemplu
        </button>
      </div>
    </div>
  );
};

const MathProblem = () => {
  const [items, setItems] = useState<{ id: string; content: string }[]>([]);
  const [droppedItem, setDroppedItem] = useState<string | null>(null);
  const [leftNumber, setLeftNumber] = useState<number>(0);
  const [rightNumber, setRightNumber] = useState<number>(0);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0); // Adăugăm starea pentru scor
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null); // Adăugăm feedback pentru răspunsuri greșite

  useEffect(() => {
    generateNewExample();
  }, []);

  const generateNewExample = () => {
    const newLeftNumber = getRandomNumber(1, 10);
    const newRightNumber = getRandomNumber(1, 10);
    const sum = newLeftNumber + newRightNumber;

    // Generăm răspunsuri posibile
    const newItems: { id: string; content: string }[] = [];
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
    setFeedbackMessage(null); // Resetăm mesajul de feedback
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedItem(items[index].content);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    setDraggedItem(items[index].content);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.type === 'drop' || e.type === 'touchend') {
      if (draggedItem === correctAnswer) {
        setScore(score + 10); // Incrementăm scorul cu 10 puncte
        setShowModal(true); // Afișăm modalul
        setFeedbackMessage(null); // Resetăm mesajul de feedback
      } else {
        setFeedbackMessage("Răspuns greșit! Încearcă din nou."); // Setăm mesajul de feedback pentru răspuns greșit
        setTimeout(() => {
          setDroppedItem(null); // Resetăm răspunsul afișat la ?
          setFeedbackMessage(null); // Resetăm mesajul de feedback după o scurtă întârziere
        }, 1000); // După 1 secundă, resetăm răspunsul
      }
      setDraggedItem(null); // Resetează itemul tras
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    generateNewExample(); // Generăm un nou exemplu la închiderea modalului
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4 sm:p-6 lg:p-8">
      <div className="text-lg font-bold text-center">Calculați suma a două numere</div>
      <div className="text-xl font-bold text-center mb-4">Scor: {score}</div> {/* Afișăm scorul curent */}
      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-400 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
          {leftNumber}
        </div>
        <div className="text-xl sm:text-2xl font-bold">+</div>
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-400 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
          {rightNumber}
        </div>
        <div className="text-xl sm:text-2xl font-bold">=</div>
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl font-bold ${droppedItem === correctAnswer ? 'bg-green-500' : 'bg-red-500'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onTouchEnd={(e) => handleDrop(e)}
          onTouchMove={handleTouchMove}
        >
          {droppedItem || '?'}
        </div>
      </div>
      <div className="text-lg font-bold text-center">Lista Răspunsurilor</div>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl font-bold"
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onTouchStart={(e) => handleTouchStart(e, index)}
          >
            {item.content}
          </div>
        ))}
      </div>
      {feedbackMessage && (
        <div className="text-red-500 font-bold text-center mt-4">{feedbackMessage}</div>
      )}
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
