import { AbstractControl, ValidationErrors } from '@angular/forms';

export function expiryDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;

  // формат MM/YY
  const match = /^(\d{2})\/(\d{2})$/.exec(control.value);
  // если формат не MM/YY = ошибка 'format'
  if (!match) {
    return { format: true };
  }

  // проверка месяца
  const month = parseInt(match[1], 10);
  if (month < 1 || month > 12) {
    return { month: true };
  }

  // проверяем, не истёк ли срок действия карты
  // переводим YY в полный год
  const year = parseInt(match[2], 10);
  const fullYear = 2000 + year;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
    return { expired: true };
  }

  return null;
}
