import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import puppeteer, { type Protocol as PuppeteerProtocol } from 'puppeteer';

import TwoCaptchaApi from './2Captcha';
import CacheUtil from '../utils/Cache';
import type SilverClient from '../SilverClient';

interface ICredentials {
  username: string;
  password: string;
}

export default class DataProApi {
  protected storage = new CacheUtil();
  protected sessionKey = 'auth_cookie';
  protected credentials: ICredentials | Record<string, string> = {};

  protected webservice = axios.create({
    baseURL: 'https://painelempresarial.business',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: this.jsonCookieToString ?? '' },

    withCredentials: true,
    xsrfCookieName: 'csrftoken'
  });

  protected authInterceptor = this.webservice.interceptors.request.use(async (config) => {
    const userInfo = await axios.get(`${this.webservice.defaults.baseURL as string}/user_info`, {
      headers: config.headers
    });

    if (userInfo.data?.erro === 'unauthenticated') {
      await this.regenerateAccessCookies();

      this.webservice.defaults.headers.common.Cookie = config.headers.Cookie = this.jsonCookieToString;
    }

    return config;
  });

  constructor(public client: SilverClient) {
    this.credentials.username = process.env.DATA_PRO_USERNAME ?? null;
    this.credentials.password = process.env.DATA_PRO_PASSWORD ?? null;

    if (this.credentials.username == null || this.credentials.password == null) {
      throw new Error('Username and password must be provided');
    }
  }

  get currentSession(): PuppeteerProtocol.Network.Cookie[] {
    return this.storage.get(this.sessionKey);
  }

  private get jsonCookieToString(): string {
    return this.currentSession?.map((c) => `${c.name}=${c.value}`).join('; ');
  }

  async post(url: string, data?: Record<string, string>, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return await this.webservice.post(
      url,
      data,
      config ?? {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return await this.webservice.get(url, config);
  }

  // Auth
  async regenerateAccessCookies(): Promise<PuppeteerProtocol.Network.Cookie[]> {
    this.webservice.interceptors.request.eject(this.authInterceptor);

    const loginUrl = `${this.webservice.defaults.baseURL as string}/login`;
    const loginPageHtml = await axios.get(loginUrl);

    const [, googleKey] = /class="g-recaptcha.*" data-sitekey="([\w-]+)"/gim.exec(loginPageHtml.data) ?? [];
    if (googleKey == null) throw new Error(`Cannot retrieve googleReCaptchaSiteKey from ${loginUrl}`);

    const reCaptchaToken = await new TwoCaptchaApi().resolveReCaptchaV2(googleKey, loginUrl);
    if (reCaptchaToken == null) throw new Error(`Cannot resolve captcha from ${loginUrl}`);

    const browser = await puppeteer.launch({ headless: 'new', slowMo: 10 });
    const page = await browser.newPage();

    await page.goto(loginUrl);

    await page.type('#username', this.credentials.username);
    await page.type('#password', this.credentials.password);

    await page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML="${reCaptchaToken}";`);

    await page.click('#login_btn');

    const cookies = await page.cookies();

    await browser.close();

    this.storage.set(this.sessionKey, cookies);

    return cookies;
  }
}
