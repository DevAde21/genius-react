import React from 'react';
import './ColorButton.css'; // Criaremos este CSS em breve

const ColorButton = ({ color, onClick, isFlashing }) => {
  // Mapeia a cor para uma classe CSS específica
  const colorClasses = {
    green: 'btn-genius-green',
    red: 'btn-genius-red',
    yellow: 'btn-genius-yellow',
    blue: 'btn-genius-blue',
  };

  // Adiciona a classe 'flashing' se o botão deve piscar
  const flashingClass = isFlashing ? 'flashing' : '';

  return (
    <div
      className={`color-button ${colorClasses[color]} ${flashingClass}`}
      onClick={() => onClick(color)} // Chama o onClick passando a cor
      // Adiciona role="button" e tabindex="0" para acessibilidade, se desejado
      role="button"
      tabIndex="0"
      onKeyPress={(e) => e.key === 'Enter' && onClick(color)} // Permite ativação com Enter
    >
      {/* Pode adicionar conteúdo interno se desejar, mas geralmente são apenas cores */}
    </div>
  );
};

export default ColorButton;