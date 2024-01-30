import dotenv from "dotenv"
import app from "../src/http/bootstrap"
import logger from "../src/shared/logger"
import { program } from "commander"
dotenv.config()

program
    .option('-p, --port <type>', 'Port to run the server on')
    .parse(process.argv)

const options = program.opts()
const port = options.port || process.env.PORT || 5000

app.listen(port, () => {
    logger.info(`Server running on port ${port}`)
})