const UsuarioDAO = require('../dao/usuarioDao');
const { comparePassword } = require('../utils/bcrypts'); 
const { generateToken } = require('../utils/jwt');
async function validateUser({email, password}) {
  try {
    
    
    const user = await UsuarioDAO.getUserEmail(email);
    const validPassword = comparePassword(password, user.password);

    if (!user || !validPassword) {
        throw new Error('Credenciales inválidas');
      }

        // Genera el token
        const token = generateToken(user._id);
        console.log('que tiene token:',token)
    return { user, token };
  } catch (error) {
    throw new Error('Error al buscar el usuario por correo electrónico o credenciales inválidas');
  }
}

module.exports = {
    validateUser
};



   
