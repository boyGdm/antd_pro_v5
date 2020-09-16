import { Checkbox, Form, Input, Button, Row, Col,message } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, Dispatch, useModel,history } from 'umi';
import logo from '@/assets/logo.svg';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { getFakeCaptcha,fakeAccountLogin } from '@/services/login';
import Footer from '@/components/Footer';
import { setStore } from '@/utils/utils';
import styles from './style.less';

interface UsersTypes {
  codeRes: {
    captcha: string;
    captchaKey: string;
  };
  userinfo: {
    nickname: string;
  };
  token: string;
  loading: boolean;
}
interface LoginPropsType {
  dispatch: Dispatch;
  users: UsersTypes;
}
interface LoginParamsType {
  username: string;
  password: string;
  captcha: string;
  captchaKey: string;
}
const Login: React.FC<LoginPropsType> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { initialState, setInitialState } = useModel('@@initialState');
  const [captcha, setcaptcha] = useState<string>('');
  const [autoLogin, setAutoLogin] = useState<boolean>(true);
  const [captchaKey, setCaptchaKey] = useState<string>('');

  const onFinish = async (values: LoginParamsType) => {
    setLoading(true);
    try{
      const res = await fakeAccountLogin({ ...values,captchaKey });
      if(res.code === 0 && initialState){
        message.success(res.msg?res.msg:'登录成功！');
        setStore('token',res.data.token);
        setStore('userinfo',JSON.stringify(res.data.userinfo));
        const currentUser = await initialState?.fetchUserInfo();
        setInitialState({
          ...initialState,
          currentUser,
        });
        setTimeout(() => {
          const { query } = history.location;
          const { redirect } = query as { redirect: string};
          if(!redirect){
            history.replace('/');
            return;
          }
            // (history as History).replace(redirect);
          window.location.href = redirect;
        }, 1000);
      }
      if(res.code ===1){
        message.error(res.msg?res.msg:'');
      }

    } catch(error){
      message.error('登录失败，请重试！');
    }
    setLoading(false);
  };
  const getCaptchats = () => {
    getFakeCaptcha().then((res) => {
      if (res.code === 0) {
        setcaptcha(res.data.captcha);
        setCaptchaKey(res.data.captchaKey);
      }
    });
  };
  useEffect(() =>{
    getCaptchats();
  },[])
  const captchaFlash = () => {
    getCaptchats();
  };
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <img alt="logo" className={styles.logo} src={logo} />
              <span className={styles.title}>Ant Design</span>
            </Link>
          </div>
          <div className={styles.desc}>Salmontech</div>
        </div>

        <div className={styles.main}>
          <Form
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item name="username" rules={[{ required: true, message: '用户名不能为空' }]}>
              <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '密码不能为空!' }]}>
              <Input prefix={<LockOutlined />} type="password" placeholder="请输入密码" />
            </Form.Item>
            <Form.Item name="captcha" rules={[{ required: true, message: '验证码不能为空!' }]}>
              <Row gutter={8}>
                <Col span={16}>
                  <Input prefix={<LockOutlined />} placeholder="请输入验证码" />
                </Col>
                <Col span={8}>
                  <img
                    src={captcha}
                    className={styles.captcha}
                    alt={captcha}
                    onClick={captchaFlash}
                  />
                </Col>
              </Row>
            </Form.Item>
            <div className={styles.setbox}>
              <Checkbox checked={autoLogin} onChange={(e) => setAutoLogin(e.target.checked)}>
                自动登录
              </Checkbox>
              <a
                style={{
                  float: 'right',
                }}
              >
                忘记密码
              </a>
            </div>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="login-form-button"
              >
                提交
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      <Footer />
    </div>
  );
};


export default Login;
