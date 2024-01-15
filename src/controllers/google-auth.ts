import {google} from 'googleapis';
import {Request, Response} from 'express';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URL;

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
    console.log(authUrl);
    res.redirect(authUrl);
};

export const googleAuthCallback = async (req: Request, res: Response) => {
    const {code} = req.query;
    if (code) {
        try {
            const {tokens} = await oAuth2Client.getToken(code.toString());
            oAuth2Client.setCredentials(tokens);
            const oauth2 = google.oauth2({
                auth: oAuth2Client,
                version: 'v2',
            });
            const {data} = await oauth2.userinfo.get();
            console.log(data);
            res.send(data);
        } catch (error) {
            console.log(error);
            res.send(error);
        }
    }
}