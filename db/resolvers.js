const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

require('dotenv').config({path: 'variables.env'});

const crearToken = (user, secret, expiresIn) =>{
    
    const {id, email, nombre, apellido } = user;

    return jwt.sign({ id, email, nombre, apellido }, secret, { expiresIn });
}

const resolvers = {
    Query: {
        obtenerUsuario: async (_, {token}) => {
            const usuarioId = jwt.verify(token, process.env.SECRET);

            return usuarioId;
        },
        obtenerProductos: async () => {
            try {
                const productos = await Producto.find({});

                return productos;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerProducto: async(_, {id}) => {
            const producto = await Producto.findById(id);

            if(!producto){
                throw new Error("El producto no existe")
            }

            return producto;
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
        },
        nuevoProducto: async(_, {input}) => {
            try{
                const producto = new Producto(input);

                const result = await producto.save();

                return result;
            }catch(error){
                console.log(error)
            }
        },
        actualizarProducto: async (_, {id, input}) => {
            let producto = await Producto.findById(id);
            
            if(!producto){
                throw new Error("El producto no existe")
            }

            producto = await Producto.findOneAndUpdate({_id: id}, input, { new: true });

            return producto;
        },
        eliminarProducto: async (_, {id}) => {
            let producto = await Producto.findById(id);
            
            if(!producto){
                throw new Error("El producto no existe")
            }

            await Producto.findByIdAndDelete({_id: id});

            return "Producto eliminado";
        },
        nuevoCliente: async (_, { input }, context) => {
            const { email } = input;

            const cliente = Cliente.findOne(email);

            if(cliente){
                throw new Error("El cliente ya existe");
            }

            const nuevoCliente = new Cliente(input);

            nuevoCliente.vendedor = context.usuario.id;

            try {
                const result = await nuevoCliente.save();
    
                return result;
            } catch (error) {
                console.log(error);
            }

           
        }
    }
}

module.exports = resolvers;