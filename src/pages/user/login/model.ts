import { setStore } from '@/utils/utils';
import { Effect, history, Reducer } from 'umi';
import { message } from 'antd';
import { parse } from 'qs';
import { fakeAccountLogin } from '@/services/login';


export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

export function setAuthority(authority: string | string[]) {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  localStorage.setItem('antd-pro-authority', JSON.stringify(proAuthority));
  // hard code
  // reload Authorized component
  try {
    if ((window as any).reloadAuthorized) {
      (window as any).reloadAuthorized();
    }
  } catch (error) {
    // do not need do anything
  }

  return authority;
}

export interface StateType {
  loading?: false,
  currentAuthority?: string;
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'users',

  state: {
    loading: false,
    currentAuthority: 'admin'
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(fakeAccountLogin, payload);

      const { code, msg, data } = response
      if (code === 1) {
        message.error(msg); return;
      }
      setStore('userinfo', JSON.stringify(data.userinfo));
      setStore('token', data.token);

      yield put({
        type: 'changeLoginStatus',
        payload: data,
      });
      // Login successfully
      if (response.code === 0) {
        message.success(response.msg ? response.msg : '登录成功！');
        setTimeout(() => {
          const urlParams = new URL(window.location.href);
          const params = getPageQuery();
          let { redirect } = params as { redirect: string };
          if (redirect) {
            const redirectUrlParams = new URL(redirect);
            if (redirectUrlParams.origin === urlParams.origin) {
              redirect = redirect.substr(urlParams.origin.length);
              if (redirect.match(/^\/.*#/)) {
                redirect = redirect.substr(redirect.indexOf('#') + 1);
              }
            } else {
              window.location.href = redirect;
              return;
            }
          }
          history.push(redirect || '/');
        }, 1000);
      }
    },


  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority((state as any).currentAuthority as string);
      return {
        ...state,
        ...payload
      };
    },
  },
};

export default Model;
