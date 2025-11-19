export {};
const now: Date = new Date();

const year: number = now.getFullYear();
const month: number = now.getMonth() + 1;
const day: number = now.getDate();
const hours: number = now.getHours();
const minutes: number = now.getMinutes();
const seconds: number = now.getSeconds();
const timezoneOffset: number = now.getTimezoneOffset();

console.log(
  `${year}.${month}.${day} ${hours}:${minutes}:${seconds} ${timezoneOffset}`
);
