import nodemailer from "nodemailer";
import ejs from "ejs";
import config from "../config";

export const sendEmail = async (
  to: string,
  template: string,
  subject: string,
  name: string,
  title?: string,
  order?: any // Added order parameter to capture full details
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, 
    auth: {
      user: "info@patty-bros.co.uk", 
      pass: "Admin4London@", 
    },
  });

  try {
    const html = await ejs.renderFile(
      __dirname + "/../static/email_template/" + template + ".ejs",
      {
        name: name,
        title: title,
        order: order, // Passed directly to EJS variables
      }
    );
    
    const mailOptions = {
      from: '"Patty Bro\'s" <info@patty-bros.co.uk>',
      to,
      subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};