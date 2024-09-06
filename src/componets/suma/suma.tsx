import { useState, useEffect, DragEvent, TouchEvent } from 'react';

const MAX_ITEMS = 5;
const MAX_ATTEMPTS = 3; // Numărul maxim de încercări

// Funcție pentru a genera un număr aleatoriu între un minim și un maxim specificat
const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const MathProblem = () => {
  const [items, setItems] = useState<{ id: string; content: string }[]>([]);
  const [droppedItem, setDroppedItem] = useState<string | null>(null);
  const [leftNumber, setLeftNumber] = useState<number>(0);
  const [rightNumber, setRightNumber] = useState<number>(0);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string, type: 'correct' | 'incorrect' } | null>(null);
  const [score, setScore] = useState<number>(0); // Adăugăm starea pentru scor
  const [attempts, setAttempts] = useState<number>(0); // Număr de încercări greșite
  const [hearts, setHearts] = useState<number[]>([1, 1, 1]); // Starea pentru inimile rămase (1 - roșu, 0 - gri)
  const [draggedItem, setDraggedItem] = useState<string | null>(null); // Starea pentru itemul tras

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
        setFeedbackMessage({ text: "Răspuns corect!", type: 'correct' }); // Setăm mesajul de feedback
        setAttempts(0); // Resetăm numărul de încercări
        setHearts([1, 1, 1]); // Resetăm inimile la roșu
        setTimeout(() => {
          generateNewExample(); // Generăm un nou exemplu după 1 secundă
        }, 1500); // După 1 secundă, generăm un nou exemplu
      } else {
        setFeedbackMessage({ text: "Răspuns greșit! Încearcă din nou.", type: 'incorrect' }); // Setăm mesajul de feedback pentru răspuns greșit
        const newAttempts = attempts + 1;
        setAttempts(newAttempts); // Incrementăm numărul de încercări

        // Actualizăm starea inimilor
        if (newAttempts <= MAX_ATTEMPTS) {
          setHearts(prevHearts => {
            const updatedHearts = [...prevHearts];
            updatedHearts[MAX_ATTEMPTS - newAttempts] = 0; // Facem inima gri
            return updatedHearts;
          });
        }

        if (newAttempts >= MAX_ATTEMPTS) {
          setFeedbackMessage({ text: "Ai pierdut! Încearcă din nou.", type: 'incorrect' }); // Setăm mesajul de pierdere
          setTimeout(() => {
            resetGame(); // Resetează jocul după un timp
          }, 2000); // După 2 secunde, resetăm jocul
        } else {
          setTimeout(() => {
            setDroppedItem(null); // Resetăm răspunsul afișat la ?
            setFeedbackMessage(null); // Resetăm mesajul de feedback după o scurtă întârziere
          }, 1000); // După 1 secundă, resetăm răspunsul
        }
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

  const resetGame = () => {
    setScore(0); // Resetăm scorul
    setAttempts(0); // Resetăm numărul de încercări
    setHearts([1, 1, 1]); // Resetăm inimile la roșu
    generateNewExample(); // Generăm un nou exemplu
  };

  const getHeartColor = (index: number) => {
    return hearts[index] === 1 ? 'bg-red-500' : 'bg-gray-500'; // Roșu sau gri
  };

  const feedbackClass = feedbackMessage?.type === 'correct' ? 'text-green-500' : 'text-red-500';

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4 sm:p-6 lg:p-8">
      <div className="text-lg font-bold text-center mb-4">Calculați suma a două numere</div>
      <div className="flex space-x-2 mb-4">
        {hearts.map((_, index) => (
          <div
            key={index}
            className={`w-8 h-8 sm:w-12 sm:h-12 ${getHeartColor(index)} rounded-full flex items-center justify-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6 sm:w-8 sm:h-8 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          </div>
        ))}
      </div>
      <div className="text-xl font-bold text-center mb-4">Scor: {score}</div>
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
        <div className={`text-lg font-bold text-center mt-4 ${feedbackClass}`}>
          {feedbackMessage.text}
        </div>
      )}
    </div>
  );
};

export default MathProblem;
