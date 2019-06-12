import * as https from "https";
import * as querystring from "querystring";

export interface IGReCAPTCHAVerifyResponse {
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    score?: number;
    action?: string;
    "error-codes"?: string[];
}

export class ReCAPTCHA {

    public lastResponse: IGReCAPTCHAVerifyResponse = { success: false };

    public constructor(private secretKey: string, private minimumScore: number = 0.5, private validationAction: boolean = false) {
    }

    public async verify(token: string, action?: string): Promise<boolean> {

        this.lastResponse = { success: false };
        const response = await new Promise<string>((resolve, reject) => {

            const chunks = [];
            const data = querystring.stringify({
                secret: this.secretKey,
                response: token,
            });
            const request = https.request({
                hostname: "www.google.com",
                path: "/recaptcha/api/siteverify",
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
                    resolve(chunks.join(""));
                });

            });

            request.on("error", (err) => {
                reject(err);
            });

            request.write(data);
            request.end();
        });

        this.lastResponse = JSON.parse(response) as IGReCAPTCHAVerifyResponse;
        if (true !== this.lastResponse.success) {
            return false;
        }

        if (this.validationAction && action) {
            if (action !== this.lastResponse.action) {
                return false;
            }
        }

        if (this.minimumScore) {
            if (this.lastResponse.score < this.minimumScore) {
                return false;
            }
        }

        return true;
    }
}
