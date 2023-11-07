module.exports = {
  // host: "smtp.gmail.com",
  //   port: 465,
    service: "gmail",
    auth:{
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD
    }
};
