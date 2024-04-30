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
                        Te escribimos para informarte que has obtenido una calificación de ${percentage} en el
                        primer examen del Master de IA, y lamentamos decirte que no has alcanzado el mínimo
                        para aprobar. Aunque entendemos que esto pueda ser decepcionante, queremos recordarte
                        que los obstáculos son oportunidades para crecer y aprender. Te animamos a que no te
                        desanimes y utilices este resultado como un impulso para redoblar tus esfuerzos en el
                        estudio y preparación de futuras evaluaciones.

                          <br />
                          <br />

                        Recuerda que el Master de IA es un programa desafiante, y el camino hacia el dominio de
                        esta disciplina requiere tiempo, esfuerzo y dedicación. El aprendizaje es un proceso
                        continuo y todos enfrentamos dificultades en algún momento.

                          <br />
                          <br />
                       Sabemos que eres capaz de enfrentar este desafío y mejorar tus resultados en los próximos
                        exámenes. Te animamos a que continúes trabajando arduamente para alcanzar tus metas
                      en el campo de la Inteligencia Artificial.

                          <br />
                          <br />

                        Mucho ánimo y nos vemos en clase.
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
