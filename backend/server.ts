import { createApp } from "./app"
import { assertEnv, env } from "./config/env"
import { logger } from "./utils/logger"

async function main() {
    assertEnv()

    const app = createApp()
    app.listen(env.port, () => {
        logger.info("Backend server started", { port: env.port })
    })
}

main().catch((error) => {
    logger.error("Backend server failed to start", {
        error: error instanceof Error ? error.message : "Unknown error",
    })
    process.exit(1)
})
