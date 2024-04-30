module.exports = ({ username, days, payment_date, remaining_payments }) => `
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
                        Hola&nbsp;${username},
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
                          La mentoría "Dinero Desbloqueado" está avanzando con
                          gran ímpetu, y queremos asegurarnos de que estés
                          obteniendo el máximo beneficio posible. 📚<br />
                          <br />

                          ✨ Completa los formularios, repasa la primera clase y
                          mantente atento a las notificaciones de Telegram.
                          Estás en pleno camino hacia la libertad financiera.
                          <br />
                          <br />
                          Es importante recordarte que tienes ${days} días para
                          realizar el próximo pago y continuar con tu proceso
                          dentro de la mentoría.
                          <br />
                          📆 Fecha límite: ${payment_date}
                          <br />
                          💸 Monto pendiente: ${remaining_payments}
                          <br />
                          <br />
                          ⚠️ Queremos enfatizar que nuestra plataforma no
                          efectúa cobros automáticos. La gestión y
                          responsabilidad de los pagos es tuya. Puedes hacer tu
                          pago en la sección "payments" de tu cuenta o
                          directamente a través de este enlace:
                          <br />
                          https://www.mundocrypto.com/privatearea/mylearnings.
                          Si el pago no se efectúa dentro de los ${days} días
                          establecidos, el acceso a la mentoría se suspenderá
                          automáticamente.
                          <br />
                          <br />
                          A lo largo de los 90 días de mentoría, Mani compartirá
                          sus valiosos conocimientos adquiridos en su
                          trayectoria profesional. Te proporcionará herramientas
                          y estrategias para llevar tu idea de 0 a 1M$ e incluso
                          explorar la posibilidad de escalar hasta los 50M$.💥🚀
                          <br />
                          <br />
                          Si tienes alguna duda o requieres asistencia, no dudes
                          en ponerte en contacto con nosotros:
                          https://wa.me/971588163253. Estamos aquí para
                          brindarte todo el soporte necesario en esta
                          emocionante travesía.
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
                          Saludos cordiales,
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
                          Mani Thawani
                          <br />
                          Equipo de "Dinero Desbloqueado" 🌟💸🔐
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
