import type { LocaleConfig } from '../core/types';
import { sk } from './locales/sk';
import { en } from './locales/en';
import { cs } from './locales/cs';
import { de } from './locales/de';

const builtIn: Record<string, LocaleConfig> = { sk, en, cs, de };
const custom: Record<string, LocaleConfig> = {};

export function registerLocale(name: string, config: LocaleConfig): void {
  custom[name] = config;
}

export function resolveLocale(locale: string | LocaleConfig | undefined): LocaleConfig {
  if (!locale) return sk;
  if (typeof locale !== 'string') return locale;
  return custom[locale] ?? builtIn[locale] ?? sk;
}
