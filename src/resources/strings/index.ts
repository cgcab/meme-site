// import stringsFr from './strings.fr';
import stringsEn from './strings.en';
import { Language } from '../../apiTypes';
import { getLanguage } from '../../utils/language';

export let language: string = getLanguage();
export let stringsRes = stringsEn;
// export let stringsRes = language === Language.FR ? stringsFr : stringsEn;

export function setLanguage(newLanguage: Language): void {
    language = newLanguage;
    stringsRes = stringsEn;
    // stringsRes = language === Language.FR ? stringsFr : stringsEn;
}
