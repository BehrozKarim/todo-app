import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        version: "1.0.0",
        title: "TODO List API",
        description: "A simple TODO List API",
        host: "localhost:5000",
    },
    host: "localhost:5000",
    servers: [
        {
            url: "http://localhost:5000",
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
}

const outputFile = "./swagger_output.json"
const endpointsFiles = ["./routes/routes.ts"]

swaggerAutogen()(outputFile, endpointsFiles, doc)