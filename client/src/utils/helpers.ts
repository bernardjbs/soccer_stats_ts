export const dateToStr = (dateVal: Date) => {
  return new Date(dateVal).toLocaleDateString("en-GB", {
    weekday: "short", // long, short, narrow
    day: "numeric", // numeric, 2-digit
    year: "numeric", // numeric, 2-digit
    month: "short", // numeric, 2-digit, long, short, narrow
    hour: "numeric", // numeric, 2-digit
    minute: "numeric", // numeric, 2-digit
  });
};