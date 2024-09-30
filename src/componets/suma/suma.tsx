import { useState, useEffect, useCallback, DragEvent, TouchEvent } from 'react';

const MAX_ITEMS = 4;
const MAX_ATTEMPTS = 3; // Numărul maxim de încercări

const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const getUnitsCount = (score: number) => {
  if (score < 200) return 1;
  if (score < 800) return 2;
  if (score < 1000) return 3;
  return 4; // Peste 10000, 4 unități
};

const MathProblem = () => {
  const [items, setItems] = useState<{ id: string; content: string }[]>([]);
  const [droppedItem, setDroppedItem] = useState<string | null>(null);
  const [leftNumber, setLeftNumber] = useState<number>(0);
  const [rightNumber, setRightNumber] = useState<number>(0);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string, type: 'correct' | 'incorrect' } | null>(null);
  const [score, setScore] = useState<number>(0); // Starea pentru scor
  const [, setAttempts] = useState<number>(0); // Numărul de încercări greșite
  const [hearts, setHearts] = useState<number[]>([1, 1, 1]); // Starea pentru inimile rămase
  const [draggedItem, setDraggedItem] = useState<string | null>(null); // Starea pentru itemul tras
  const [showModal, setShowModal] = useState<boolean>(false); // Starea pentru modal
  const [showModalScore, setShowModalScore] = useState<boolean>(false); // Starea pentru modalul de salvare scor
  const [email, setEmail] = useState<string>(''); // Starea pentru email
  const [emailError, setEmailError] = useState<string>(''); // Starea pentru mesajul de eroare al emailului
  const [emailSent, setEmailSent] = useState<boolean>(false); // Starea pentru confirmarea trimiterii emailului
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false); // Starea pentru a preveni generarea repetată

  const generateNewExample = useCallback(() => {
    const unitsCount = getUnitsCount(score);
    
    // Generăm numerele pe baza unităților
    const newLeftNumber = getRandomNumber(1, unitsCount * 10);
    const newRightNumber = getRandomNumber(1, unitsCount * 10);
    const sum = newLeftNumber + newRightNumber;

    // Generăm răspunsuri posibile
    const newItems: { id: string; content: string }[] = [];
    while (newItems.length < MAX_ITEMS - 1) {
      const randomAnswer = getRandomNumber(1, unitsCount * 20).toString();
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
    setDroppedItem(null);
    setFeedbackMessage(null);
    setIsAnswerCorrect(false); // Resetăm starea după generarea unei noi întrebări
  }, [score]);

  useEffect(() => {
    generateNewExample();
  }, [generateNewExample]);

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
      if (draggedItem === correctAnswer && !isAnswerCorrect) {
        setScore(prevScore => prevScore + 10); // Incrementăm scorul cu 10 puncte
        setFeedbackMessage({ text: "Răspuns corect!", type: 'correct' });
        setDroppedItem(null);
        setIsAnswerCorrect(true); // Setăm că răspunsul a fost corect

        setTimeout(() => {
          if (isAnswerCorrect) {
            generateNewExample();
          }
        }, 1500);
      } else {
        setFeedbackMessage({ text: "Răspuns greșit! Încearcă din nou.", type: 'incorrect' });
        setAttempts(prevAttempts => {
          const newAttempts = prevAttempts + 1;

          // Actualizăm starea inimilor
          setHearts(prevHearts => {
            const updatedHearts = [...prevHearts];
            updatedHearts[MAX_ATTEMPTS - newAttempts] = 0; // Facem inima gri
            return updatedHearts;
          });

          if (newAttempts >= MAX_ATTEMPTS) {
            setShowModal(true); // Arătăm modalul când toate inimile sunt utilizate
            return newAttempts;
          }

          setTimeout(() => {
            setDroppedItem(null);
            setFeedbackMessage(null);
          }, 1000);

          return newAttempts;
        });
      }
      setDraggedItem(null);
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

  const handleRestart = () => {
    setShowModal(false);
    resetGame();
  };

  const handleSaveScore = () => {
    setShowModal(false);
    setShowModalScore(true);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const handleSaveScoreConfirm = async () => {
    if (!validateEmail(email)) {
      setEmailError('Adresa de email nu este validă.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/send-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, score }),
      });

      const result = await response.json();
      if (result.success) {
        setEmailSent(true);
        setShowModalScore(false);
      } else {
        setEmailError('Eroare la trimiterea emailului.');
      }
    } catch (error) {
      setEmailError('Eroare la trimiterea emailului.' + error);
    }
  };

  const handleSaveScoreCancel = () => {
    setShowModalScore(false); // Închide modalul de salvare a scorului
    resetGame(); // Resetează jocul
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4 sm:p-6 lg:p-8">
      <div className="text-lg font-bold text-center mb-4">Calculați suma</div>
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

      {/* Modalul de pierdere */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="text-lg font-bold mb-4">Ai pierdut! Încearcă din nou?</div>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={handleRestart}
              >
                Începe din nou
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
                onClick={handleSaveScore}
              >
                Salvează scorul
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modalul pentru salvarea scorului */}
      {showModalScore && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="text-lg font-bold mb-4">Scorul tău: {score}</div>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Introdu adresa de email:</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className="border border-gray-300 p-2 rounded-lg w-full"
              />
              {emailError && <div className="text-red-500 text-sm mt-2">{emailError}</div>}
            </div>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
                onClick={handleSaveScoreConfirm}
              >
                Confirmă
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
                onClick={handleSaveScoreCancel}
              >
                Anulează
              </button>
            </div>
            {emailSent && <div className="text-green-500 text-sm mt-2">Scorul a fost trimis cu succes!</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default MathProblem;
