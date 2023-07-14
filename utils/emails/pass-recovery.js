const { UAR_TEMPLATE } = require('./uar-template');

exports.PASS_RECOVERY_EMAIL = (name, token) => {
  return UAR_TEMPLATE(`
    <p>Estimado(a) ${name},</p>
    <br>
    <p>Ha solicitado recuperar tu contraseña. Ingrese al siguiente enlace para poder restablecerla.</p>  
    <p><a href="${process.env.WEB_URL}/reset-password/?token=${token}">Restablecer</a></p>
    <p>Si no ha solicitado restablecer tu contraseña, puede ignorar este correo electrónico.</p>
    <br>
    <p>Saludos,</p>
    <p>Unidad de Admisión y Registro</p>
`);
};
