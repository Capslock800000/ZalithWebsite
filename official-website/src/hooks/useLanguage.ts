import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  
  return {
    currentLanguage: i18n.language || 'zh',
    changeLanguage: (lang: string) => i18n.changeLanguage(lang),
  };
};
