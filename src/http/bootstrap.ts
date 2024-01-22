import router from "./routes/routes";
import express, {Express} from "express";
import bodyParser from 'body-parser'
import logger from "./middlewares/logger-middleware";

const app: Express = express();

app.use(bodyParser.json({limit: "100mb"}))
app.use(bodyParser.urlencoded({limit:"50mb", extended: true}))
app.use(logger);

app.use("/", router);

export default app;