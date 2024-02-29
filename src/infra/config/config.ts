import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 5000,

    // sendgrid config
    sendgridApiKey: process.env.SENDGRID_API_KEY??'',
    sendgridEmail: process.env.SENDGRID_EMAIL??'',
    sendgridUser: process.env.SENDGRID_USER??'',
    sendgridServer: process.env.SENDGRID_SERVER??'',
    sendgridPort: process.env.SENDGRID_PORT??'',  

    // google auth config
    googleClientId: process.env.GOOGLE_CLIENT_ID??'',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET??'',
    googleRedirectUrl: process.env.GOOGLE_REDIRECT_URL??'',
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL??'',
    googleScope: process.env.GOOGLE_SCOPE??'',
    googleAuthUrl: process.env.GOOGLE_AUTH_URL??'',
    googleTokenUrl: process.env.GOOGLE_TOKEN_URL??'',

    jwtSecret: process.env.JWT_SECRET??'',
    
    // dbUrl: process.env.DB_URL??'',
    // dbUser: process.env.DB_USER??'',
    // dbPassword: process.env.DB_PASSWORD??'',
    // dbName: process.env.DB_NAME??'',
    // dbPort: process.env.DB_PORT??'',
    
    newRelicKey: process.env.NEW_RELIC_LICENSE_KEY??'',
}