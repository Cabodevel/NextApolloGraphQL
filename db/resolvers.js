const Usuario = require('../models/Usuario');
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

require('dotenv').config({path: 'variables.env'});

const crearToken = (user, secret, expiresIn) =>{
    
    const {id, email, nombre, apellido } = user;

    return jwt.sign({ id, email, nombre, apellido }, secret, { expiresIn });
}

const resolvers = {
    Query: {
        obtenerUsuario: async(_, {token}) => {
            const usuarioId = jwt.verify(token, process.env.SECRET);

            return usuarioId;
        }
    },
    Mutation: {
        nuevoUsuario: async (_, {input}) => {
            const {email, password} = input;

            const exists = await Usuario.findOne({email});
            console.log(exists);

            if(exists){
                throw new Error('El usuario ya está registrado')
            }

            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);

            try {
                const usuario = new Usuario(input);
                usuario.save();
                return usuario;
            } catch (error) {
                console.log(error)
            }

        },
        autenticarUsuario: async(_, {input}) => {
            const  {email, password } = input;
            
            const existeUsuario = await Usuario.findOne({email});

            if(!existeUsuario){
                throw new Error("El usuario no existe");
            }

            const passwordCorrecto = bcryptjs.compare(password, existeUsuario.password);

            if(!passwordCorrecto){
                throw new Error("Password incorrecto");
            }

            return {
                token: crearToken(existeUsuario, process.env.SECRET, '24h')
            }
        }
    }
}

module.exports = resolvers;