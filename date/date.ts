// export {};
// const now: Date = new Date();

// const year: number = now.getFullYear();
// const month: number = now.getMonth() + 1;
// const day: number = now.getDate();
// const hours: number = now.getHours();
// const minutes: number = now.getMinutes();
// const seconds: number = now.getSeconds();
// const timezoneOffset: number = now.getTimezoneOffset();

// console.log(
//   `${year}.${month}.${day} ${hours}:${minutes}:${seconds} ${timezoneOffset}`
// );
//chỉ khi cần nhiều kiểu hoặc cần ràng buộc rõ ràng

export {};

const now = new Date();

const year = now.getFullYear();
const month = now.getMonth() + 1;
const day = now.getDate();

const hours = now.getHours();
const minutes = now.getMinutes();
const seconds = now.getSeconds();

const timezoneOffset = now.getTimezoneOffset();

console.log(
  `${year}.${month}.${day} ${hours}:${minutes}:${seconds} ${timezoneOffset}`
);
