/// <reference path="../pb_data/types.d.ts" />

// Welcome email for the "waitlist" — the "Lista de Espera — Pré-lançamento".
//
// Requires SMTP configured in PocketBase (Admin → Settings → Mail settings;
// Gmail: smtp.gmail.com, port 587, your Gmail address + a Google App Password).
// Images are PNGs hosted on the live site (email clients block SVG):
//   https://www.cartadapopular.com.br/assets/email-*.png

function sendWelcome(app, email) {
    const settings = app.settings()
    const base = "https://www.cartadapopular.com.br/assets"

    const html = `
    <div style="margin:0;padding:24px 12px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="max-width:520px;margin:0 auto;background:#ffffff;border:3px solid #0000cc;border-radius:18px;overflow:hidden;">
        <tr><td style="background:#e20000;height:8px;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:28px 28px 6px;color:#131313;font-size:15px;line-height:1.6;">
          <p style="margin:0 0 14px;font-size:18px;font-weight:bold;color:#0000cc;">Salve, salve!</p>
          <p style="margin:0 0 16px;">Brigada por se interessar pelo projeto!</p>
          <p style="margin:0 0 16px;">Em breve, mandamos acesso ao site para usar, testar e nos dar retorno de como podemos melhorar.</p>
          <p style="margin:0;">Enquanto você espera, segue a gente nas redes, e faça parte da nossa <strong>Rede de Mobilização</strong> no Whatsapp.</p>
        </td></tr>
        <tr><td align="center" style="padding:14px 28px 4px;">
          <p style="margin:0 0 10px;font-weight:bold;color:#131313;font-size:15px;">Rede de Mobilização:</p>
          <a href="https://chat.whatsapp.com/BWD6JLntGRj348OHH6yESl" target="_blank"
             style="display:inline-block;background:#25D366;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:12px 26px;border-radius:40px;">
            Entrar no WhatsApp
          </a>
        </td></tr>
        <tr><td style="padding:18px 28px 0;"><div style="border-top:2px solid #f0f0f0;font-size:0;line-height:0;">&nbsp;</div></td></tr>
        <tr><td align="center" style="padding:16px 28px 4px;">
          <p style="margin:0 0 12px;font-weight:bold;color:#0000cc;font-size:16px;">Segue a gente!</p>
          <a href="https://www.instagram.com/cartadapopular/" target="_blank" style="text-decoration:none;display:inline-block;"><img src="${base}/email-instagram.png" width="44" height="45" alt="Instagram" style="display:inline-block;border:0;margin:0 5px;"></a>
          <a href="https://www.tiktok.com/@cartada.popular" target="_blank" style="text-decoration:none;display:inline-block;"><img src="${base}/email-tiktok.png" width="44" height="45" alt="TikTok" style="display:inline-block;border:0;margin:0 5px;"></a>
          <a href="https://x.com/CartadaPopular" target="_blank" style="text-decoration:none;display:inline-block;"><img src="${base}/email-x.png" width="44" height="45" alt="X" style="display:inline-block;border:0;margin:0 5px;"></a>
          <a href="https://www.facebook.com/profile.php?id=61590917601489" target="_blank" style="text-decoration:none;display:inline-block;"><img src="${base}/email-facebook.png" width="44" height="45" alt="Facebook" style="display:inline-block;border:0;margin:0 5px;"></a>
        </td></tr>
        <tr><td align="center" style="padding:18px 28px 28px;">
          <p style="margin:0 0 12px;color:#131313;font-size:14px;">Equipe Cartada Popular</p>
          <img src="${base}/email-logo.png" width="96" height="99" alt="Cartada Popular" style="display:inline-block;border:0;">
          <p style="margin:12px 0 0;"><a href="https://www.cartadapopular.com.br" target="_blank" style="color:#0000cc;font-size:14px;text-decoration:none;font-weight:bold;">www.cartadapopular.com.br</a></p>
        </td></tr>
      </table>
      <p style="max-width:520px;margin:14px auto 0;text-align:center;color:#999;font-size:11px;">
        Você recebeu este email porque se inscreveu na lista de espera da Cartada Popular.
      </p>
    </div>`

    const text =
        "Salve, salve!\n" +
        "Brigada por se interessar pelo projeto!\n\n" +
        "Em breve, mandamos acesso ao site para usar, testar e nos dar retorno de como podemos melhorar.\n\n" +
        "Enquanto você espera, segue a gente nas redes, e faça parte da nossa Rede de Mobilização no Whatsapp.\n\n" +
        "Rede de Mobilização: https://chat.whatsapp.com/BWD6JLntGRj348OHH6yESl\n\n" +
        "Segue a gente!\n" +
        "Instagram: https://www.instagram.com/cartadapopular/\n" +
        "TikTok: https://www.tiktok.com/@cartada.popular\n" +
        "X: https://x.com/CartadaPopular\n" +
        "Facebook: https://www.facebook.com/profile.php?id=61590917601489\n\n" +
        "Equipe Cartada Popular\n" +
        "www.cartadapopular.com.br"

    const message = new MailerMessage({
        from:    { address: settings.meta.senderAddress, name: settings.meta.senderName },
        to:      [{ address: email }],
        subject: "[Lista de Espera] Pré-lançamento - Cartada Popular",
        html:    html,
        text:    text,
    })

    app.newMailClient().send(message)
}

// 1) Auto-send to every NEW sign-up.
onRecordAfterCreateSuccess((e) => {
    const email = e.record.getString("email")
    try {
        sendWelcome(e.app, email)
        e.app.logger().info("Welcome email sent", "email", email)
    } catch (err) {
        // Never fail the sign-up if the email can't be sent — just log it.
        e.app.logger().error("Failed to send welcome email", "email", email, "error", String(err))
    }
    e.next()
}, "waitlist")

// 2) One-shot backfill for people ALREADY in the list. Superuser-only.
//    Trigger ONCE:  POST {PB_URL}/api/cartada/send-welcome-existing
//    (run it a second time and everyone gets a duplicate — only run once.)
routerAdd("POST", "/api/cartada/send-welcome-existing", (e) => {
    const records = e.app.findAllRecords("waitlist")
    let sent = 0, failed = 0
    const errors = []
    for (const r of records) {
        const email = r.getString("email")
        try {
            sendWelcome(e.app, email)
            sent++
        } catch (err) {
            failed++
            errors.push(email + ": " + String(err))
        }
    }
    e.app.logger().info("Backfill welcome emails", "total", records.length, "sent", sent, "failed", failed)
    return e.json(200, { total: records.length, sent: sent, failed: failed, errors: errors })
}, $apis.requireSuperuserAuth())
