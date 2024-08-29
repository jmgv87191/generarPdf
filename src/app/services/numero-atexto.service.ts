import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NumeroATextoService {

  private unidades = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  private especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  private decenas = ['veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  private centenas = ['cien', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  constructor() { }

  numeroATexto(num: number): string {
    if (num < 10) {
      return this.unidades[num];
    } else if (num >= 10 && num < 20) {
      return this.especiales[num - 10];
    } else if (num >= 20 && num < 100) {
      const unidad = num % 10;
      const decena = Math.floor(num / 10);
      return unidad === 0 ? this.decenas[decena - 2] : `${this.decenas[decena - 2]} y ${this.unidades[unidad]}`;
    } else if (num >= 100 && num < 1000) {
      const centena = Math.floor(num / 100);
      const resto = num % 100;
      if (resto === 0) {
        return this.centenas[centena - 1];
      } else if (centena === 1 && resto > 0) {
        return `ciento ${this.numeroATexto(resto)}`;
      } else {
        return `${this.centenas[centena - 1]} ${this.numeroATexto(resto)}`;
      }
    } else if (num === 1000) {
      return 'mil';
    }

    return 'Número fuera de rango';
  }
}
