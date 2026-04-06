import React from 'react';

const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: (e: React.MouseEvent) => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white border border-slate-200 rounded-2xl shadow-lg p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

export default Card;
