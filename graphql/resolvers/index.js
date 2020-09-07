//Combine all resolvers

const postResolver = require('./posts')
const usersResolver = require('./users')
const commentsResolver = require('./comments')

module.exports = {
    Post: {
        //Different ways of doing it
        likeCount(parent) {
            console.log(parent);
            return parent.likes.length;
        },
        commentCount: (parent) => parent.comments.length
    },

    Query: {
        ...postResolver.Query
    },

    Mutation: {
        ...usersResolver.Mutation,
        ...postResolver.Mutation,
        ...commentsResolver.Mutation,
    },
    Subscription: {
        ...postResolver.Subscription
    }
}