import { Router } from "express"
import { githubWebhookController } from "../controllers/githubWebhook.controller"

export const githubWebhookRouter = Router()

githubWebhookRouter.post("/webhook/github", githubWebhookController)
