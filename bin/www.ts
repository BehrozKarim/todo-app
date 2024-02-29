require('newrelic')
import 'reflect-metadata'
import dotenv from "dotenv"
import app from "../http/app/bootstrap"
import logger from "../src/infra/logger"
import { program } from "commander"
import relic from "newrelic"
import { config } from "../src/infra/config/config"
dotenv.config()

program
    .option('-p, --port <type>', 'Port to run the server on')
    .parse(process.argv)

const options = program.opts()
const port = options.port || config.port

app.listen(port, () => {
    logger.info(`Server running on port ${port}`)
})