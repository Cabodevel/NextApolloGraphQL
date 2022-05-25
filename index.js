const { ApolloServer} = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: 'variables.env'});

const connectDb = require('./config/db');

connectDb();

const server = new ApolloServer({
    typeDefs,
    resolvers, 
    context: async ({req}) => {
        const token = req.header('authorization') || '';

        console.log(token)
        if(token){
            try {
                const user = await jwt.verify(token, process.env.SECRET);
              
                return {
                    user
                };
            } catch (error) {
                console.log(error)
            }
        }

    }
});

server.listen().then(({url}) => {
    console.log(`Server running on ${url}`)
})