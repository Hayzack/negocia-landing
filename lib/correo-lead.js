// Arma el correo HTML de cada lead del formulario de captación de NegocIA.
// Lo usa api/lead.js. Vista previa local: node -e "process.stdout.write(require('./lib/correo-lead').buildLeadEmail(require('./lib/lead-ejemplo.json')).html)" > preview.html
function buildLeadEmail(lead) {
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nombre = (lead.nombre || 'Sin nombre').trim();
  const primerNombre = nombre.split(' ')[0];
  const esDiagnostico = /diagn/i.test(lead.tipo || '');
  const tipo = esDiagnostico ? 'Diagnóstico gratuito (30 min)' : 'Propuesta con precio cerrado';
  const digitos = String(lead.whatsapp || '').replace(/\D/g, '');
  const saludo = `Hola ${primerNombre}, te escribimos de NegocIA por la solicitud que dejaste${lead.evento && lead.evento !== 'Evento' ? ' en ' + lead.evento : ''}.`;
  const waLink = digitos ? `https://wa.me/${digitos}?text=${encodeURIComponent(saludo)}` : '';
  let fecha = lead.fecha || '';
  try { fecha = new Date(lead.fecha).toLocaleString('es-VE', { timeZone: 'America/Caracas', dateStyle: 'long', timeStyle: 'short' }) + ' (hora de Venezuela)'; } catch (e) {}

  const fila = (label, value, opts = {}) => `
    <tr>
      <td style="padding:12px 0;border-top:1px solid #e3ebe7;width:150px;vertical-align:top;font-size:13px;color:#5d6b64">${esc(label)}</td>
      <td style="padding:12px 0;border-top:1px solid #e3ebe7;vertical-align:top;font-size:15px;color:#0c1411;${opts.strong ? 'font-weight:600;' : ''}">${value}</td>
    </tr>`;
  const vacio = t => `<span style="color:#8a9690">${esc(t)}</span>`;
  const chips = (lead.servicios || '').split(',').map(s => s.trim()).filter(s => s && s !== 'Sin elegir');

  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nuevo lead NegocIA</title></head>
<body style="margin:0;padding:0;background:#eef3f0;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden">${esc(nombre)} pidió ${esc(tipo.toLowerCase())}. WhatsApp: ${esc(lead.whatsapp || 'sin número')}.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3f0;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dbe5e0">
        <tr><td style="background:#060807;padding:22px 28px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-size:22px;font-weight:700;letter-spacing:-0.5px;color:#ecf3ef">Negoc<span style="color:#10b981">IA</span></td>
            <td align="right" style="font-size:12px;color:#9ba7a1">Formulario de captación de leads</td>
          </tr></table>
        </td></tr>
        <tr><td style="height:3px;background:#10b981;background-image:linear-gradient(90deg,#10b981,#2563eb);font-size:0;line-height:0">&nbsp;</td></tr>
        <tr><td style="padding:28px 28px 8px">
          <p style="margin:0 0 10px;font-size:13px;color:#5d6b64">Nuevo lead</p>
          <h1 style="margin:0 0 14px;font-size:26px;line-height:1.2;letter-spacing:-0.5px;color:#0c1411">${esc(nombre)}${lead.negocio ? `<br><span style="font-size:17px;font-weight:500;color:#3d4a44">${esc(lead.negocio)}</span>` : ''}</h1>
          <span style="display:inline-block;padding:6px 12px;border-radius:999px;font-size:13px;font-weight:600;${esDiagnostico ? 'background:#e7effe;color:#1d4fc4;border:1px solid #bcd0fb' : 'background:#e6f6ef;color:#0b7a55;border:1px solid #b4e4cf'}">${esc(tipo)}</span>
        </td></tr>
        ${waLink ? `<tr><td style="padding:20px 28px 4px">
          <a href="${waLink}" style="display:inline-block;background:#10b981;color:#04110c;text-decoration:none;font-weight:700;font-size:15px;padding:13px 22px;border-radius:999px">Escribirle por WhatsApp</a>
          <p style="margin:10px 0 0;font-size:12px;color:#5d6b64">El mensaje llega con un saludo ya escrito; puedes editarlo antes de enviar.</p>
        </td></tr>` : ''}
        <tr><td style="padding:16px 28px 8px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${fila('WhatsApp', lead.whatsapp ? esc(lead.whatsapp) : vacio('No lo dejó'), { strong: true })}
            ${fila('Correo', lead.correo ? `<a href="mailto:${esc(lead.correo)}" style="color:#0b7a55">${esc(lead.correo)}</a>` : vacio('No lo dejó'))}
            ${fila('Le interesa', chips.length ? chips.map(c => `<span style="display:inline-block;margin:0 6px 6px 0;padding:4px 10px;border-radius:999px;background:#f1f5f3;border:1px solid #dbe5e0;font-size:13px">${esc(c)}</span>`).join('') : vacio('Lo definimos juntos'))}
            ${fila('Qué quiere resolver', lead.necesidad ? esc(lead.necesidad).replace(/\n/g, '<br>') : vacio('No lo escribió'))}
            ${fila('Para cuándo', lead.plazo && lead.plazo !== 'Sin fecha' ? esc(lead.plazo) : vacio('Sin fecha'))}
          </table>
        </td></tr>
        <tr><td style="padding:12px 28px 26px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f9f7;border-radius:12px">
            <tr><td style="padding:14px 16px;font-size:12px;line-height:1.6;color:#5d6b64">
              <strong style="color:#3d4a44">Origen:</strong> ${esc(lead.origen || 'Formulario de captación de leads')}<br>
              <strong style="color:#3d4a44">Evento:</strong> ${esc(lead.evento || 'Sin indicar')}<br>
              <strong style="color:#3d4a44">Recibido:</strong> ${esc(fecha)}<br>
              ${lead.pagina ? `<strong style="color:#3d4a44">Página:</strong> ${esc(lead.pagina)}` : ''}
            </td></tr>
          </table>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:11px;color:#8a9690">Correo automático de NegocIA. Responde a la persona por WhatsApp o desde su correo.</p>
    </td></tr>
  </table>
</body></html>`;

  return {
    to: 'somosnegocia@gmail.com',
    subject: `Nuevo lead del formulario de captación: ${nombre} (${esDiagnostico ? 'Diagnóstico' : 'Propuesta'})`,
    replyTo: lead.correo || '',
    html,
  };
}

module.exports = { buildLeadEmail };
