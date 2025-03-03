var productDetailModal = document.getElementById('productDetailModal');
productDetailModal.addEventListener('show.bs.modal', function (event) {
    var button = event.relatedTarget;
    var product = JSON.parse(button.getAttribute('data-product'));
    document.getElementById('modalProductImage').src = '/Asset/Product/' + (product.image || 'dummy.jpg');
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalProductDetail').textContent = product.detail || 'No details available';
    document.getElementById('modalProductPrice').textContent = product.price.toFixed(2);
    document.getElementById('modalProductSize').textContent = product.size || '1:1';
    document.getElementById('modalProductQuantity').textContent = product.quantity;
});