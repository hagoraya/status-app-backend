const { ApolloServer, PubSub } = require('apollo-server');
const mongoose = require('mongoose')

const { MONGODB } = require('./config')


const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers/index')

const PORT = process.env.PORT || 5000;

const pubsub = new PubSub();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub })
})

//Connect to mongodb
mongoose
    .connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        return server.listen({ port: PORT })
            .then(res => {
                console.log(`✅ MongoDB Connected \n✅ GrapghQL server started on ${res.url} `)
            })
    })
    .catch(err => {
        console.error(err)
    })
