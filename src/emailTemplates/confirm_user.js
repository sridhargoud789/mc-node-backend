module.exports = ({name, email, link}) => `<!DOCTYPE html>
<html>
<head>
<title>Tangkimail - Design 1</title>
</head>
<body>
<div style="background-color: #F8F9FA; width: 100%; margin: 0; padding: 0;">
  <table align="center" cellpadding="0" cellspacing="12px" width="100%" style="max-width: 624px; margin: auto;">
    <tbody>
      
      <!-- Header -->
      <tr>
        <td><table width="100%" style="padding: 40px 0px 8px 0;">
            <tbody>
              <tr>
                <td align="center"><img style="max-width: 270px;" src="https://mundocrypto-files.s3.eu-central-1.amazonaws.com/email_template_files/images/mundologo.png"></td>
              </tr>
            </tbody>
          </table></td>
      </tr>
      
      <!-- Body -->
      <tr>
        <td><table width="100%" style="background-color: #FFFFFF; padding: 29px; margin-bottom: 12px; border-radius: 16px">
            <tbody>
              <tr style="border-radius: 16px">
                <td align="center" style="border-radius: 16px;"><img style="max-width: 98px;" src="https://mundocrypto-files.s3.eu-central-1.amazonaws.com/email_template_files/images/icon-confirm.png">
                  <div style="width: fit-content; margin-top: 16px; border-radius: 8px;">
                    <p style="font-family: 'Montserrat'; font-style: normal; font-weight:700; font-size: 14px; line-height: 24px; color: #212529; margin: 0; padding-bottom: 16px;">Hello ${name},</p>
                  </div>
                  <p style="font-family: 'Montserrat'; font-style: normal; font-weight: 500; font-size: 14px; line-height: 24px; color: #212529; margin: 0; padding-bottom: 8px;">confirm ${email} Thank you and have the best learning and get many rewards!</p>
                  <div style="padding: 16px 24px; background-color: #0077CA; width: fit-content; margin-top: 16px; border-radius: 8px;"> <a href="${link}" style="font-family: 'Montserrat'; font-style: normal; font-weight:600; font-size: 14px; line-height: 24px; color: #FFFFFF; text-decoration: none;">Confirm Email Address</a> </div>
                  <div style="padding: 8px 24px; width: fit-content; margin-top: 24px;">
                    <p style="font-family: 'Montserrat'; font-style: normal; font-weight: 600; font-size: 14px; line-height: 24px; color: #212529; margin: 0; padding-bottom: 8px;">If you have trouble using the button above, you can also confirm by copying the link below in address ba</p>
                  </div>
                  <div style="padding: 0px 24px; max-width:450px; word-break: break-all; margin-top: 0px;">
                    <p style="font-family: 'Montserrat'; color:#0077CA; font-style: normal; font-weight: 500; font-size: 14px; line-height: 24px; margin: 0; padding-bottom: 16px;"> ${link}</p>
                  </div>
                  <div style="padding: 8px 24px; max-width:460px; word-break: break-all; margin-top: 10px;">
                    <p style="font-family: 'Montserrat'; font-style: normal; font-weight:600; font-size: 14px; line-height: 8px; color: #212529; margin: 0; padding-bottom: 16px;">Greetings</p>
                    <p style="font-family: 'Montserrat'; font-style: normal; font-weight:500; font-size: 14px; line-height: 24px; color: #212529; margin: 0; padding-bottom: 16px;">Your Mundocrypto Academy Team</p>
                    <p style="font-family: 'Montserrat'; font-style: normal; font-weight:400; font-size: 12px; line-height: 24px; color: #7A8183; margin: 0; padding-bottom: 0px;">If you did not sign up or request email confirmation,
                    please ignore this email</p>
                  </div></td>
              </tr>
            </tbody>
          </table></td>
      </tr>
      
      <!-- Footer -->
      <tr>
        <td><table width="100%" style="margin-top: 0px;">
            <tbody align="center">
              <tr>
                <td style="padding-bottom: 0px;"><a href="#"><img style="max-width: 40px; padding: 12px;  margin-right:16px;" src="https://mundocrypto-files.s3.eu-central-1.amazonaws.com/email_template_files/images/twitter.png"></a> 
                <a href="#"><img style="max-width: 40px; padding: 12px; ;  margin-left: 16px;" src="https://mundocrypto-files.s3.eu-central-1.amazonaws.com/email_template_files/images/instagram.png"></a> 
                <a href="#"><img style="max-width: 40px; padding: 12px;   margin-left: 16px;" src="https://mundocrypto-files.s3.eu-central-1.amazonaws.com/email_template_files/images/youtube.png"></a>
                 <a href="#"><img style="max-width: 40px; padding: 12px;   margin-left: 16px;" src="https://mundocrypto-files.s3.eu-central-1.amazonaws.com/email_template_files/images/linkedin.png"></a>
                  <a href="#"><img style="max-width: 40px; padding: 12px; ;  margin-left: 16px;" src="https://mundocrypto-files.s3.eu-central-1.amazonaws.com/email_template_files/images/telegram.png"></a></td>
              </tr>
              <tr>
                <td style="padding-bottom:0px;">
                  <p style="font-family: 'Montserrat'; font-style: normal; font-weight: 400; font-size: 12px; line-height: 20px; color: #7A8183; margin: 0;">You have received this email because ${email} is registered with 
                  <a href="images/twitter.png">Mundocrypto Academy</a> Do not reply directly to this email. If you have any questions or suggestions,</p>
                  <p style="font-family: 'Montserrat'; font-style: normal; font-weight: 400; font-size: 12px; line-height: 20px; color: #7A8183; margin: 0;">please visit our page of 
                  <a href="images/youtube.png">help.</a> <br>
                  </p>
                  <div style="padding: 10px 0px 0px 0px; max-width:450px; word-break: break-all; margin-top: 0px;">
                    <p style="font-family: 'Montserrat'; font-style: normal; font-weight: 500; font-size: 12px; line-height: 20px; color: #7A8183; margin: 0;">381 E.Evelyn Avenue, Mountain View, CA 94041 USA</p>
                  </div>
                  <p style="font-family: 'Montserrat'; font-style: normal; font-weight: 400; font-size: 12px; line-height: 20px; color: #7A8183; margin: 0;"> © Copyright Mundocrypto 2022. All rights reserved.</p>
                  </p></td>
              </tr>
              <tr>
                <td><a href="#" style="text-decoration: none;"><span style="font-family: 'Montserrat'; font-style: normal; font-weight: 400; font-size: 12px; line-height: 20px; color: #495255; padding: 4px 12px; background-color: #FFFFFF; border-radius: 4px;">Unsubcribe</span></a></td>
              </tr>
            </tbody>
          </table></td>
      </tr>
    </tbody>
  </table>
</div>
</body>
</html>`;
