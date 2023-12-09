// const cron = require('node-cron');
// const { addPunchForHoliday, addPunchWeekend } = require('../controller/punchController');
// const Holiday = require('../models/holidayModel');

// // Schedule run every day at midnight
// // const jobDaily = cron.schedule('0 0 * * *', async () => {
// //     const currentDate = new Date().setHours(0, 0, 0, 0);
// //     const isHoliday = await Holiday.exists({ holiday_date: new Date(currentDate) });
// //     console.log("🚀 ~ file: cronJobs.js:9 ~ jobDaily ~ isHoliday:", isHoliday)

// //     if (isHoliday) {
// //         // await addPunchForHoliday(currentDate);
// //         console.log('Holiday punches added successfully.');
// //     }
// // }, {
// //     timezone: 'Asia/Kolkata', 
// // });
// const jobDaily = cron.schedule('0 0 * * *', async () => {
//     const currentDateIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
//     const currentDate = new Date(currentDateIST).setHours(0, 0, 0, 0);

//     const isHoliday = await Holiday.exists({ holiday_date: new Date(currentDate) });
//     console.log("🚀 ~ file: cronJobs.js:9 ~ jobDaily ~ isHoliday:", isHoliday)

//     if (isHoliday) {
//         await addPunchForHoliday(currentDate);
//         console.log('Holiday punches added successfully.');
//     }
// }, {
//     timezone: 'Asia/Kolkata', 
// });


// // Schedule run every Sunday
// // const jobSunday = cron.schedule('0 0 * * 0', async () => {
// //     const currentDate = new Date().setHours(0, 0, 0, 0);
// //     await addPunchWeekend(currentDate);
// //     console.log('Weekend punches added successfully.');
// // }, {
// //     scheduled: true,
// //     timezone: 'Asia/Kolkata', 
// // });



// const jobSunday = cron.schedule('* * * * * *', async () => {
//     const currentDate = new Date().setHours(0, 0, 0, 0);
//     await addPunchWeekend(currentDate);
//     console.log('Weekend punches added successfully.');
// }, {
//     scheduled: true,
//     timezone: 'Asia/Kolkata', 
// });

// // Start both cron jobs
// jobDaily.start();
// jobSunday.start();
