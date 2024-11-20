export function convertStringToDecimal(str: string, locale = 'pt-br') {
    return Number(str).toLocaleString(locale, { style: 'decimal' });
}

export function convertStringToCurrency(str: string, locale = 'pt-br', currency = 'BRL') {
    return Number(str).toLocaleString(locale, { style: 'currency', currency });
}

export function convertStringToDecimalFixed(str: string, size = 2) {
    return Number(str).toFixed(size);
}
