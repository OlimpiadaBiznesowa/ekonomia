/* The same calculations power the browser tools and the Node regression tests. */
(function (root) {
  'use strict';
  function number(value) {
    const text = String(value).trim().replace(',', '.');
    if (!/^-?\d+(?:\.\d+)?$/.test(text)) throw new Error('Wpisz poprawną liczbę. Możesz użyć przecinka lub kropki.');
    const result = Number(text);
    if (!Number.isFinite(result) || Math.abs(result) > 1e9) throw new Error('Wpisz liczbę nie większą niż 1 000 000 000.');
    if (result !== 0 && Math.abs(result) < 1e-9) throw new Error('Najmniejsza obsługiwana wartość niezerowa to 0,000000001.');
    return result;
  }
  function elasticity(values, method = 'midpoint') {
    if (!['midpoint', 'base'].includes(method)) throw new Error('Wybierz metodę obliczeń.');
    const [p1, p2, q1, q2] = values.map(number);
    if (p1 <= 0 || p2 <= 0) throw new Error('Obie ceny muszą być większe od zera.');
    if (q1 < 0 || q2 < 0) throw new Error('Wielkość popytu nie może być ujemna.');
    if (p1 === p2) throw new Error('Ceny są identyczne. Bez zmiany ceny nie można obliczyć elastyczności z tych danych.');
    const pBase = method === 'midpoint' ? (p1 + p2) / 2 : p1;
    const qBase = method === 'midpoint' ? (q1 + q2) / 2 : q1;
    if (!qBase) throw new Error(method === 'base' ? 'Metoda wartości początkowej wymaga początkowego popytu większego od zera.' : 'Przynajmniej jedna wielkość popytu musi być większa od zera.');
    const priceChange = (p2 - p1) / pBase;
    const quantityChange = (q2 - q1) / qBase;
    const signed = quantityChange / priceChange;
    const magnitude = Math.abs(signed);
    const kind = magnitude === 0 ? 'Doskonale nieelastyczny' : Math.abs(magnitude - 1) < 1e-9 ? 'Jednostkowo elastyczny' : magnitude < 1 ? 'Nieelastyczny' : 'Elastyczny';
    return {p1, p2, q1, q2, pBase, qBase, priceChange, quantityChange, signed, magnitude, kind, revenue1: p1 * q1, revenue2: p2 * q2};
  }
  function market({a, b, c, d, demandShift = 0, supplyShift = 0, price = 30}) {
    [a,b,c,d,demandShift,supplyShift,price].forEach(v => { if (!Number.isFinite(v)) throw new Error('Nieprawidłowe parametry rynku.'); });
    if (b <= 0 || d <= 0 || price < 0) throw new Error('Nachylenia muszą być dodatnie, a cena nieujemna.');
    const A = a + demandShift, C = c + supplyShift;
    const equilibriumPrice = (A - C) / (b + d);
    const equilibriumQuantity = A - b * equilibriumPrice;
    const feasible = equilibriumPrice >= 0 && equilibriumQuantity >= 0;
    const demand = Math.max(0, A - b * price), supply = Math.max(0, C + d * price);
    return {A, C, equilibriumPrice, equilibriumQuantity, feasible, demand, supply, gap: demand - supply};
  }
  const api = {number, elasticity, market};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EconomicToolsMath = api;
})(typeof window === 'undefined' ? {} : window);
