const { contactUsEmail } = require("../mail/templates/contactFormRes");
const mailSender = require("../utils/mailSender")
require("dotenv")
exports.contactUs = async (req, res) => {
    try {
        // fetch the data
        const { firstName, lastName = "", email, contactNumber, message } = req.body;
        // validate the data
        if (!firstName || !email || !contactNumber || !message) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Please fill all the fields."
                });
        }

        // send the mail to the nucleus
        const mailResponse = await mailSender(
            email,
            "Your Data send successfully",
            contactUsEmail(firstName, lastName, email, contactNumber, message),
            false
        )
        console.log("Email Res ", mailResponse)

        const nucleusMail = await mailSender(
            process.env.NUCLEUS_MAIL,
            "User Send Mail",
            `User: ${firstName} ${lastName} \nEmail: ${email} \nContact Number: ${contactNumber} \nMessage: ${message}`,
            false
        )

        console.log("Nucleus Email Res ", nucleusMail)
        // console.log("Failed")


        return res.json({
            success: true,
            message: "Email send successfully",
        })

    } catch (error) {
        console.log("We can't contact you right now please try after some time");
        console.log(error);
    }
}