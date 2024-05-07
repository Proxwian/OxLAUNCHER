import React, { useState, useEffect, memo } from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Transition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import { Input, Button } from 'antd';
import { useKey } from 'rooks';
import { loginOffline, loginMojang, loginElyBy, loginOx, loginOAuth } from '../../../common/reducers/actions';
import { load, requesting } from '../../../common/reducers/loading/actions';
import features from '../../../common/reducers/loading/features';
import backgroundVideo from '../../../common/assets/background.mp4';
import HorizontalLogo from '../../../ui/HorizontalLogo';
import { openModal } from '../../../common/reducers/modals/actions';
import { BACKEND_SERVERS, OXAUTH_REGISTER_URL, ELYBY_REGISTER_URL } from '../../../common/utils/constants';

const { shell } = require('electron');

const LoginButton = styled(Button)`
  border-radius: 4px;
  font-size: 22px;
  background: ${props =>
    props.active ? props.theme.palette.grey[600] : 'transparent'};
  border: 0;
  height: auto;
  margin-top: 20px;
  text-align: center;
  color: ${props => props.theme.palette.text.primary};
  &:hover {
    color: ${props => props.theme.palette.text.primary};
    background: ${props => props.theme.palette.grey[600]};
  }
  &:focus {
    color: ${props => props.theme.palette.text.primary};
    background: ${props => props.theme.palette.grey[600]};
  }
`;

const MicrosoftLoginButton = styled(LoginButton)`
  margin-top: 10px;
`;

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
`;

const LeftSide = styled.div`
  position: relative;
  width: 300px;
  padding: 40px;
  height: 100%;
  transition: 0.3s ease-in-out;
  transform: translateX(
    ${({ transitionState }) =>
      transitionState === 'entering' || transitionState === 'entered'
        ? -300
        : 0}px
  );
  background: ${props => props.theme.palette.secondary.main};
  & div {
    margin: 5px 0;
  }
  p {
    padding-left: 5px;
    margin-bottom: 2px;
    margin-top: 10px;
    color: ${props => props.theme.palette.text.third};
  }
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  margin: 20px 0 !important;
`;

const Background = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  video {
    transition: 0.3s ease-in-out;
    transform: translateX(
      ${({ transitionState }) =>
        transitionState === 'entering' || transitionState === 'entered'
          ? -300
          : 0}px
    );
    position: absolute;
    z-index: -1;
    height: 150%;
    top: -30%;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const Footer = styled.div`
  position: absolute;
  bottom: 4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: calc(100% - 80px);
`;

const FooterLinks = styled.div`
  font-size: 0.75rem;
  margin: 0 !important;
  a {
    color: ${props => props.theme.palette.text.third};
  }
  a:hover {
    color: ${props => props.theme.palette.text.secondary};
  }
`;

const Loading = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  z-index: -1;
  justify-content: center;
  backdrop-filter: blur(8px) brightness(60%);
  font-size: 40px;
  transition: 0.3s ease-in-out;
  opacity: ${({ transitionState }) =>
    transitionState === 'entering' || transitionState === 'entered' ? 1 : 0};
`;
const LoginFailMessage = styled.div`
  color: ${props => props.theme.palette.colors.red};
`;

