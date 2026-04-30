import express from "express"
import { githubWebhookRouter } from "./routes/githubWebhook.route"

export function createApp() {
    const app = express()

    app.use(
        express.json({
            limit: "2mb",
            verify: (req, _res, buffer) => {
                ;(req as express.Request & { rawBody?: string }).rawBody = buffer.toString("utf8")
            },
        })
    )
    app.use(githubWebhookRouter)

    app.get("/health", (_req, res) => {
        res.status(200).json({ ok: true })
    })

    return app
}
