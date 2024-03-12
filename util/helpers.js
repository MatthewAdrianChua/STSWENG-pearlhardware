export function formatPrice(price) {
    if (typeof price === 'number') {
        return price.toFixed(2);
    } else {
        return ''; // handle null/undefined values as needed
    }
}