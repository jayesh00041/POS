const FormData = require("form-data"); // form-data v4.0.1
const Mailgun = require("mailgun.js"); // mailgun.js v11.1.0

async function sendEmail(to, subject, text, html) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.API_KEY || "3d4b3a2a-0c6859d3",
    // When you have an EU-domain, you must specify the endpoint:
    url: "https://api.mailgun.net/v3"
  });
  try {
    const data = await mg.messages.create("sandbox390728d771654c3fb4492e26e605fe7d.mailgun.org", {
      from: "Mailgun Sandbox <postmaster@sandbox390728d771654c3fb4492e26e605fe7d.mailgun.org>",
      to,
      subject,
      text,
      html
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}

module.exports = sendEmail;