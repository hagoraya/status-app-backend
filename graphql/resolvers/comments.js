const { AuthenticationError, UserInputError } = require('apollo-server')
const Post = require('../../models/Post')

const checkAuth = require('../../util/checkAuth')

module.exports = {
    Mutation: {
        //Did this in different function types to see if it'll work with both arrow function and normal function
        createComment: async (_, { postId, body }, context) => {
            const { username } = checkAuth(context);
            if (body.trim() === '') {
                throw new UserInputError('Empty comment', {
                    errors: {
                        body: 'Comment cannot be empty'
                    }
                })
            }

            const post = await Post.findById(postId);

            if (post) {
                post.comments.unshift({
                    body,
                    username,
                    createdAt: new Date().toISOString()
                });

                await post.save();
                return post;
            } else {
                throw new UserInputError('Post not found')
            }
        },

        async deleteComment(_, { postId, commentId }, context) {
            const { username } = checkAuth(context);

            const post = await Post.findById(postId);

            if (post) {
                const commentIndex = post.comments.findIndex(c => c.id === commentId);

                if (post.comments[commentIndex].username === username) {
                    //Owner of comment
                    post.comments.splice(commentIndex, 1);
                    await post.save();
                    return post;
                } else {
                    throw new AuthenticationError('Action not allowed')
                }
            } else {
                new UserInputError('Post not found')
            }
        }
    }
}
