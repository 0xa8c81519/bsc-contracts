let dDay = new Date();
dDay.setFullYear(2021, 4, 3); // May 3th 2020
dDay.setHours(10);
console.log(dDay);
let now = new Date();
let blocks = Math.floor((Math.floor(dDay.getTime() / 1000) - Math.floor(now.getTime() / 1000)) / 3);
console.log(blocks);