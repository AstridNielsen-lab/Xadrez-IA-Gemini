import React from 'react';

export function Footer() {
  return (
    <footer className="w-full bg-white shadow-md mt-8 py-4">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-gray-600">
            Desenvolvido por{' '}
            <a
              href="https://likelook.wixsite.com/solutions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Julio Campos Machado
            </a>
          </p>
          <p className="text-gray-600 mt-2">
            <a
              href="https://wa.me/5511970603441"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              WhatsApp: +55 11 97060-3441
            </a>
          </p>
          <p className="text-gray-600 mt-2">
            <a
              href="https://likelook.wixsite.com/solutions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Like Look Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}