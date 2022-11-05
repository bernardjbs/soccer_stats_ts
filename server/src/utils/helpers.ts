export const random = (min:number, max:number) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}


export const delay = (time: number) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

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




