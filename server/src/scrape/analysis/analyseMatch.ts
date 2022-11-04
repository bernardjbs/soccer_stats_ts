import { ResultInterface } from '../../ts/interfaces';



// Calculate Average Goals 
const calcAvGoals = (matches: ResultInterface[]) => {
  let count = 0;
  let totalGoals: number = 0;
  matches.map(match => {
    const homeTeamScore:number = Number(match.homeTeamScore);
    const awayTeamScore:number = Number(match.homeTeamScore);
    totalGoals = totalGoals + (homeTeamScore + awayTeamScore);
    if (homeTeamScore + awayTeamScore > 2) {
      count = count + 1;
    }
  })
  return (totalGoals / matches.length);
}

export const analyseMatch = (matches: ResultInterface[]) => {
  const avGoals = calcAvGoals(matches);
  console.log(avGoals);
};