const Login = () => {
  const dispatch = useDispatch();
  const [selectedBackend, setSelectedBackend] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [version, setVersion] = useState(null);
  const [loginFailed, setLoginFailed] = useState(false);
  const loading = useSelector(
    state => state.loading.accountAuthentication.isRequesting
  );

  const authenticate = () => {
    if (!email) return;
    dispatch(requesting('accountAuthentication'));
    setTimeout(() => {
      dispatch(
        load(features.mcAuthentication, dispatch(authSelectedBackend))
      ).catch(e => {
        console.error(e);
        setLoginFailed(e);
        setPassword(null);
      });
    }, 1000);
  };

  const registerOx = () => {
    shell.openExternal(OXAUTH_REGISTER_URL)
  }

  const registerElyBy = () => {
    shell.openExternal(ELYBY_REGISTER_URL)
  }

  const authSelectedBackend = () => {
    if (selectedBackend == 'OxAuth') {
      dispatch(loginOx(email, password)).catch(
        e => {
          console.error(e);
          setLoginFailed(e);
        }
      );
    } else if (selectedBackend == 'ElyBy') {
      dispatch(loginElyBy(email, password)).catch(
        e => {
          console.error(e);
          setLoginFailed(e);
        }
      );
    } else if (selectedBackend == 'Offline') {
      dispatch(loginOffline(email)).catch(
        e => {
          console.error(e);
          setLoginFailed(e);
        }
      );
    } else {
      dispatch(loginMojang(email, password)).catch(
        e => {
          console.error(e);
          setLoginFailed(e);
        }
      );
    }
  }

  const authenticateMicrosoft = () => {
    dispatch(requesting('accountAuthentication'));

    setTimeout(() => {
      dispatch(load(features.mcAuthentication, dispatch(loginOAuth()))).catch(
        e => {
          console.error(e);
          setLoginFailed(e);
        }
      );
    }, 1000);
  };

  if (selectedBackend == null) setSelectedBackend("OxAuth");

  useKey(['Enter'], authenticate);

  useEffect(() => {
    ipcRenderer.invoke('getAppVersion').then(setVersion).catch(console.error);
  }, []);

  return (
    <Transition in={loading} timeout={300}>
      {transitionState => (
        <Container>
          <LeftSide transitionState={transitionState}>
            <Header>
              <a href="https://oxlauncher.com"><HorizontalLogo size={200} /></a>
            </Header>
            <Form>
            

            <Select
              css={`
                margin: 0px;
                width: 200px;
              `}
              onChange={v => {
                setSelectedBackend(v);
              }}
              placeholder="OxAUTH"
              virtual={false}
            >
              {Object.entries(BACKEND_SERVERS).map(([k, v]) => (
                <Select.Option
                  title={v}
                  key={k}
                  value={v}
                >
                  {v}
                </Select.Option>
              ))}
            </Select>

            {selectedBackend != 'Mojang' && (
              <p>Авторизация</p> 
            )}

              <div>
                {selectedBackend != 'Mojang' && (
                    <Input
                      placeholder="Никнейм"
                      value={email}
                      onChange={({ target: { value } }) => setEmail(value)}
                    />
                )}

                <br />

                {selectedBackend != 'Offline' & selectedBackend != 'Mojang' ? (
                    <div>
                      <Input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        css={`
                          margin-top: 6px;
                        `}
                        onChange={({ target: { value } }) => setPassword(value)}
                      />
                    </div>
                ) : (null)}

                {selectedBackend != 'Mojang' ? (
                    <LoginButton 
                      color="primary" 
                      onClick={authenticate}
                      css={`
                          margin-top: 6px;
                        `}
                    >
                      Войти
                      <FontAwesomeIcon
                        css={`
                          margin-left: 6px;
                        `}
                        icon={faArrowRight}
                      />
                    </LoginButton>
                ) : (
                  <MicrosoftLoginButton
                    color="primary"
                    onClick={authenticateMicrosoft}
                    css={`
                          margin-top: 0px;
                        `}
                  >
                    Авторизоваться
                    <FontAwesomeIcon
                      css={`
                        margin-left: 6px;
                      `}
                      icon={faExternalLinkAlt}
                    />
                  </MicrosoftLoginButton>
                )}

                {selectedBackend == 'OxAuth' ? (
                  <LoginButton 
                      color="primary" 
                      onClick={registerOx}
                      css={`
                          margin-top: 2px;
                        `}
                    >
                      Регистрация
                      <FontAwesomeIcon
                        css={`
                          margin-left: 6px;
                        `}
                        icon={faExternalLinkAlt}
                      />
                    </LoginButton>
                ) : (null)}

                {selectedBackend == 'ElyBy' ? (
                  <LoginButton 
                      color="primary" 
                      onClick={registerElyBy}
                      css={`
                          margin-top: 2px;
                        `}
                    >
                      Регистрация
                      <FontAwesomeIcon
                        css={`
                          margin-left: 6px;
                        `}
                        icon={faExternalLinkAlt}
                      />
                    </LoginButton>
                ) : (null)}
                </div>
              
              {loginFailed && (
                <LoginFailMessage>{loginFailed?.message}</LoginFailMessage>
              )}
              
            </Form>
            
            <Footer>
              <div
                css={`
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-end;
                  width: 100%;
                `}
              >
                <center>
                  <a onClick={() => dispatch(openModal('ChangeLogs'))}>v. 1.4.4</a>
                </center>
              </div>
              <div
                css={`
                  margin-top: 20px;
                  font-size: 10px;
                  display: flex;
                  width: 100%;
                  text-align: center;
                  flex-direction: row;
                  span {
                    text-decoration: underline;
                    cursor: pointer;
                  }
                `}
              >
                
              </div>
            </Footer>
          </LeftSide>
          <Background transitionState={transitionState}>
            <video autoPlay muted loop>
              <source src={backgroundVideo} type="video/mp4" />
            </video>
          </Background>
          <Loading transitionState={transitionState}>Загрузка...</Loading>
        </Container>
      )}
    </Transition>
  );
};

export default memo(Login);
