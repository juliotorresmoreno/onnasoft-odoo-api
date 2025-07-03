export const languages = ['en', 'es'] as const;
export type Language = (typeof languages)[number];
export const defaultLanguage = 'es';

export function isValidLanguage(lang: Language): boolean {
  return languages.includes(lang);
}

export function getLanguageName(lang: string): string {
  switch (lang) {
    case 'en':
      return 'English';
    case 'es':
      return 'Español';
    default:
      return 'Unknown';
  }
}
