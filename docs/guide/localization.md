# Localization

## Built-in locales

| ID | Language |
|----|----------|
| `sk` | Slovak (default) |
| `en` | English |
| `cs` | Czech |
| `de` | German |

```ts
const dp = new Datepicker('#dp', { locale: 'en' });
```

## Switching locale at runtime

```ts
dp.setLocale('de');
await dp.refresh(); // re-renders the open calendar
```

## Custom locale

```ts
import { Datepicker } from '@tito10047/vanilla-js-datepicker';

Datepicker.registerLocale('fr', {
  monthsLong: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  monthsShort: ['Jan','Fév','Mar','Avr','Mai','Jui','Juil','Aoû','Sep','Oct','Nov','Déc'],
  weekdays: ['Di','Lu','Ma','Me','Je','Ve','Sa'],
  weekStart: 1,
  title: 'Choisissez une date',
  prevMonthLabel: 'Mois précédent',
  nextMonthLabel: 'Mois suivant',
  monthPickerLabel: 'Sélectionner le mois',
  yearPickerLabel: 'Sélectionner l\'année',
  todayLabel: 'Aujourd\'hui',
  clearLabel: 'Effacer',
  confirmLabel: 'OK',
  cancelLabel: 'Annuler',
  weekNumberLabel: 'Semaine',
});

const dp = new Datepicker('#dp', { locale: 'fr' });
```

## LocaleConfig type

```ts
interface LocaleConfig {
  monthsLong: string[];      // 12 items
  monthsShort: string[];     // 12 items
  weekdays: string[];        // 7 items, starting from Sunday
  weekStart: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  prevMonthLabel: string;
  nextMonthLabel: string;
  monthPickerLabel: string;
  yearPickerLabel: string;
  todayLabel: string;
  clearLabel: string;
  confirmLabel: string;
  cancelLabel: string;
  weekNumberLabel: string;
}
```
