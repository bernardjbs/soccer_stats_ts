import Match from '../models/Match.js';

const resolvers = {
  Query: {
    match: async (parent: any, args: any, context: any) => {
      try {
        const match = await Match.findOne({ matchId: args.matchId });
        return match;
      } catch (error) {
        console.log(error);
      }
    },
    // matches: async () => {
    //   try {
    //     const matches = await Match.find();
    //     return matches;
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
  }, 
  Mutation: {
    createMatch: async (parent: any, args: any) => {
      try {
        const match = await Match.create(args);
        return match;
      } catch (error) {
        console.log(error)
      }
    }
  }
};

export default resolvers;
