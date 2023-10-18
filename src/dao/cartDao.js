const Cart = require('../models/carts.Models');

const cartDao = {
  async getAllCarts() {
    try {
      const carts = await Cart.find();
      return carts;
    } catch (error) {
      throw new Error('Error fetching carts');
    }
  },

  async createCart() {
    try {
      const newCart = new Cart({ products: [] });
      await newCart.save();
      return newCart;
    } catch (error) {
      throw new Error('Error al crear el carrito');
    }
  },

  async getCartById(cartId) {
    try {
      const cart = await Cart.findById(cartId).populate('products.product');
      return cart;
    } catch (error) {
      throw new Error('Error fetching cart by ID');
    }
  },

  async saveCart(cart) {
    try {
      return await cart.save();
    } catch (error) {
      throw new Error('Error al guardar el carrito: ' + error.message);
    }
  },
};

module.exports = cartDao;
