import {google} from 'googleapis';
import {Request, Response} from 'express';
import {googleAuthCallbackService} from '../../src/infra/google-auth-service';
import {Result } from 'oxide.ts';
import {config} from '../../src/infra/config/config';

// const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URL;

const CLIENT_ID = config.googleClientId;
const CLIENT_SECRET = config.googleClientSecret;
const REDIRECT_URI = config.googleRedirectUrl;

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

const SCOPES = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
];

export const googleAuth = (req: Request, res: Response) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    res.redirect(authUrl);
};

export const googleAuthCallback = async (req: Request, res: Response) => {
    const {code} = req.query;
    if (code) {
        const result = await Result.safe(googleAuthCallbackService(code.toString()));
        if (result.isErr()) {
            res.status(500).json(result.unwrapErr())
            return
        }
        const response = result.unwrap()
        if (response)
            res.status(response.status).json(response);
        else
            res.status(500).json({message: "Internal Server Error"})
    }
}