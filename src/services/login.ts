import { request } from 'umi';

export interface LoginParamsType {
  username: string;
  password: string;
  captcha: string;
  captchaKey: string;
}

export async function fakeAccountLogin(params: LoginParamsType) {
  return request<API.LoginStateType>('/manage/login', {
    method: 'POST',
    params,
  });
}

export function getFakeCaptcha() {
  return request('/manage/captcha');
}

export async function outLogin() {
  return request('/manage/logout');
}
