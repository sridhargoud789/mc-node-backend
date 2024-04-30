module.exports = ({name, email, course_name}) => `
<!DOCTYPE html>
<html>

<head>
  <title>Tangkimail - Design 3</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600&display=swap" rel="stylesheet">
</head>

<body>
  <div style="background-color: #F8F9FA; width: 100%; margin: 0; padding: 0;">
    <table align="center" cellpadding="0" cellspacing="12px" width="100%" style="max-width: 624px; margin: auto">
      <tbody>

        <!-- Header -->
        <tr>
          <td>
            <table width="100%" style="padding: 40px 0px 8px 0;">
              <tbody>
                <tr>
                  <td align="center"><img style="max-width: 270px;"
                      src="https://mundocrypto-files.s3.eu-central-1.amazonaws.com/email_template_files/images/mundologo.png">
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td>
            <table width="100%"
              style="background-color: #FFFFFF; padding: 29px; margin-bottom: 8px; border-radius: 16px">
              <tbody>
                <tr style="border-radius: 16px">
                  <td  style="border-radius: 16px;">
                    
                    <div style="width: fit-content; margin-top: 16px; border-radius: 8px;">
                      <p
                        style="font-family: 'Montserrat'; font-style: normal; font-weight:700; font-size: 16px; line-height: 24px; color: #212529; margin: 0; padding-bottom: 16px;">
                        Hola ${name},</p>
                    </div>
                   
                    <p
                      style="font-family: 'Montserrat'; font-style: normal; font-weight: 500; font-size: 14px; line-height: 24px; color: #212529; margin: 0; padding-bottom: 8px;">
                      Nos complace que haya configurado su primera alarma para su tiempo de aprendizaje en el curso ${course_name}. Es hora de prepararse para una experiencia de aprendizaje enriquecedora. Aquí hay algunos consejos para comenzar:
                    </p>
                    <ul    style="font-family: 'Montserrat'; font-style: normal; font-weight: 500; font-size: 14px; line-height: 14px; color: #212529; margin: 0; padding-bottom: 8px;">
                    <li style="line-height: 30px;">
                        Establezca un área de estudio tranquila y cómoda.
                        </li>
                        <li style="line-height: 30px;">
                        Reúna todos los materiales necesarios para el curso.</li>
                        <li style="line-height: 30px;">
                        Despeja tu agenda para concentrarte por completo en tu sesión de aprendizaje.
                        </li>
                        <li style="line-height: 30px;">
                        Mantenga un cuaderno a mano para anotar puntos o preguntas importantes.
                        </li>
                     </ul>
                     <br/>
                     <br/>
                     <div style="padding-top: 16px;">
                      <p
                        style="font-family: 'Montserrat'; font-style: normal; font-weight:600; font-size: 14px; line-height: 8px; color: #212529; margin: 0; padding-bottom: 8px;">
                        Saludos,</p>
                      <p
                        style="font-family: 'Montserrat'; font-style: normal; font-weight:500; font-size: 14px; line-height: 24px; color: #212529; margin: 0; padding-bottom: 0px;">
                        Mundocrypto Academy Team</p>

                    </div>



                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td>
            <table width="100%" style="margin-top: 0px;">
              <tbody align="center">
                <tr>
                  <td style="padding-bottom: 0px;"><a href="https://twitter.com/MundoCrypto_ES"><img
                        style="max-width: 40px; padding: 12px;  margin-right:16px;"
                        src="https://mundocrypto-files.s3.eu-central-1.amazonaws.com/email_template_files/images/twitter.png"></a>
                    <a href="https://www.instagram.com/mundocryptooficial/"><img style="max-width: 40px; padding: 12px; ;  margin-left: 16px;"
                        src="https://mundocrypto-files.s3.eu-central-1.amazonaws.com/email_template_files/images/instagram.png"></a>
                    <a href="https://www.youtube.com/channel/UCCcdO0Dn_6sG_C8bGsweLOQ"><img style="max-width: 40px; padding: 12px;   margin-left: 16px;"
                        src="https://mundocrypto-files.s3.eu-central-1.amazonaws.com/email_template_files/images/youtube.png"></a>
                    <a href="https://www.linkedin.com/school/mundocryptoacademy/"><img style="max-width: 40px; padding: 12px;   margin-left: 16px;"
                        src="https://mundocrypto-files.s3.eu-central-1.amazonaws.com/email_template_files/images/linkedin.png"></a>
                    <a href="https://t.me/joinchat/U45mgOLUQM1Qih4l"><img style="max-width: 40px; padding: 12px; ;  margin-left: 16px;"
                        src="https://mundocrypto-files.s3.eu-central-1.amazonaws.com/email_template_files/images/telegram.png"></a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:0px;">
                    <p
                      style="font-family: 'Montserrat'; font-style: normal; font-weight: 400; font-size: 12px; line-height: 20px; color: #7A8183; margin: 0;">
                      Has recibido este email porque ${email} está registrado en
                      <a href="https://mundocrypto.com/">Mundocrypto Academy</a> No responder directamente a este email. Si tienes alguna pregunta o sugerencia por favor escríbenos a, info@mundocrypto.com
                    </p>
                    <p
                      style="font-family: 'Montserrat'; font-style: normal; font-weight: 400; font-size: 12px; line-height: 20px; color: #7A8183; margin: 0;">
                      © Copyright Mundocrypto 2022. All rights reserved.</p>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td><a href="#" style="text-decoration: none;"><span
                        style="font-family: 'Montserrat'; font-style: normal; font-weight: 400; font-size: 12px; line-height: 20px; color: #495255; padding: 4px 12px; background-color: #FFFFFF; border-radius: 4px;">Unsubcribe</span></a>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</body>

</html>
`