const { AuthenticationError, UserInputError } = require('apollo-server')

const Post = require('../../models/Post')
const checkAuth = require('../../util/checkAuth')

module.exports = {
    Query: {
        async getPosts() {
            try {
                const posts = await Post.find();
                return posts
            } catch (error) {
                throw new Error(error)
            }
        },

        async getPost(_, { postId }) {
            try {
                const post = await Post.findById(postId)
                if (post) {
                    return post
                }
                else {
                    throw new Error('Post not found');
                }
            } catch (error) {
                throw new Error(error)
            }
        }
    },


    Mutation: {
        //context contains our auth token
        async createPost(_, { body }, context) {
            const user = checkAuth(context);

            if (body.trim() === '') {
                throw new Error('Post body cannot be empty')
            }

            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            })

            const post = await newPost.save()

            context.pubsub.publish('NEW_POST', { newPost: post })

            return post
        },

        async deletePost(_, { postId }, context) {
            const user = checkAuth(context);

            try {
                //Check if postId is mongodb id format
                if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
                    throw new Error('Invalid ID');
                }
                const post = await Post.findById(postId);
                if (user.username === post.username) {
                    await post.delete();
                    return 'Post deleted successfully'
                } else {
                    throw new AuthenticationError('Action not allowed')
                }
            } catch (error) {
                throw new Error(error)
            }
        },

        async likePost(_, { postId }, context) {
            const { username } = checkAuth(context);

            const post = await Post.findById(postId);

            if (post) {
                if (post.likes.find((like) => like.username === username)) {
                    //Post already liked, unlike it (toggle)
                    post.likes = post.likes.filter((like) => like.username !== username);
                } else {
                    //Not liked, so like it
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    })

                }

                await post.save();
                return post;
            } else {
                throw new UserInputError('Post not found')
            }
        },

    },

    Subscription: {
        newPost: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
        }
    }

}