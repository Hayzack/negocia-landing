// Recibe un lead del formulario /evento y lo envía como correo HTML a somosnegocia@gmail.com con Resend.
// Necesita la variable de entorno RESEND_API_KEY en Vercel. Si falta o Resend falla, responde con error
// y la página usa FormSubmit como respaldo, así que ningún lead se pierde.
const { buildLeadEmail } = require('../lib/correo-lead');

const FROM = 'NegocIA Leads <onboarding@resend.dev>'; // remitente de prueba de Resend; cambiar al tener dominio propio
const LIMITES = { tipo: 60, servicios: 200, necesidad: 600, plazo: 60, nombre: 120, negocio: 120, whatsapp: 40, correo: 160, evento: 80, origen: 80, pagina: 200, fecha: 40 };

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Solo se acepta POST.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return res.status(400).json({ ok: false, error: 'Falta el lead.' });
  if (body._honey) return res.status(200).json({ ok: true }); // trampa para bots: se ignora en silencio

  const lead = {};
  for (const [k, max] of Object.entries(LIMITES)) lead[k] = String(body[k] ?? '').trim().slice(0, max);
  if (lead.nombre.length < 2 || lead.whatsapp.replace(/\D/g, '').length < 10) {
    return res.status(400).json({ ok: false, error: 'Faltan el nombre o un WhatsApp válido.' });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ ok: false, error: 'RESEND_API_KEY no está configurada.' });

  const mail = buildLeadEmail(lead);
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.correo) ? { reply_to: lead.correo } : {}),
      }),
    });
    if (!r.ok) {
      const detalle = await r.text().catch(() => '');
      console.error('Resend rechazó el envío', r.status, detalle);
      return res.status(502).json({ ok: false, error: 'El servicio de correo no aceptó el envío.' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('No se pudo contactar a Resend', e);
    return res.status(502).json({ ok: false, error: 'No se pudo contactar al servicio de correo.' });
  }
};
