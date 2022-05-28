import React from 'react';
import Layout from '../../components/Layout';
import Error from '../../components/Error';
import { useRouter } from 'next/router';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';

const OBTENER_CLIENTE = gql`
  query Query($id: ID) {
    obtenerCliente(id: $id) {
      nombre
      apellido
      empresa
      email
      telefono
    }
  }
`;

const ACTUALIZAR_CLIENTE = gql`
  mutation ActualizarCliente($id: ID!, $input: ClienteInput) {
    actualizarCliente(id: $id, input: $input) {
      id
    }
  }
`;

const EditarCliente = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data, loading, error } = useQuery(
    OBTENER_CLIENTE,
    {
      variables: {
        id,
      },
    },
    {
      update(cache, { data: { nuevoCliente } }) {
        const { obtenerClientesVendedor } = cache.readQuery({
          query: OBTENER_CLIENTES_USUARIO,
        });

        cache.writeQuery({
          query: OBTENER_CLIENTES_USUARIO,
          data: {
            obtenerClientesVendedor: [...obtenerClientesVendedor, nuevoCliente],
          },
        });
      },
    }
  );

  const [actualizarCliente] = useMutation(ACTUALIZAR_CLIENTE);

  const validationSchema = Yup.object({
    nombre: Yup.string().required('El nombre es obligatorio'),
    apellido: Yup.string().required('El nombre es obligatorio'),
    empresa: Yup.string().required('El nombre es obligatorio'),
    email: Yup.string()
      .email('Email invalido')
      .required('El nombre es obligatorio'),
  });

  if (loading) return 'Cargando ...';

  const { obtenerCliente } = data;

  const updateClient = async values => {
    console.log(values);
    const { nombre, apellido, telefono, empresa, email } = values;

    await actualizarCliente({
      variables: {
        id,
        input: {
          nombre,
          apellido,
          empresa,
          telefono,
          email,
        },
      },
    });
    Swal.fire('Actualizado', 'Cliente actualizado', 'success');
    try {
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl text-gray-800 font-light">Editar Cliente</h1>
      <div className="flex justify-center mt-5">
        <div className="w-full max-w-lg">
          <Formik
            validationSchema={validationSchema}
            initialValues={obtenerCliente}
            onSubmit={values => {
              updateClient(values);
            }}
            enableReinitialize
          >
            {props => {
              return (
                <form
                  className="bg-white shadow-md px-8 pt-6 pb-8 mb-4"
                  onSubmit={props.handleSubmit}
                >
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="nombre"
                    >
                      Nombre
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="nombre"
                      type={'text'}
                      placeholder="Nombre cliente"
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      value={props.values.nombre}
                    />
                  </div>
                  {props.errors.nombre ? (
                    <Error message={props.errors.nombre} />
                  ) : null}
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="apellido"
                    >
                      Apellido
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="apellido"
                      type={'text'}
                      placeholder="Apellido cliente"
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      value={props.values.apellido}
                    />
                  </div>
                  {props.errors.apellido ? (
                    <Error message={props.errors.apellido} />
                  ) : null}
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="empresa"
                    >
                      Empresa
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="empresa"
                      type={'text'}
                      placeholder="Empresa cliente"
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      value={props.values.empresa}
                    />
                  </div>
                  {props.errors.empresa ? (
                    <Error message={props.errors.empresa} />
                  ) : null}
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="email"
                      type={'email'}
                      placeholder="Email cliente"
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      value={props.values.email}
                    />
                  </div>
                  {props.errors.email ? (
                    <Error message={props.errors.email} />
                  ) : null}
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="telefono"
                    >
                      Teléfono
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="telefono"
                      type={'tel'}
                      placeholder="Teléfono cliente"
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      value={props.values.telefono}
                    />
                  </div>
                  {props.errors.telefono ? (
                    <Error message={props.errors.telefono} />
                  ) : null}
                  <input
                    type={'submit'}
                    className="bg-gray-800 w-full mt-5 p-2 text-white uppercase font-bold hover:bg-gray-900"
                    value={'Editar cliente'}
                  />
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </Layout>
  );
};

export default EditarCliente;
