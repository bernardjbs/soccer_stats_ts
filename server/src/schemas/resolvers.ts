import Match from '../models/Match.js';

const resolvers = {
  Query: {
    match: async (parent: any, args: any, context: any) => {
      console.log('i am here');
      try {
        const match = await Match.findOne({ matchId: args.matchId });
        console.log(args.matchId)
        return match;
      } catch (error) {
        console.log(error);
      }
    },
    matches: async () => {
      try {
        const matches = await Match.find();
        return matches;
      } catch (error) {
        console.log(error);
      }
    }
  }
};

export default resolvers;
