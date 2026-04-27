import { sendOtp } from './../controllers/user.controller';
import twilio from "twilio";

const serviceSid = process.env.TWILLO_SERVICE_SID as string;
const accountSid = process.env.TWILLO_ACCOUNT_SID as string;
const authToken = process.env.TWILLO_AUTH_TOKEN as string;

if (!serviceSid || !accountSid || !authToken) {
  throw new Error("Twilio creaditials not found");
}

const client = twilio(accountSid, authToken);
export const sendOtpToNumber = async (number: string) => {
  try {
    if (!number) {
      throw new Error('phone number is  required');
    }

    const res = await client.verify.v2?.services(serviceSid).verifications.create({
      to: number,
      channel: 'sms'
    })

    console.log('Otp send to number :', number);
    return res;
  } catch (error) {
    console.error(error);
    throw new Error('send otp to number error ');
  }
}

export const verifyOtpNumber = async (number: string, otp: string) => {
  try {
    const res = await client.verify.v2?.services(serviceSid).verificationChecks.create({
      to: number,
      code: otp
    })
    return res;
  } catch (error) {
    console.error(error);
    throw new Error('otp verification failed');
  }
}