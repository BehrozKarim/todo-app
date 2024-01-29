import {google} from 'googleapis';
import {Request, Response} from 'express';
import {userModel} from '../stores/user-store';
import { createToken } from '../../utils/utils';
import logger from '../../shared/logger';

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
);

export const googleAuthCallbackService = async (code: string) => {
    if (code) {
        try {
            const {tokens} = await oAuth2Client.getToken(code.toString());
            oAuth2Client.setCredentials(tokens);
            const oauth2 = google.oauth2({
                auth: oAuth2Client,
                version: 'v2',
            });
            const {data} = await oauth2.userinfo.get();
            if (data.email && data.name ) {
                const user = await userModel.findByEmail(data.email? data.email: '');
                if (user) {
                    const token = await createToken(user);
                    return {
                        status: 200,
                        token: token,
                        id: user.userId,
                        name: user.name,
                        email: user.email,
                    };
                }
                else if (!user) {
                    const newUser = await userModel.create({
                        name: data.name,
                        email: data.email,
                        username: data.email,
                        password: '',
                    });
                    if (newUser) {
                        const token = await createToken(newUser);
                        return {
                            status: 201,
                            token: token,
                            id: newUser.userId,
                            name: newUser.name,
                            email: newUser.email,
                        };
                    }
                }
            }
        } catch (error) {
            // console.log(error);
            if (typeof error === 'string') {
                logger.error(error);
                return {
                    message: error,
                    status: 500,
                };
            } else {
                logger.error("Error in googleAuthCallbackService");
            }
            return {
                message: 'Internal Server Error',
                status: 500,
            };
        }
    }
    return {
        message: 'Invalid Request',
        status: 400,
    };
}