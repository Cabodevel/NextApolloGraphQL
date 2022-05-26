import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Error from '../components/Error'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation, gql } from '@apollo/client';

const NUEVA_CUENTA = gql`
    mutation NuevoUsuario($input: UsuarioInput) {
        nuevoUsuario(input: $input) {
            id
            nombre
            apellido
            email
            creado
        }
    }`

const NuevaCuenta = () => {

    const [mensaje, setMensaje] = useState(null)

    const [nuevoUsuario] = useMutation(NUEVA_CUENTA);

    const router = useRouter();

    const formik = useFormik({
        initialValues:{
            nombre: '',
            apellido: '',
            email: '',
            password: ''
        },
        validationSchema: Yup.object({
            nombre: Yup.string()
                        .required('El nombre es obligatorio'),
            apellido: Yup.string()
                            .required('El apellido es obligatorio'),
            email: Yup.string()
                        .email('El email no es válido')
                        .required('El email es obligatorio'),
            password: Yup.string()
                            .required('El password es obligatorio')
                            .min(6, "Al menos 6 caracteres"),
        }),
        onSubmit: async valores => {
           try {
               const { data } = await nuevoUsuario({
                   variables:{
                       input: {
                           ...valores
                       }
                   }
               });
               setMensaje(`Usuario ${data.nuevoUsuario.email} creado`);
               setTimeout(() => router.push("/login"), 1000);
           } catch (error) {
               setMensaje(error.message.replace('GraphQL error: ', ''));
           }
           setTimeout(( )=> setMensaje(null), 3000)
        }
    });

    const mostrarMensaje = () => {
        return (
            <div className='bg-white py-2 px-3 w-full my-3 max-w-sm text-center mx-auto rounded-sm'>
                <p>{mensaje}</p>
            </div>
        )
    }

    return ( 
        <Layout>
            {mensaje && mostrarMensaje()}
            <h1 className='text-center text-2xl text-white font-light'>Crear Nueva Cuenta</h1>
            <div className='flex justify-center mt-5'>
                <div className='w-full max-w-sm'>
                    <form
                        className='bg-white rounded shadow-md px-8 pt-6 pb-6 mb-4'
                        onSubmit={formik.handleSubmit}
                    >
                        <div className='mb-4'>
                            <label className='bloc text-gray-700 text-sm font-bold mb-2' htmlFor='nombre'>
                                Nombre
                            </label>
                            <input 
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' 
                                id="nombre"
                                type={"text"}
                                placeholder='Nombre Usuario'
                                value={formik.values.nombre}
                                onChange={formik.handleChange}
                            />
                        </div>
                        {formik.errors.nombre 
                            ? (<Error message={formik.errors.nombre} />)
                            : null }
                        <div className='mb-4'>
                            <label className='bloc text-gray-700 text-sm font-bold mb-2' htmlFor='apellido'>
                                Apellido
                            </label>
                            <input 
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' 
                                id="apellido"
                                type={"text"}
                                placeholder='Apellido Usuario'
                                value={formik.values.apellido}
                                onChange={formik.handleChange}
                            />
                        </div>
                        {formik.errors.apellido 
                            ? (<Error message={formik.errors.apellido} />)
                            : null }
                        <div className='mb-4'>
                            <label className='bloc text-gray-700 text-sm font-bold mb-2' htmlFor='email'>
                                Email
                            </label>
                            <input 
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' 
                                id="email"
                                type={"email"}
                                placeholder='Email Usuario'
                                value={formik.values.email}
                                onChange={formik.handleChange}
                            />
                        </div>
                        {formik.errors.email 
                            ? (<Error message={formik.errors.email} />)
                            : null }
                        <div className='mb-4'>
                            <label className='bloc text-gray-700 text-sm font-bold mb-2' htmlFor='password'>
                                Password
                            </label>
                            <input 
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' 
                                id="password"
                                type={"password"}
                                placeholder='Password Usuario'
                                value={formik.values.password}
                                onChange={formik.handleChange}
                            />
                        </div>
                        {formik.errors.password 
                            ? (<Error message={formik.errors.password} />)
                            : null }
                        <input 
                            type="submit" 
                            className='bg-gray-800 w-full mt-5 p-2 text-white uppercase hover:bg-gray-900'
                            value={"Crear Cuenta"}
                        />
                    </form>
                </div>
            </div>
        </Layout>
     );
}
 
export default NuevaCuenta;