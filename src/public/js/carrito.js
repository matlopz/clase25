const showCarts = async () => {
    const cartsList = document.getElementById('cartsList');
    cartsList.innerHTML = '';

    const urlActual = window.location.href;
    const partesURL = urlActual.split('/');
    const cartId = partesURL[partesURL.length - 1];
    
    console.log('Valor deseado:', cartId);

}

showCarts();
