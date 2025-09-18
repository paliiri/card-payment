import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { cardNumberValidator, cvvValidator, expiryDateValidator } from './validators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})


export class AppComponent {
  paymentForm: FormGroup;
  paymentStatus: string | null = null;
  isFlipped = false;

  constructor(private fb: FormBuilder) {
    this.paymentForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      cardNumber: ['', [Validators.required, cardNumberValidator]],
      expireDate: ['', [Validators.required, expiryDateValidator]],
      cvv: ['', [Validators.required, cvvValidator]],
    });
  }

  get firstName() { return this.paymentForm.get('firstName'); }
  get cardNumber() { return this.paymentForm.get('cardNumber'); }
  get expireDate() { return this.paymentForm.get('expireDate'); }
  get cvv() { return this.paymentForm.get('cvv'); }

  formatCardNumber(event: Event): void {
    let value = (event.target as HTMLInputElement).value.replace(/\D/g, ''); // Убираем все нецифровые символы
    // Если длина значения больше или равна 16, обрезаем лишние символы
    if (value.length > 16) value = value.slice(0, 16);
    value = value.replace(/(.{4})/g, '$1 ').trim(); // Добавляем пробелы каждые 4 цифры
    this.paymentForm.controls['cardNumber'].setValue(value, { emitEvent: false }); //Записываем отформатированное значение
  }

  formatExpiryDate(event: Event): void {
    // Приводим event.target к HTMLInputElement, чтобы получить доступ к value
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');// Убираем все нецифровые символы
    if (value.length > 4) value = value.slice(0, 4);   // Ограничиваем длину строки до 4 символов (мм/гг)
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);  // Форматируем строку, добавляя '/' после 2 символа
    this.paymentForm.controls['expireDate'].setValue(value, { emitEvent: false }); // Устанавливаем отформатированное значение в форму
  }

  formatCvv(event: Event): void {
    // Приводим event.target к HTMLInputElement, чтобы получить доступ к value
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Убираем все нецифровые символы
    // Ограничиваем длину строки до 4 символов (CVV состоит из 3 цифр)
    if (value.length > 4) value = value.slice(0, 4);
    // Устанавливаем отформатированное значение в форму
    this.paymentForm.controls['cvv'].setValue(value, { emitEvent: false });
  }

  //Поворот карты
  flipCard(flip: boolean) {
    this.isFlipped = flip;
  }

  maskCardNumber(num: string | null): string {
    if (!num) return '**** **** **** ****';
    let clean = num.replace(/\D/g, '');
    // пока номер неполный → показываем как есть
    if (clean.length < 16) return clean.padEnd(16, '*').replace(/(.{4})/g, '$1 ').trim();
    // когда все 16 цифр → маскируем середину
    return `${clean.substring(0, 4)} **** **** ${clean.substring(12)}`;
  }

  getCardType(): string {
    const number = (this.cardNumber?.value || '').replace(/\s/g, '');
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^220[0-4]/.test(number)) return 'mir';
    return 'default';
  }

  submitPayment(): void {
    if (this.paymentForm.invalid) {
      this.paymentStatus = 'Error';
      return;
    }
    this.paymentStatus = 'Loading order...';
    setTimeout(() => {
      const success = Math.random() > 0.3;
      this.paymentStatus = success ? 'Success order' : 'Error';
      this.paymentForm.reset();
    }, 2000);
  }

  getErrorMessage(): string {
    const controls = [this.firstName, this.cardNumber, this.expireDate, this.cvv];

    for (const control of controls) {
      if (control && control.touched && control.errors) {
        if (control === this.firstName) {
          if (control.errors['required']) return 'Please enter cardholder name';
          if (control.errors['minlength']) return 'Name must be at least 2 characters';
        }
        if (control === this.cardNumber) {
          if (control.errors['required']) return 'Please enter card number';
          if (control.errors['length']) return 'Please enter a 16-digit card number';
          if (control.errors['luhn']) return 'Invalid card number';
        }
        if (control === this.expireDate) {
          if (control.errors['required']) return 'Please enter expiry date';
          if (control.errors['format']) return 'Invalid date format (MM/YY)';
          if (control.errors['month']) return 'Please enter a valid month (01-12)';
          if (control.errors['expired']) return 'Card has expired';
        }
        if (control === this.cvv) {
          if (control.errors['required']) return 'Please enter CVV';
          if (control.errors['cvv']) return 'CVV should be 3 or 4 digits long';
        }
      }
    }

    return '';
  }

  // getErrorMessage(): string {
  //   // Список полей с ошибками
  //   const controls = [this.firstName, this.cardNumber, this.expireDate, this.cvv];

  //   for (const control of controls) {
  //     // Показываем ошибку только если поле тронуто
  //     if (control && control.touched && control.errors) {
  //       if (control === this.firstName) {
  //         if (control.errors['required']) return 'Введите имя владельца карты';
  //         if (control.errors['minlength']) return 'Имя должно содержать минимум 2 символа';
  //       }
  //       if (control === this.cardNumber) {
  //         if (control.errors['required']) return 'Введите номер карты';
  //         if (control.errors['length']) return 'Номер карты должен содержать 16 цифр';
  //         if (control.errors['luhn']) return 'Неверный номер карты';
  //       }
  //       if (control === this.expireDate) {
  //         if (control.errors['required']) return 'Введите срок действия карты';
  //         if (control.errors['format']) return 'Неверный формат даты (MM/YY)';
  //         if (control.errors['month']) return 'Месяц должен быть от 01 до 12';
  //         if (control.errors['expired']) return 'Срок действия карты истёк';
  //       }
  //       if (control === this.cvv) {
  //         if (control.errors['required']) return 'Введите CVV код';
  //         if (control.errors['cvv']) return 'CVV должен состоять из 3 или 4 цифр';
  //       }
  //     }
  //   }

  //   // Если ошибок нет — пусто
  //   return '';
  // }



  // submitPayment() {
  //   if (this.paymentForm.invalid) {
  //     this.paymentStatus = 'Ошибка: форма заполнена неверно';
  //     return;
  //   }
  //   this.paymentStatus = 'Загрузка...';
  //   setTimeout(() => {
  //     const success = Math.random() > 0.3;
  //     this.paymentStatus = success ? 'Заказ успешно оформлен!' : 'Ошибка при оплате';
  //     this.paymentForm.reset();
  //   }, 2000);
  // }
}
