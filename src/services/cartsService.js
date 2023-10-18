const cartDao = require('../dao/cartDao'); 
const productsService = require('./productsService'); 
const HTTP_STATUS_CODE = require('../constants/error.constants'); 

const cartsService = {
  async getAllCarts() {
    return cartDao.getAllCarts();
  },

  async createCart() {
    return cartDao.createCart();
  },

  async getCartProducts(cartId) {
    try {
   
      if (!cartId || cartId === 'null') {
        throw new Error('El cartId es nulo o no válido');
      }
  
      return await cartDao.getCartById(cartId.toString());
    } catch (error) {
      console.error('error:', error);
      throw new Error('Error obtener carrito');
    }
  },
  async addProductToCart(cartId, productId) {
    try {
      // Verifica si el producto existe antes de continuar
      const product = await productsService.getProductById(productId);

      if (!product) {
        return { error: 'El producto no existe', statusCode: HTTP_STATUS_CODE.NOT_FOUND };
      }

      const cart = await cartDao.getCartById(cartId);
      
      if (!cart) {
        return { error: 'El carrito no existe' };
      }

      const existingProduct = cart.products.find(item => item.product.equals(productId));
      
      if (existingProduct) {
        let quantity = existingProduct.quantity;
        quantity += 1;
        console.log('Si tiene un producto agregado')
        existingProduct.quantity = quantity;
      } else {
        cart.products.push({ product: productId, quantity: 1 });
        console.log('No tiene un producto agregado')
      }
      
      await cartDao.saveCart(cart);

      return {
        addedProduct: existingProduct || cart.products[cart.products.length - 1],
        isNewProduct: !existingProduct
      };
    } catch (error) {
      throw new Error('Error al agregar producto al carrito: ' + error.message);
    }
  },
};
module.exports = cartsService;
