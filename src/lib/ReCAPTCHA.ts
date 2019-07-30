import * as https from "https";
import * as querystring from "querystring";
import {IVerificationResponse} from "./IVerificationResponse";

interface IGReCAPTCHAVerifyResponse {
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    score?: number;
    action?: string;
    "error-codes"?: string[];
}

export class ReCAPTCHA {

    private static DEFAULT_API_URL = "https://www.google.com/recaptcha/api/siteverify";

    private static createResponse(isHuman: boolean, score: number, action: string, errors: string[]): IVerificationResponse {
        return { isHuman, score, action, errors };
    }

    public constructor(private secretKey: string, private minimumScore: number = 0.5) {
    }

    public async verify(token: string, action?: string): Promise<IVerificationResponse> {

        try {
            const response = await this.callVerifyApi(token);
            if (true !== response.success) {
                return ReCAPTCHA.createResponse(false, 0, null, response["error-codes"]);
            }

            if (action && action !== response.action) {
                return ReCAPTCHA.createResponse(false, response.score, response.action, ["ACTION_DOES_NOT_MATCH"]);
            }

            if (this.minimumScore) {
                if (response.score < this.minimumScore) {
                    return ReCAPTCHA.createResponse(false, response.score, response.action, ["SCORE_TOO_LOW"]);
                }
            }

            return ReCAPTCHA.createResponse(true, response.score, response.action, null);

        } catch (err) {
            return ReCAPTCHA.createResponse(false, 0, null, ["API_ERROR", err.message]);
        }
    }

    private async callVerifyApi(token: string): Promise<IGReCAPTCHAVerifyResponse> {
        return new Promise((resolve, reject) => {

            const chunks = [];
            const data = querystring.stringify({
                secret: this.secretKey,
                response: token,
            });
            const url = process.env.GOOGLE_RECAPTCHA_V3_VERIFY_API_URL || ReCAPTCHA.DEFAULT_API_URL;
            const request = https.request(url, {
                method: "POST",
                headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                },
            }, (res) => {

                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    chunks.push(chunk);
                });
                res.on("end", () => {
                    resolve(JSON.parse(chunks.join("")));
                });
            });

            request.on("error", (err) => {
                reject(err);
            });

            request.write(data);
            request.end();
        });
    }
}
