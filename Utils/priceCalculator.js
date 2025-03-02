function calculatePrice(basePrice, x, y, quantity) {
    x = parseFloat(x);
    y = parseFloat(y);
    quantity = parseInt(quantity) || 1;
    basePrice = parseFloat(basePrice);

    if (isNaN(x) || isNaN(y) || x <= 0 || y <= 0 || isNaN(basePrice)) {
        console.log("Invalid input values, using defaults");
        x = 1;
        y = 1;
    }

    // Calculate ratio outside conditionals for cleaner code
    const ratio = Math.max(x, y) / Math.min(x, y);
    
    let unitPrice;
    if (Math.abs(x - y) < 0.001) {
        unitPrice = basePrice * x;
    } else if (ratio > 5) {
        unitPrice = basePrice * ((x + y) / 2);
    } else if (ratio > 2) {
        unitPrice = basePrice * Math.max(x, y);
    } else {
        unitPrice = basePrice * (x * y);
    }

    // Multiply by quantity for final price
    const totalPrice = unitPrice * quantity;
    
    return {
        unitPrice: unitPrice,
        totalPrice: totalPrice
    };
}

// For use in Node.js (server-side)
if (typeof module !== 'undefined') {
    module.exports = { calculatePrice };
}

// For use in browser (client-side)
if (typeof window !== 'undefined') {
    window.calculatePrice = calculatePrice;
}