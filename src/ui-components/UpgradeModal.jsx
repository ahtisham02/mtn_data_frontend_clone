import React from 'react';
import { useNavigate } from 'react-router-dom';
import ModalPortal from './ModalPortal';
import { Wallet, AlertTriangle, X } from 'lucide-react';

export default function UpgradeModal({ isOpen, onClose, title, message, buttonText }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgradeClick = () => {
    onClose();
    navigate('/dashboard');
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4 font-plus-jakarta"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md text-center relative animate-modalFadeInScale"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
          
          <div className="mb-6 flex justify-center">
            <div className="relative inline-block p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-full shadow-lg">
              <div className="relative p-5 bg-white rounded-full shadow-inner">
                <Wallet size={48} className="text-red-500" />
                <AlertTriangle size={20} className="absolute -top-1 -right-1 text-orange-400 fill-orange-400" />
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
            {title}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mb-8 leading-relaxed">
            {message}
          </p>

          <button
            onClick={handleUpgradeClick}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}