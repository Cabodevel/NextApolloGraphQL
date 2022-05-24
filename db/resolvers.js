const Usuario = require('../models/Usuario');
const bcryptjs = require("bcryptjs");

const resolvers = {
    Query: {
        obtenerCurso: () => "test"
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

        }
    }
}

module.exports = resolvers;