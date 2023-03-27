// This file is where we define the query and mutation functionality to execute the data in our database.
// require AuthenticationError from apollo-server-express
const { AuthenticationError } = require("apollo-server-express");
// import the User model
const { User } = require("../models");
// require signToken from auth.js
const { signToken } = require("../utils/auth");
// define the resolvers
const resolvers = {
  // define the Query type
  Query: {
    // define the me query
    me: async (parent, args, context) => {
      // if there is a user on the context, execute the following code
      if (context.user) {
        // find the user in the database by their _id and return the user data minus the __v and password fields
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );

        return userData;
      }
      // if there is no user on the context, throw an AuthenticationError
      throw new AuthenticationError("Not logged in");
    },
  },
  // define the Mutation type
  Mutation: {
    // define the addUser mutation
    addUser: async (parent, args) => {
      // create a new user with the User model's create method
      const user = await User.create(args);
      // create a token for the new user with the signToken function
      const token = signToken(user);
      // return an Auth object that consists of the token and the user
      return { token, user };
    },
    // define the login mutation
    login: async (parent, { email, password }) => {
      // find a user in the database by their email
      const user = await User.findOne({ email });
      // if there is no user, throw an AuthenticationError
      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }
      // if there is a user, check their password with the isCorrectPassword instance method
      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }
      // if the password is correct, create a token for the user with the signToken function
      const token = signToken(user);
      // return an Auth object that consists of the token and the user
      return { token, user };
    },
    // define the saveBook mutation
    saveBook: async (parent, { bookData }, context) => {
        // if there is a user on the context, execute the following code
        if (context.user) {
            // find the user in the database by their _id
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                // add the book to the user's savedBooks array
                { $push: { savedBooks: bookData } },
                // return the updated user
                { new: true }
            );
            // return the updated user
            return updatedUser;
        }
        // if there is no user on the context, throw an AuthenticationError
        throw new AuthenticationError("You need to be logged in!");
    },
    // define the removeBook mutation
    removeBook: async (parent, { bookId }, context) => {
        // if there is a user on the context, execute the following code
        if (context.user) {
            // find the user in the database by their _id
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                // remove the book from the user's savedBooks array
                { $pull: { savedBooks: { bookId } } },
                // return the updated user
                { new: true }
            );
            // return the updated user
            return updatedUser;
        }
        // if there is no user on the context, throw an AuthenticationError
        throw new AuthenticationError("You need to be logged in!");
    }
  },
};
// export the resolvers
module.exports = resolvers;
