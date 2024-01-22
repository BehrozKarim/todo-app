import dotenv from "dotenv"
import app from "../src/http/bootstrap"
dotenv.config()

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})