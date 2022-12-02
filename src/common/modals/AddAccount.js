import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { Input, Button, Menu } from 'antd';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from '../components/Modal';
import { load } from '../reducers/loading/actions';
import features from '../reducers/loading/features';
import { login, loginOAuth } from '../reducers/actions';
import { closeModal } from '../reducers/modals/actions';
import { ACCOUNT_MICROSOFT, ACCOUNT_OFFLINE } from '../utils/constants';

const AddAccount = ({ username }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState(username || '');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState(ACCOUNT_OFFLINE);
  const [loginFailed, setloginFailed] = useState();

  const addAccount = () => {
    dispatch(
      load(features.mcAuthentication, dispatch(login(email, password, false)))
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

  const renderAddMojangAccount = () => (
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
        <StyledButton onClick={addAccount}>Добавить</StyledButton>
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
            key={ACCOUNT_OFFLINE}
            onClick={() => setAccountType(ACCOUNT_OFFLINE)}
          >
            Без пароля
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
        </Menu>
        {accountType === ACCOUNT_OFFLINE ? renderAddMojangAccount() : null}
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
