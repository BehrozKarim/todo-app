import dotenv from "dotenv"
import app from "../src/http/bootstrap"
import logger from "../src/shared/logger"
dotenv.config()

const port = process.env.PORT || 5000

app.listen(port, () => {
    // console.log(`Server running on port ${port}`)
    logger.info(`Server running on port ${port}`)
})