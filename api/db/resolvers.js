const Usuario = require("../models/Usuario");
const Producto = require("../models/Producto");
const Cliente = require("../models/Cliente");
const Pedido = require("../models/Pedido");

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config({ path: "variables.env" });

const crearToken = (user, secret, expiresIn) => {
  const { id, email, nombre, apellido } = user;

  return jwt.sign({ id, email, nombre, apellido }, secret, { expiresIn });
};

const resolvers = {
  Query: {
    obtenerUsuario: async (_, {}, context) => {
      return context.user;
    },
    obtenerProductos: async () => {
      try {
        const productos = await Producto.find({});

        return productos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerProducto: async (_, { id }) => {
      const producto = await Producto.findById(id);

      if (!producto) {
        throw new Error("El producto no existe");
      }

      return producto;
    },
    obtenerClientes: async () => {
      try {
        const clientes = Cliente.find({});

        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerClientesVendedor: async (_, {}, ctx) => {
      try {
        const clientes = Cliente.find({ vendedor: ctx.user.id });

        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerCliente: async (_, { id }, context) => {
      const cliente = await Cliente.findById(id);

      if (!cliente) {
        throw new Error("Cliente no encontrado");
      }

      if (cliente.vendedor.toString() !== context.user.id) {
        throw new Error("Acceso no autorizado");
      }

      return cliente;
    },
    obtenerPedidos: async () => {
      try {
        const pedidos = await Pedido.find({});

        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidosVendedor: async (_, {}, context) => {
      try {
        const pedidos = await Pedido.find({ vendedor: context.user.id });

        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedido: async (_, { id }, context) => {
      try {
        const pedido = await Pedido.findById(id);

        if (!pedido) {
          throw new Error("Pedido no encotrado");
        }

        if (pedido.vendedor.toString() !== context.user.id) {
          throw new Error("Acceso no autorizado");
        }

        return pedido;
      } catch (error) {}
    },
    obtenerPedidosEstado: async (_, { estado }, context) => {
      const pedidos = await Pedido.find({ vendedor: context.user.id, estado });

      return pedidos;
    },
    mejoresClientes: async () => {
      const clientes = await Pedido.aggregate([
        { $match: { estado: "COMPLETADO" } },
        {
          $group: {
            _id: "$cliente",
            total: { $sum: "total" },
          },
        },
        {
          $lookup: {
            from: "cliente",
            localField: "_id",
            foreignField: "_id",
            as: "cliente",
          },
        },
        {
          $limit: 10,
        },
        {
          $sort: { total: -1 },
        },
      ]);

      return clientes;
    },
    mejoresVendedores: async () => {
      const vendedores = await Pedido.aggregate([
        { $match: { estado: "COMPLETADO" } },
        {
          $group: {
            _id: "$vendedor",
            total: { $sum: "total" },
          },
        },
        {
          $lookup: {
            from: "usuarios",
            localField: "_id",
            foreignField: "_id",
            as: "usuarios",
          },
        },
        {
          $limit: 3,
        },
        {
          $sort: { total: -1 },
        },
      ]);

      return clientes;
    },
    buscarProducto: async (_, { texto }) => {
      const productos = await Producto.find({ $text: { $search: texto } });

      return productos;
    },
  },
  Mutation: {
    nuevoUsuario: async (_, { input }) => {
      const { email, password } = input;

      const exists = await Usuario.findOne({ email });
      console.log(exists);

      if (exists) {
        throw new Error("El usuario ya está registrado");
      }

      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);

      try {
        const usuario = new Usuario(input);
        usuario.save();
        return usuario;
      } catch (error) {
        console.log(error);
      }
    },
    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;

      const existeUsuario = await Usuario.findOne({ email });

      if (!existeUsuario) {
        throw new Error("El usuario no existe");
      }

      const passwordCorrecto = await bcryptjs.compare(
        password,
        existeUsuario.password
      );

      if (!passwordCorrecto) {
        throw new Error("Password incorrecto");
      }

      return {
        token: crearToken(existeUsuario, process.env.SECRET, "24h"),
      };
    },
    nuevoProducto: async (_, { input }) => {
      try {
        const producto = new Producto(input);

        const result = await producto.save();

        return result;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarProducto: async (_, { id, input }) => {
      let producto = await Producto.findById(id);

      if (!producto) {
        throw new Error("El producto no existe");
      }

      producto = await Producto.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      return producto;
    },
    eliminarProducto: async (_, { id }) => {
      let producto = await Producto.findById(id);

      if (!producto) {
        throw new Error("El producto no existe");
      }

      await Producto.findByIdAndDelete({ _id: id });

      return "Producto eliminado";
    },
    nuevoCliente: async (_, { input }, context) => {
      const { email } = input;

      const cliente = await Cliente.findOne({ email });
      if (cliente) {
        throw new Error("El cliente ya existe");
      }

      const nuevoCliente = new Cliente(input);

      nuevoCliente.vendedor = context.user.id;

      try {
        const result = await nuevoCliente.save();

        return result;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarCliente: async (_, { id, input }, context) => {
      let cliente = await Cliente.findById(id);

      if (!cliente) {
        throw new Error("Cliente no existe");
      }

      if (cliente.vendedor.toString() !== context.user.id) {
        throw new Error("Acceso no autorizado");
      }

      cliente = await Cliente.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      return cliente;
    },
    eliminarCliente: async (_, { id }, context) => {
      let cliente = await Cliente.findById(id);

      if (!cliente) {
        throw new Error("Cliente no existe");
      }

      if (cliente.vendedor.toString() !== context.user.id) {
        throw new Error("Acceso no autorizado");
      }

      await Cliente.findOneAndDelete({ _id: id });

      return "Cliente eliminado";
    },
    nuevoPedido: async (_, { input }, context) => {
      const { cliente } = input;

      let clienteExiste = await Cliente.findById(cliente);

      if (!clienteExiste) {
        throw new Error("Cliente no existe");
      }

      if (clienteExiste.vendedor.toString() !== context.user.id) {
        throw new Error("Acceso no autorizado");
      }

      for await (const articulo of input.pedido) {
        const { id } = articulo;
        const producto = await Producto.findById(id);

        if (articulo.cantidad > producto.existencia) {
          throw new Error("No hay stock del articulo");
        } else {
          producto.existencia -= articulo.cantidad;
          await producto.save();
        }
      }

      const nuevoPedido = new Pedido(input);

      nuevoPedido.vendedor = context.user.id;

      const result = await nuevoPedido.save();

      return result;
    },
    actualizarPedido: async (_, { id, input }, context) => {
      const { cliente } = input;

      let existePedido = await Pedido.findById(id);

      if (!existePedido) {
        throw new Error("Pedido no existe");
      }

      let clienteExiste = await Cliente.findById(cliente);

      if (!clienteExiste) {
        throw new Error("Cliente no existe");
      }

      if (clienteExiste.vendedor.toString() !== context.user.id) {
        throw new Error("Acceso no autorizado");
      }

      for await (const articulo of input.pedido) {
        const { id } = articulo;
        const producto = await Producto.findById(id);

        if (articulo.cantidad > producto.existencia) {
          throw new Error("No hay stock del articulo");
        } else {
          producto.existencia -= articulo.cantidad;
          await producto.save();
        }
      }

      const result = await pedido.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      return result;
    },
    eliminarPedido: async (_, { id }, context) => {
      let pedido = await Pedido.findById(id);

      if (!pedido) {
        throw new Error("Cliente no existe");
      }

      if (pedido.vendedor.toString() !== context.user.id) {
        throw new Error("Acceso no autorizado");
      }

      await Pedido.findOneAndDelete({ _id: id });

      return "Pedido eliminado";
    },
  },
};

module.exports = resolvers;
