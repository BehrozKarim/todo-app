import {google} from 'googleapis';
import { UserDbRepo } from './stores/user-db-repo';
import { UserRepository } from '../domain/user-repository';
import { UserEntity } from '../domain/user-entity';
import { createToken } from '../utils/utils';
import logger from './logger';

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
);

export const googleAuthCallbackService = async (code: string) => {
    const repo: UserRepository = new UserDbRepo();
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
                const user = await repo.fetchByEmail(data.email);
                if (user.isOk()) {
                    const token = await createToken({userId: user.unwrap().Id.serialize()});
                    return {
                        status: 200,
                        token: token,
                        id: user.unwrap().Id,
                        name: user.unwrap().name,
                        email: user.unwrap().email,
                    };
                }
                else if (user.isErr()) {
                    const newUser = UserEntity.create({
                        name: data.name,
                        email: data.email,
                        username: data.email,
                        password: '',
                    });
                    const createdUser = await repo.insert(newUser);
                    if (createdUser.isOk()) {
                        const token = await createToken({userId: createdUser.unwrap().Id.serialize()});
                        return {
                            status: 201,
                            token: token,
                            id: createdUser.unwrap().Id,
                            name: createdUser.unwrap().name,
                            email: createdUser.unwrap().email,
                        };
                    }
                    else if (createdUser.isErr()) {
                        logger.error(createdUser.unwrapErr().message);
                        return {
                            message: createdUser.unwrapErr().message,
                            status: 400,
                        };
                    }
                    else {
                        logger.error(user.unwrapErr().message);
                        return {
                            message: user.unwrapErr().message,
                            status: 404,
                        };
                    }
                }
            }
        } catch (error) {
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