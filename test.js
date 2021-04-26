let dDay = new Date();
dDay.setFullYear(2021, 4, 3); // May 3th 2020
dDay.setHours(10);
console.log(dDay);
let now = new Date();
let blocks = Math.floor((Math.floor(dDay.getTime() / 1000) - Math.floor(now.getTime() / 1000)) / 3);
console.log(blocks);

let arr=[
    '0x13B9d7375b134d0903f809505d41A6483c39F759',
    '0x4E9F49BE3feD5833C0A8e401fcbda76c38DA9b89',
    '0x9db99155182E5cccb03D267B56DC6E7867703c15',
    '0x75cCF9dF980A261D116abD660940FbBB5eD59e4E',
    '0x10299E238D238128119fB96705d669A20B09B114',
    '0xec0D02dd0ACBb3a7Ef22D5fA2Bd1d59985dAf2bF',
    '0x347702b59206D362bCb4694DB9fd8A07366fC32B',
    '0x3c09AAAb05371581730BED12D6372313d2B44ca7',
    '0xA04c97c1c00300CcfA230a1D1b4E8Dc241861A3e',
    '0x76EFD6e0A9322a7b9dCA70a1972453814A5687c4'
];

console.log(JSON.stringify(arr));