import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const COLORS = ['green', 'red', 'yellow', 'blue'];
const SOUNDS = {
  green: '/sounds/green.aac',
  red: '/sounds/red.aac',
  yellow: '/sounds/yellow.aac',
  blue: '/sounds/blue.aac',
};
const DIFFICULTIES = {
  1: { name: 'EASY', timeout: 800000 }, //8000
  2: { name: 'MEDIUM', timeout: 4000 },
  3: { name: 'HARD', timeout: 2000 },
};

function App() {
  const [difficulty, setDifficulty] = useState(null);
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [activeButton, setActiveButton] = useState(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('SELECT DIFFICULTY TO START');
  const [isGameOver, setIsGameOver] = useState(false);

  const playerTimerRef = useRef(null);
  const audioRefs = useRef({});

  const playSound = useCallback((color) => {
    try {
      const audio = new Audio(SOUNDS[color]);
      audio.play().catch(error => console.error(`Error playing sound ${color}:`, error));
    } catch (error) {
      console.error(`Could not create or play audio for ${color}:`, error);
    }
  }, []);

  const highlightButton = useCallback((color, duration = 300) => {
    setActiveButton(color);
    setTimeout(() => {
      setActiveButton(null);
    }, duration);
  }, []);

  const resetGame = useCallback((msg = 'SELECT DIFFICULTY TO START') => {
    setDifficulty(null);
    setSequence([]);
    setPlayerSequence([]);
    setIsPlayingSequence(false);
    setIsPlayerTurn(false);
    setScore(0);
    setActiveButton(null);
    setMessage(msg);
    setIsGameOver(false);
    if (playerTimerRef.current) {
      clearTimeout(playerTimerRef.current);
      playerTimerRef.current = null;
    }
  }, []);

  const gameOver = useCallback(() => {
    playSound('red');
    playSound('blue');
    setIsGameOver(true);
    setMessage(`GAME OVER! SELECT DIFFICULTY TO RESTART.`);
    setIsPlayerTurn(false);
    setIsPlayingSequence(false);
     if (playerTimerRef.current) {
        clearTimeout(playerTimerRef.current);
        playerTimerRef.current = null;
    }
    setSequence([]);
    setPlayerSequence([]);
    setDifficulty(null);
  }, [score, playSound]);

  const startPlayerTimer = useCallback(() => {
    if (playerTimerRef.current) {
      clearTimeout(playerTimerRef.current);
    }
    if (difficulty && DIFFICULTIES[difficulty]) {
      playerTimerRef.current = setTimeout(() => {
         console.log("Timer expired!");
         gameOver();
      }, DIFFICULTIES[difficulty].timeout);
    }
  }, [difficulty, gameOver]);

  const playerTurn = useCallback(() => {
    setIsPlayerTurn(true);
    setIsPlayingSequence(false);
    setMessage('YOUR TURN');
    setPlayerSequence([]);
    startPlayerTimer();
  }, [startPlayerTimer]);

  const playSequence = useCallback(async () => {
    setMessage('WATCH CAREFULLY...');
    setIsPlayingSequence(true);
    setIsPlayerTurn(false);

    await new Promise(resolve => setTimeout(resolve, 500));

    for (const color of sequence) {
      playSound(color);
      highlightButton(color, 400);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    playerTurn();
  }, [sequence, highlightButton, playSound, playerTurn]);

  const nextRound = useCallback(() => {
     if (isGameOver) return;

    setIsPlayerTurn(false);
    if (playerTimerRef.current) {
        clearTimeout(playerTimerRef.current);
    }

    const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newSequence = [...sequence, nextColor];
    setSequence(newSequence);
  }, [sequence, isGameOver]);

  useEffect(() => {
    if (difficulty !== null && !isGameOver && sequence.length > 0) {
       playSequence();
    }
  }, [sequence, difficulty, isGameOver]);

  const handlePlayerClick = useCallback((color) => {
    if (!isPlayerTurn || isPlayingSequence || isGameOver) return;

    if (playerTimerRef.current) {
      clearTimeout(playerTimerRef.current);
      playerTimerRef.current = null;
    }

    playSound(color);
    highlightButton(color, 150);

    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      gameOver();
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      setScore(prevScore => prevScore + 1);
      setIsPlayerTurn(false);
      setMessage('CORRECT!');
      setTimeout(() => {
        nextRound();
      }, 1000);
    } else {
      startPlayerTimer();
    }
  }, [
    isPlayerTurn,
    isPlayingSequence,
    isGameOver,
    playerSequence,
    sequence,
    difficulty,
    playSound,
    highlightButton,
    gameOver,
    nextRound,
    startPlayerTimer
  ]);

  const handleDifficultySelect = (level) => {
    if (isPlayingSequence) return;
    resetGame(`LEVEL ${level} SELECTED`);
    setDifficulty(level);
    setTimeout(() => {
        setIsPlayerTurn(false);
        const firstColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        setSequence([firstColor]);
    }, 100);
  };

  return (
    <div className="App">
      <h1>GENIUS REACT</h1>
      <p>SCORE: {score}</p>
      <p>{message}</p>

      {difficulty === null && (
        <div className="difficulty-selector">
          {Object.entries(DIFFICULTIES).map(([level, details]) => (
            <button className="difficulty-button"
              key={level}
              onClick={() => handleDifficultySelect(parseInt(level))}
              disabled={isPlayingSequence}
            >
              {details.name}
            </button>
          ))}
        </div>
      )}

      {difficulty !== null && (
         <div className={`game-board ${isGameOver ? 'game-over-flash' : ''}`}>
         <div className="board-row">
           <button
             className={`color-button green ${activeButton === 'green' ? 'active' : ''}`}
             onClick={() => handlePlayerClick('green')}
             disabled={!isPlayerTurn || isPlayingSequence || isGameOver}
             aria-label="Green Button"
           />
           <button
             className={`color-button red ${activeButton === 'red' ? 'active' : ''}`}
             onClick={() => handlePlayerClick('red')}
             disabled={!isPlayerTurn || isPlayingSequence || isGameOver}
             aria-label="Red Button"
           />
         </div>
         <div className="board-row">
           <button
             className={`color-button blue ${activeButton === 'blue' ? 'active' : ''}`}
             onClick={() => handlePlayerClick('blue')}
             disabled={!isPlayerTurn || isPlayingSequence || isGameOver}
             aria-label="Blue Button"
           />
           <button
             className={`color-button yellow ${activeButton === 'yellow' ? 'active' : ''}`}
             onClick={() => handlePlayerClick('yellow')}
             disabled={!isPlayerTurn || isPlayingSequence || isGameOver}
             aria-label="Yellow Button"
           />
         </div>
         <div className="center-circle"></div>
       </div>
      )}
    </div>
  );
}

export default App;