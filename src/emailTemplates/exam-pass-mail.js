module.exports = ({ username, percentage }) => `
<!DOCTYPE html>
<html>
  <head>
    <title></title>
    <style>
      .awhatsapp {
        font-family: "Montserrat";
        font-style: normal;
        font-weight: 600;
        font-size: 17px;
        line-height: 16px;
        color: #ffffff;
        text-decoration: none;
        padding: 1rem;
        background-color: #28d146;
        width: 330px;
        margin-top: 16px;
        border-radius: 8px;
        border-color: #28d146;
      }
    </style>
  </head>
  <body>
    <div style="background-color: #f8f9fa; width: 100%; margin: 0; padding: 0">
      <table
        align="center"
        cellpadding="0"
        cellspacing="12px"
        width="100%"
        style="max-width: 624px; margin: auto"
      >
        <tbody>
          <!-- Header -->
          <tr>
            <td align="center">
              <table style="padding: 0px 0px 0px 0">
                <tbody>
                  <tr>
                    <td align="center">
                      <img
                        width="200"
                        style="margin: 0; border: 0; padding: 0; display: block"
                        src="https://mundocrypto-files.s3.eu-central-1.amazonaws.com/email_template_files/images/mundologo.png"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td>
              <table
                width="100%"
                style="
                  background-color: #ffffff;
                  margin-bottom: 12px;
                  border-radius: 16px;
                "
              >
                <tbody>
                  <tr style="border-radius: 16px">
                    <td style="border-radius: 16px">
                      <div
                        style="
                          padding: 8px 16px;
                          font-family: 'Montserrat';
                          font-style: normal;
                          font-weight: 600;
                          font-size: 15px;
                          line-height: 24px;
                          color: #212529;
                          margin-top: 15px;
                        "
                      >
                        Estimado&nbsp;${username},
                      </div>
                      <div style="padding: 8px 16px; width: fit-content">
                        <p
                          style="
                            font-family: 'Montserrat';
                            font-style: normal;
                            font-weight: 500;
                            font-size: 14px;
                            line-height: 24px;
                            color: #212529;
                            margin: 0;
                            padding-bottom: 8px;
                          "
                        >
                        Nos complace informarte que has obtenido una calificación de ${percentage}% en el primer
                        examen del Master de IA, por lo que has aprobado el examen. ¡Felicitaciones!

                          <br />
                          <br />

                    Tu dedicación, esfuerzo y compromiso se han reflejado claramente en tus resultados. Has
demostrado un excelente dominio de los conceptos clave en el campo de la Inteligencia
Artificial vistos en clase.
                          <br />
                          <br />

                          Importante recordar que el camino del aprendizaje no termina aquí. El Master de IA continúa
con más desafíos y oportunidades para seguir expandiendo tus conocimientos y
habilidades. Te animo a que sigas aprovechando al máximo cada una de las clases que se
presentarán en el transcurso del programa.
                          <br />
                          <br />

                        Una vez más, enhorabuena.
                          <br />
                      
                        </p>
                      </div>
<br/>
<br/>
                      <div
                        style="
                          padding: 8px 16px;
                          max-width: 460px;
                          word-break: break-all;
                          margin-top: 0px;
                        "
                      >
                        <p
                          style="
                            font-family: 'Montserrat';
                            font-style: normal;
                            font-weight: 600;
                            font-size: 14px;
                            line-height: 8px;
                            color: #212529;
                            margin: 0;
                            padding-bottom: 16px;
                          "
                        >
                          Atentamente,
                        </p>
                        <p
                          style="
                            font-family: 'Montserrat';
                            font-style: normal;
                            font-weight: 600;
                            font-size: 14px;
                            line-height: 24px;
                            color: #212529;
                            margin: 0;
                            padding-bottom: 16px;
                          "
                        >
                        Diego Baptista
                        <br />
                        Ignacio Peis
                        <br />
                        Pablo Sanchez
                        <br />
                        Equipo de MC
                        </p>
                      </div>
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
