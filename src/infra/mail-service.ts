import sgMail from '@sendgrid/mail';
import * as dotenv from 'dotenv';
import logger from './logger';
import { UUIDVo } from '@carbonteq/hexapp';
import { UserDbRepo } from './Repos/user-db-repo';
import { mailData } from '../../shared/shared';
import {config} from './config/config';
dotenv.config();

// const apiKey = process.env.SENDGRID_API_KEY??'';
const apiKey = config.sendgridApiKey;
sgMail.setApiKey(apiKey);

export const mailService = {
    sendEmail: async function(mail: mailData) {
        const userModel = new UserDbRepo();
        const idVo = UUIDVo.fromStr(mail.userId);
        if (idVo.isErr()) {
            logger.error('Unable to send email due to invalid user id');
            return;
        }
        const user = await userModel.fetchById(idVo.unwrap())
        if (user.isErr()) {
            logger.error('User not found');
            return;
        }
        const userData = user.unwrap();
        const sendMailData = {
            to: userData.email,
            // from: process.env.SENDGRID_EMAIL??'',
            from: config.sendgridEmail,
            subject: mail.subject,
            text: mail.data,
        }

        sgMail.send(sendMailData).then(() => {
            logger.info('Email sent');
        }
        ).catch((error) => {
            logger.error(error);
        }
        );
    }
}

