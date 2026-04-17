import { useSelector } from 'react-redux';
import { translateKey } from './translations';

export const useTranslation = () => {
  const language = useSelector(state => state.settings.language || 'ru');

  const t = (key, fallback) => translateKey(language, key, fallback);

  return { language, t };
};
