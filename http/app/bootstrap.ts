import router from "../routes/routes";
import express, {Express} from "express";
import bodyParser from 'body-parser'
import swaggerUi from "swagger-ui-express";
import swaggerOutput from "../../swagger_output.json";
import logger from "../../src/infra/logger";
import errorHandler  from "../middlewares/error-handler";
import asyncHandler from "express-async-handler";

const app: Express = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput));
app.use(bodyParser.json({limit: "100mb"}))
app.use(bodyParser.urlencoded({limit:"50mb", extended: true}))
app.use(logger.logRequest.bind(logger));
// app.use(asyncHandler);

app.use("/", asyncHandler(router));

app.use(errorHandler);
export default app;