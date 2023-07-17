const { UAR_TEMPLATE } = require('./uar-template');

exports.SHIFT_EMAIL = (name, shift, waitingShifts, service) => {
  return UAR_TEMPLATE(`
    <p>Estimado(a) ${name},</p>
    <br>
    <div style="display:flex; justify-content:center; flex-direction:column; align-items:center;">
        <p style="font-size: 32px; color: #00713D; font-weight: bold; margin: 0; line-height: 1.5;">${shift.code}</p>  
        <p style="font-size: 24px; margin: 0; line-height: 1.5; text-align: center;">${service.name} - ${service.code}</p>
        <p style="font-size: 16px; margin: 0; line-height: 1.5;">Clientes en espera: ${waitingShifts}</p>
        <br>
    </div>
    <p>Saludos,</p>
    <p>Unidad de Admisión y Registro</p>
`);
};
