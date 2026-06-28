/// <reference path="../pb_data/types.d.ts" />

// Welcome email for the "waitlist" — the "Lista de Espera — Pré-lançamento".
//
// The email-building code lives in ./welcome.js and is require()'d INSIDE each
// handler: PocketBase runs every hook handler in its own isolated JSVM runtime,
// so a function defined at the file's top level is not visible inside the
// handler ("sendWelcome is not defined"). require() inside the handler loads it
// into that runtime.
//
// Requires SMTP configured in PocketBase (Admin → Settings → Mail settings;
// Gmail: smtp.gmail.com:587, your Gmail address + a Google App Password).

// 1) Auto-send to every NEW sign-up.
onRecordAfterCreateSuccess((e) => {
    const email = e.record.getString("email")
    try {
        require(`${__hooks}/welcome.js`).sendWelcome(e.app, email)
        e.app.logger().info("Welcome email sent", "email", email)
    } catch (err) {
        // Never fail the sign-up because the email can't be sent — just log it.
        e.app.logger().error("Failed to send welcome email", "email", email, "error", String(err))
    }
    e.next()
}, "waitlist")

// 2) One-shot backfill for people ALREADY in the list. Superuser-only.
//    Trigger ONCE:  POST {PB_URL}/api/cartada/send-welcome-existing
//    (run it a second time and everyone gets a duplicate — only run once.)
routerAdd("POST", "/api/cartada/send-welcome-existing", (e) => {
    const sendWelcome = require(`${__hooks}/welcome.js`).sendWelcome
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
