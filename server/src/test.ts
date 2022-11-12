const date: Date = new Date();
console.log(date.toLocaleDateString('en-GB', {
    weekday: 'short', // long, short, narrow
    day: 'numeric', // numeric, 2-digit
    year: 'numeric', // numeric, 2-digit
    month: 'long', // numeric, 2-digit, long, short, narrow
    hour: 'numeric', // numeric, 2-digit
    minute: 'numeric' // numeric, 2-digit
  }));

  // const strDate = dateVal.toLocaleString('en-GB', {
  //   weekday: 'short', // long, short, narrow
  //   day: 'numeric', // numeric, 2-digit
  //   year: 'numeric', // numeric, 2-digit
  //   month: 'long', // numeric, 2-digit, long, short, narrow
  //   hour: 'numeric', // numeric, 2-digit
  //   minute: 'numeric' // numeric, 2-digit
  // });
