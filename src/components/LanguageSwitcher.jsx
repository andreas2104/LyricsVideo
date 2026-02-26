import { useTranslation } from 'react-i18next';
import { MdLanguage } from 'react-icons/md';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <MdLanguage size={20} className="lang-icon" />
      <button
        type="button"
        onClick={() => changeLanguage('fr')}
        className="lang-btn"
        style={{
          fontWeight: i18n.language.startsWith('fr') ? 'bold' : 'normal',
          textDecoration: i18n.language.startsWith('fr') ? 'underline' : 'none',
        }}
      >
        FR
      </button>
      <span className="lang-divider">|</span>
      <button
        type="button"
        onClick={() => changeLanguage('en')}
        className="lang-btn"
        style={{
          fontWeight: i18n.language.startsWith('en') ? 'bold' : 'normal',
          textDecoration: i18n.language.startsWith('en') ? 'underline' : 'none',
        }}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
