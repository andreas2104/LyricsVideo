import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdLanguage } from 'react-icons/md';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <MdLanguage size={24} />
      <button 
        onClick={() => changeLanguage('fr')} 
        style={{ 
          fontWeight: i18n.language.startsWith('fr') ? 'bold' : 'normal',
          textDecoration: i18n.language.startsWith('fr') ? 'underline' : 'none',
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer'
        }}
      >
        FR
      </button>
      <span>|</span>
      <button 
        onClick={() => changeLanguage('en')}
        style={{ 
            fontWeight: i18n.language.startsWith('en') ? 'bold' : 'normal',
            textDecoration: i18n.language.startsWith('en') ? 'underline' : 'none',
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer'
          }}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
