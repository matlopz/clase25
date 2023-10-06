const express = require('express');
const HTTP_STATUS_CODE = require('../constants/error.constants');
const productsService = require('../services/productsService')
const cartsService = require('../services/cartsService')
const Usuarios = require('../models/Users.Model');
const passportCall = require('../utils/passport.call');
const { authToken } = require('../utils/jwt');

const router = express.Router();


router.get('/productos', async (req, res) => {
  return res.render('products')
})
 
router.get('/product', authToken, async (req, res) => {
    try {
      const email = req.user
      console.log('tiene esta variable:  ', email)
      if (email) {

        const user = await Usuarios.findById(email);
        console.log('tiene id de user: ', user)
        if (!user) {
          console.error('Usuario no encontrado');
          return res.status(404).json({ status: 'Error', error: 'Usuario no encontrado' });
        }
        const usuario = {
          name: user.name,
          id: user.id
        };
        console.log('que tiene usuerio', usuario)
        const cartId = user.cart[0].product.toString();
        console.log('que tiene cartId: ', cartId)

        if (!cartId) {
          console.error('El usuario no tiene un carrito válido');
          return res.status(400).json({ status: 'Error', error: 'Usuario sin carrito' });
        }
        const products = await productsService.getAllProducts({});
        res.json({ cartId, products, usuario });
      } else {
        res.status(401).json({ status: 'Error', error: 'No autorizado' });
      }
    } catch (err) {
      console.error('GET Products - Error:', err);
      res.status(401).json({ error: 'No autorizado' });
    }
  });

router.get('/carritos/:cid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartsService.getCartProducts(cid);
    cartRender = cart.products
    if (cart) {
      res.render('carts', { cartRender });
    } else {
      res.status(404).json({ error: 'Cart not found' });
    }
  } catch (err) {
    console.error('GET carts - Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/logout', async (req, res) => {
  res.destroy('connect.sid')
  console.log('desologuear al cliente: ', res.clearCookie('cookieDelProyecto'))
  res.redirect('/auth/login');

})

module.exports = router;
