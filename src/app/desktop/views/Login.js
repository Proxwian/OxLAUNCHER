import React, { useState, useEffect, memo } from 'react';
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
import { login, loginOAuth } from '../../../common/reducers/actions';
import { load, requesting } from '../../../common/reducers/loading/actions';
import features from '../../../common/reducers/loading/features';
import backgroundVideo from '../../../common/assets/background.mp4';
import HorizontalLogo from '../../../ui/HorizontalLogo';
import { openModal } from '../../../common/reducers/modals/actions';

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
    margin: 10px 0;
  }
  p {
    margin-top: 1em;
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
        load(features.mcAuthentication, dispatch(login(email)))
      ).catch(e => {
        console.error(e);
        setLoginFailed(e);
        setPassword(null);
      });
    }, 1000);
  };

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
              <a href="https://oxlauncher.ru"><HorizontalLogo size={200} /></a>
            </Header>
            <Form>
              <div>
                <Input
                  placeholder="Никнейм"
                  value={email}
                  onChange={({ target: { value } }) => setEmail(value)}
                />
              </div>
              {loginFailed && (
                <LoginFailMessage>{loginFailed?.message}</LoginFailMessage>
              )}
              <LoginButton color="primary" onClick={authenticate}>
                Войти
                <FontAwesomeIcon
                  css={`
                    margin-left: 6px;
                  `}
                  icon={faArrowRight}
                />
              </LoginButton>
              <MicrosoftLoginButton
                color="primary"
                onClick={authenticateMicrosoft}
              >
                Microsoft
                <FontAwesomeIcon
                  css={`
                    margin-left: 6px;
                  `}
                  icon={faExternalLinkAlt}
                />
              </MicrosoftLoginButton>
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
                  <a onClick={() => dispatch(openModal('ChangeLogs'))}>v. 1.2.2</a>
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
