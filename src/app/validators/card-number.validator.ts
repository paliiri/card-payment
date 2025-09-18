import { AbstractControl, ValidationErrors } from '@angular/forms';

export function cardNumberValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;

  const num = control.value.replace(/\D/g, '');

  if (num.length !== 16) {
    return { length: true };
  }

  if (!luhnCheck(num)) {
    return { luhn: true };
  }

  return null;
}

function luhnCheck(num: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}
