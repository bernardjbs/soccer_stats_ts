import util from 'util';

export const random = (min:number, max:number) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const delay = (time: number) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

export const toSqlDateFormat = (isoDate: Date) => {
 const date = new Date(isoDate);
 const year = date.getUTCFullYear();
 const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
 const day = date.getUTCDate().toString().padStart(2, '0');
 const hours = date.getUTCHours().toString().padStart(2, '0');
 const minutes = date.getUTCMinutes().toString().padStart(2, '0');
 const seconds = date.getUTCSeconds().toString().padStart(2, '0');
 return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const strToDateTime = (str: string, dateSeparator: string, timeSeparator: string) => {
  const [dateComponents, timeComponents] = str.split(' ');
  const [day, month, year] = dateComponents.split(dateSeparator);
  if (timeSeparator == '') {
    return new Date(+year, parseInt(month) - 1, +day);
  } else {
    const [hours, minutes] = timeComponents.split(timeSeparator);
    return new Date(+year, parseInt(month) - 1, +day, +hours, +minutes);
  }
};

export const dateToStr = (dateVal: Date) => {
  return new Date(dateVal).toLocaleDateString('en-GB', {
    weekday: 'short', // long, short, narrow
    day: 'numeric', // numeric, 2-digit
    year: 'numeric', // numeric, 2-digit
    month: 'long', // numeric, 2-digit, long, short, narrow
    hour: 'numeric', // numeric, 2-digit
    minute: 'numeric' // numeric, 2-digit
  });
};

export const jsonConsole = (object: {}, depth: number) => {
  return console.log(util.inspect(object, { colors: true, depth: depth }));
};