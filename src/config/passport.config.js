const passport = require('passport')
const local = require('passport-local')
const GithubStrategy = require('passport-github2')
const jwt = require('passport-jwt')
const Usuarios = require('../models/Users.Model');
const { comparePassword, getHashedPassword } = require('../utils/bcrypts');
const cartsModels = require('../models/carts.Models');
const cookieExtractor = require('../utils/cookie.extractor');

const LocalStrategy = local.Strategy
const JWTStrategy = jwt.Strategy
const ExtractJwt = jwt.ExtractJwt

const initializedPassport = () => {
    passport.use('register', new LocalStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
          const { name, lastname, email, age } = req.body;
          try {
            const user = await Usuarios.findOne({ email: username })
            if (user) {
              console.log('el usuario ya existe')
              return done(null, false)
            }
            // Crear un carrito primero
            const cart = await cartsModels.create({ products: [] });
      
            // Luego, crea el nuevo usuario y asigna el ID del carrito
            const newUser = await Usuarios.create({
              name,
              lastname,
              email,
              age,
              password: getHashedPassword(password),
              cart: [{ product: cart._id, quantity: 0 }],
            });
      
            // Agrega el carrito al usuario
            newUser.cart.push({ product: cart._id, quantity: 0 });
            await newUser.save();
            done(null, newUser, newUser.cart[0].product);
          } catch (error) {
            done(`Error cuando creo el Usuario: ${error}`)
          }
        }
      ))
      
        passport.use('login', new LocalStrategy({usernameField:'email'}, 
        async(username,password,done)=>{
            try {
                const user = await Usuarios.findOne({email:username})
                if (!user) {
                    console.log('el usuario no exsiste')
                    return done(null, false)
                }
                if (!comparePassword(password, user.password)) {
                    return done(null, false)
                }
        
                return done(null, user)
            } catch (error) {
                done(error)
            }
        }))

        passport.use('github', new GithubStrategy({
            clientID:'Iv1.4d99ff6705843c98',
            clientSecret:'6fa5f6b1d62ec0bc20ef7e5d57e85ed4d658ffdf',
            callbackURL:'http://localhost:8080/auth/githubcallback',
        }, async (accessToken, refreshToken, profile, done)=>{
            try {
                console.log(profile)
                const user = await Usuarios.findOne({email: profile._json.email})
                if(!user){
                    const newUser = await Usuarios.create({
                        name:profile._json.name,
                        lastname:'',
                        email:profile._json.email,
                        password:'',
                        cart: [],
                    })
    
                    const cart = await cartsModels.create({ products: [] });
                    //const cartId = cart._id;
                    newUser.cart.push({ product: cart._id, quantity: 0 });
                    await newUser.save();
                    return done(null, newUser,newUser.cart._id)
                }
                done(null, user)
            } catch (error) {
                done(null,error)
            }
        }))

      /*  passport.use('jwt',
         new JWTStrategy({
            jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: 'mySecret',
        }, async (jwt_payload, done) => {
            try {
                done(null, jwt_payload)
            } catch (error) {
                done(error)
            }
        }))
        */
        passport.use('jwt', new JWTStrategy({
            jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
            secretOrKey: 'secreto',
          }, async (jwt_payload, done) => {
            try {
              const user = await Usuarios.findById(jwt_payload.user._id); 
              done(null, user);
            } catch (error) {
              done(error, false);
            }
          }));
          

        passport.serializeUser((user,done)=>{
            done(null, user._id)
        })

        passport.deserializeUser(async(id,done)=>{
            const user = await Usuarios.findById(id)
            done(null,user)
        })
}
module.exports = initializedPassport