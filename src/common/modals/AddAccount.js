import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { Input, Button, Menu } from 'antd';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from '../components/Modal';
import { load } from '../reducers/loading/actions';
import features from '../reducers/loading/features';
import { login, loginElyBy, loginOAuth, loginOffline, loginOx } from '../reducers/actions';
import { closeModal } from '../reducers/modals/actions';
import { shell } from 'electron';
import { ACCOUNT_ELYBY, ACCOUNT_MICROSOFT, ACCOUNT_OFFLINE, ACCOUNT_OXAUTH, OXAUTH_REGISTER_URL, ELYBY_REGISTER_URL } from '../utils/constants';

const AddAccount = ({ username }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState(username || '');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState(ACCOUNT_OFFLINE);
  const [loginFailed, setloginFailed] = useState();

  const addOfflineAccount = () => {
    dispatch(
      load(features.mcAuthentication, dispatch(loginOffline(email, false)))
    )
      .then(() => dispatch(closeModal()))
      .catch(console.error);
  };

  const addElyByAccount = () => {
    dispatch(
      load(features.mcAuthentication, dispatch(loginElyBy(email, password, false)))
    )
      .then(() => dispatch(closeModal()))
      .catch(console.error);
  };

  const addOxAccount = () => {
    dispatch(
      load(features.mcAuthentication, dispatch(loginOx(email, password, false)))
    )
      .then(() => dispatch(closeModal()))
      .catch(console.error);
  };

  const addMicrosoftAccount = () => {
    dispatch(load(features.mcAuthentication, dispatch(loginOAuth(false))))
      .then(() => dispatch(closeModal()))
      .catch(error => {
        console.error(error);
        setloginFailed(error);
      });
  };

  const renderAddOfflineAccount = () => (
    <Container>
      <FormContainer>
        <h1
          css={`
            height: 80px;
          `}
        >
          Без пароля
        </h1>
        <StyledInput
          disabled={!!username}
          placeholder="Никнейм"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </FormContainer>
      <FormContainer>
        <StyledButton onClick={addOfflineAccount}>Добавить</StyledButton>
      </FormContainer>
    </Container>
  );

  const renderAddElyByAccount = () => (
    <Container>
      <FormContainer>
        <h1
          css={`
            height: 80px;
          `}
        >
          Ely.by
        </h1>
        <StyledInput
          disabled={!!username}
          placeholder="Логин"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <StyledInput
          disabled={!!username}
          placeholder="Пароль"
          value={email}
          onChange={e => setPassword(e.target.value)}
        />
      </FormContainer>
      <FormContainer>
        <StyledButton onClick={addElyByAccount}>Добавить</StyledButton>
        <StyledButton onClick={shell.openExternal(ELYBY_REGISTER_URL)}>Регистрация</StyledButton>
      </FormContainer>
    </Container>
  );

  const renderAddOxAccount = () => (
    <Container>
      <FormContainer>
        <h1
          css={`
            height: 80px;
          `}
        >
          OxAUTH
        </h1>
        <StyledInput
          disabled={!!username}
          placeholder="Логин"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <StyledInput
          disabled={!!username}
          placeholder="Пароль"
          value={email}
          onChange={e => setPassword(e.target.value)}
        />
      </FormContainer>
      <FormContainer>
        <StyledButton onClick={addOxAccount}>Добавить</StyledButton>
        <StyledButton onClick={shell.openExternal(OXAUTH_REGISTER_URL)}>Регистрация</StyledButton>
      </FormContainer>
    </Container>
  );

  const renderAddMicrosoftAccount = () => (
    <Container>
      <FormContainer>
        <h1
          css={`
            height: 80px;
          `}
        >
          Вход через Microsoft
        </h1>
        <FormContainer>
          <h2>Внешняя авторизация</h2>
          {loginFailed ? (
            <>
              <LoginFailMessage>{loginFailed?.message}</LoginFailMessage>
              <StyledButton
                css={`
                  margin-top: 12px;
                `}
                onClick={addMicrosoftAccount}
              >
                Повторить
              </StyledButton>
            </>
          ) : (
            <FontAwesomeIcon spin size="3x" icon={faSpinner} />
          )}
        </FormContainer>
      </FormContainer>
    </Container>
  );

  return (
    <Modal
      css={`
        height: 450px;
        width: 420px;
      `}
      title=" "
    >
      <Container>
        <Menu
          mode="horizontal"
          selectedKeys={[accountType]}
          overflowedIndicator={null}
        >
          <StyledAccountMenuItem
            key={ACCOUNT_OXAUTH}
            onClick={() => setAccountType(ACCOUNT_OXAUTH)}
          >
            OxAUTH
          </StyledAccountMenuItem>
          <StyledAccountMenuItem
            key={ACCOUNT_ELYBY}
            onClick={() => setAccountType(ACCOUNT_ELYBY)}
          >
            Ely.by
          </StyledAccountMenuItem>
          
          <StyledAccountMenuItem
            key={ACCOUNT_MICROSOFT}
            onClick={() => {
              setAccountType(ACCOUNT_MICROSOFT);
              addMicrosoftAccount();
            }}
          >
            Microsoft
          </StyledAccountMenuItem>
          <StyledAccountMenuItem
            key={ACCOUNT_OFFLINE}
            onClick={() => setAccountType(ACCOUNT_OFFLINE)}
          >
            Без пароля
          </StyledAccountMenuItem>
        </Menu>
        {accountType === ACCOUNT_OXAUTH ? renderAddOxAccount() : null}
        {accountType === ACCOUNT_ELYBY ? renderAddElyByAccount() : null}
        {accountType === ACCOUNT_OFFLINE ? renderAddOfflineAccount() : null}
        {accountType === ACCOUNT_MICROSOFT ? renderAddMicrosoftAccount() : null}
      </Container>
    </Modal>
  );
};

export default AddAccount;

const StyledButton = styled(Button)`
  width: 40%;
`;

const StyledInput = styled(Input)`
  margin-bottom: 20px !important;
`;

const LoginFailMessage = styled.div`
  color: ${props => props.theme.palette.colors.red};
`;

const StyledAccountMenuItem = styled(Menu.Item)`
  width: auto;
  height: auto;
  font-size: 18px;
`;

const FormContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-content: space-between;
  justify-content: center;
`;
