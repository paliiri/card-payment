import { AbstractControl, ValidationErrors } from '@angular/forms';

export function cvvValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;

  const cvv = control.value.replace(/\D/g, '');

  // CVV должен быть 3 или 4 цифры
  if (!/^\d{3,4}$/.test(cvv)) {
    return { cvv: true };
  }

  return null;
}
