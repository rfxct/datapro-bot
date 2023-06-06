import axios from 'axios';

export default class TwoCaptchaApi {
  protected apiKey: string;

  protected webservice = axios.create({
    baseURL: 'http://2captcha.com',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  constructor() {
    this.apiKey = process.env.API_KEY_2CAPTCHA;

    if (this.apiKey == null) {
      throw new Error('A valid 2Captcha api key must be provided');
    }
  }

  async resolveReCaptchaV2(googleKey: string, pageUrl?: string): Promise<string | null> {
    const submit = await this.webservice.postForm('/in.php', {
      key: this.apiKey,
      method: 'userrecaptcha',
      json: 1,
      pageurl: pageUrl,
      googlekey: googleKey
    });

    if (submit.data?.status !== 1) {
      throw new Error(`[${submit.data.request as string}] ${submit.data?.error_text as string}`);
    }

    return await this.retrieve2CaptchaResult(submit.data.request satisfies string);
  }

  private async retrieve2CaptchaResult(requestId: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 5e3));

    const result = await this.webservice.get('/res.php', {
      params: new URLSearchParams({
        key: this.apiKey,
        action: 'get',
        json: '1',
        id: requestId
      })
    });

    if (result.data?.request === 'CAPCHA_NOT_READY') {
      console.log('Captcha not ready. Trying again...');

      return await this.retrieve2CaptchaResult(requestId);
    }

    console.log('Captcha capturado')

    return result?.data?.request;
  }
}
