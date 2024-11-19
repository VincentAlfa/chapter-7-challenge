import nodemailer from 'nodemailer';

export function sendMail(email, message) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD,
    },
    port: 465,
    secure: true,
  });

  const mailOption = {
    from: 'vincentalfarieco@gmail.com',
    to: email,
    subject: 'Register Notification',
    html: message,
  };

  transporter.sendMail(mailOption, (err, info) => {
    if (err) {
      console.log(err);
    }

    console.log(info);
  });
}
