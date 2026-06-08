import React from 'react';
import Sup2iLogo from '../services/Sup2iLogo.png';

export default function LogoSpin() {
  return (
    <div className="flex items-center justify-center w-42 h-12">
      <img
        src={Sup2iLogo}
        alt="Logo Sup2i"
        className="w-full h-full object-contain animate-spin-3d"
      />
    </div>
  );
}
