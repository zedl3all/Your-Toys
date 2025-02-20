function updateAmount(productId, change) {
            const amountElement = document.getElementById(`amount-${productId}`);
            let currentAmount = parseInt(amountElement.value);
            currentAmount += change;
            if (currentAmount < 0) {
                currentAmount = 0;
            }
            amountElement.value = currentAmount;
        }

        function updateAmountDirectly(productId) {
            const amountElement = document.getElementById(`amount-${productId}`);
            let currentAmount = parseInt(amountElement.value);
            if (currentAmount < 0) {
                currentAmount = 0;
                amountElement.value = currentAmount;
            }
        }