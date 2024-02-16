import sgMail from '@sendgrid/mail';
import * as dotenv from 'dotenv';
import logger from './logger';
import { userModel } from './stores/user-store';
import { mailData } from '../utils/utils';
dotenv.config();

const apiKey = process.env.SENDGRID_API_KEY??'';
sgMail.setApiKey(apiKey);

export async function sendEmail(mail: mailData) {
    const user = (await userModel.findById(mail.userId)).unwrap();
    if (!user) {
        logger.error('User not found');
        return;
    }
    const sendMailData = {
        to: user.email,
        from: process.env.SENDGRID_EMAIL??'',
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

