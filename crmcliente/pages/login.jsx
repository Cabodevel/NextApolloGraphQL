import React, { useState } from 'react';
import Layout from '../components/Layout';
import Error from '../components/Error';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/router';

const AUTENTICAR_USUARIO = gql`
  mutation AutenticarUsuario($input: AutenticarInput) {
    autenticarUsuario(input: $input) {
      token
    }
  }
`;

const Login = () => {
  const [message, setMessage] = useState(null);
  const [autenticarUsuario] = useMutation(AUTENTICAR_USUARIO);
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('El email no es valido')
        .required('Email requerido'),
      password: Yup.string().required('El password es requerido'),
    }),
    onSubmit: async valores => {
      try {
        const { data } = await autenticarUsuario({
          variables: {
            input: {
              ...valores,
            },
          },
        });
        setMessage(`Login successful`);
        const { token } = data.autenticarUsuario;
        localStorage.setItem('token', token);
        router.push('/');
      } catch (error) {
        setMessage(error.message.replace('GraphQL error: ', ''));
      }
      setTimeout(() => setMessage(null), 3000);
    },
  });

  const mostrarMensaje = () => {
    return (
      <div className="bg-white py-2 px-3 w-full my-3 max-w-sm text-center mx-auto rounded-sm">
        <p>{message}</p>
      </div>
    );
  };

  return (
    <Layout>
      <h1 className="text-center text-2xl text-white font-light">Login</h1>
      {message && mostrarMensaje()}
      <div className="flex justify-center mt-5">
        <div className="w-full max-w-sm">
          <form
            className="bg-white rounded shadow-md px-8 pt-6 pb-6 mb-4"
            onSubmit={formik.handleSubmit}
          >
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
                placeholder="Email Usuario"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
            </div>
            {formik.errors.email ? (
              <Error message={formik.errors.email} />
            ) : null}
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type={'password'}
                placeholder="Password Usuario"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />
            </div>
            {formik.errors.password ? (
              <Error message={formik.errors.password} />
            ) : null}
            <input
              type="submit"
              className="bg-gray-800 w-full mt-5 p-2 text-white uppercase hover:bg-gray-900"
              value={'Iniciar Sesión'}
            />
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
