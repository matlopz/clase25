const cartService = require('../services/cartsService');
const UsuarioDAO = require('../dao/usuarioDao');
const Usuarios = require('../models/Users.Model');
const { comparePassword,getHashedPassword } = require('../utils/bcrypts');
const { generateToken } = require('../utils/jwt');

async function validarEmail({ email }) {
  try {
    const user = await UsuarioDAO.getUserEmail(email);
    if (user) {
      console.log('el usuario ya existe')
      return done(null, false)
    }

  } catch (error) {
    throw new Error('Error al buscar el usuario por correo electrónico ');
  }
}
async function createUser(name, lastname, email, age, password) {
  try {
    if (!name || !email || !password) {
      throw new Error('Faltan datos obligatorios');
    }
    const hashedPassword = getHashedPassword(password);

    const newUser = await Usuarios.create({
      name,
      lastname,
      email,
      age,
      password: hashedPassword, 
      cart: [], 
    });
    const cart = await cartService.createCart({ products: [] });
    newUser.cart.push({ product: cart._id, quantity: 0 });
    await newUser.save();
  } catch (error) {

    console.error('Error al crear el usuario:', error);
  }
}

async function validateUser({ email, password }) {
  try {

    const user = await UsuarioDAO.getUserEmail(email);
    console.log('tiene user',user)
    const validPassword = comparePassword(password, user.password);

    if (!user || !validPassword) {
      throw new Error('Credenciales inválidas');
    }

    
    const token = generateToken(user._id);
    console.log('que tiene token:', token)
    return { user, token };
  } catch (error) {
    throw new Error('Error al buscar el usuario por correo electrónico o credenciales inválidas');
  }
}

module.exports = {
  validateUser,
  validarEmail,
  createUser
};




