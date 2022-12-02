import React, { useState, useEffect, memo, useMemo } from 'react';
import styled from 'styled-components';
import { Spin, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import { _getAccounts, _getCurrentAccount } from '../utils/selectors';
import { openModal, closeModal } from '../reducers/modals/actions';
import {
  updateCurrentAccountId,
  loginWithAccessToken,
  updateAccount,
  removeAccount,
  loginWithOAuthAccessToken
} from '../reducers/actions';
import { load } from '../reducers/loading/actions';
import features from '../reducers/loading/features';
import { ACCOUNT_MICROSOFT, ACCOUNT_OFFLINE } from '../utils/constants';
import { extractFace } from '../../app/desktop/utils';

const ProfileSettings = () => {
  const dispatch = useDispatch();
  const accounts = useSelector(_getAccounts);
  const currentAccount = useSelector(_getCurrentAccount);
  const isLoading = useSelector(state => state.loading.accountAuthentication);

  useEffect(() => {
    accounts.map(async account => {
      account.skinFace = await extractFace(account.skin);
    })
  }, [accounts]);

  return (
    <Modal
      css={`
        height: 70%;
        width: 400px;
        max-height: 700px;
      `}
      title="Менеджер профилей"
    >
      <Container>
        <AccountsContainer>
          {accounts.map(account => {
            if (!account || !currentAccount) return;
            return (
              <AccountContainer key={account.selectedProfile.id}>
                <AccountItem
                  active={
                    account.selectedProfile.id ===
                    currentAccount.selectedProfile.id
                  }
                  onClick={() => {
                    if (
                      isLoading.isRequesting ||
                      account.selectedProfile.id ===
                        currentAccount.selectedProfile.id
                    ) {
                      return;
                    }
                    const currentId = currentAccount.selectedProfile.id;
                    dispatch(
                      updateCurrentAccountId(account.selectedProfile.id)
                    );
                    if (account.accountType != ACCOUNT_OFFLINE) {
                      dispatch(
                        load(
                          features.mcAuthentication,
                          dispatch(
                            account.accountType === ACCOUNT_MICROSOFT
                              ? loginWithOAuthAccessToken(false)
                              : loginWithAccessToken(false)
                          )
                        )
                      ).catch(() => {
                        dispatch(updateCurrentAccountId(currentId));
                        dispatch(
                          updateAccount(account.selectedProfile.id, {
                            ...account,
                            accessToken: null
                          })
                        );
                        message.error('Аккаунт недействителен.');
                      });
                    }
                  }}
                >
                  <div>
                   {(account.accountType === ACCOUNT_MICROSOFT) && (
                    
                    <img
                      src={`data:image/jpeg;base64,${account.skinFace}`}
                      css={`
                        width: 15px;
                        cursor: pointer;
                        height: 15px;
                        margin-right: 10px;
                      `}
                      alt="profile"
                    />
                   )}
                    {account.selectedProfile.name}   
                  </div>
                  {account.selectedProfile.id ===
                    currentAccount.selectedProfile.id && (
                    <Spin spinning={isLoading.isRequesting} />
                  )}
                </AccountItem>
                <div
                  css={`
                    margin-left: 10px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: color 0.1s ease-in-out;
                    &:hover {
                      color: ${props => props.theme.palette.error.main};
                    }
                  `}
                >
                  <FontAwesomeIcon
                    onClick={async () => {
                      const result = await dispatch(
                        removeAccount(account.selectedProfile.id)
                      );
                      if (!result) {
                        dispatch(closeModal());
                      }
                    }}
                    icon={faTrash}
                  />
                </div>
              </AccountContainer>
            );
          })}
        </AccountsContainer>
        <AccountContainer>
          <AccountItem onClick={() => dispatch(openModal('AddAccount'))}>
            Добавить профиль
          </AccountItem>
        </AccountContainer>
      </Container>
    </Modal>
  );
};

export default ProfileSettings;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-content: space-between;
`;

const AccountItem = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  flex: 1;
  justify-content: space-between;
  height: 40px;
  padding: 0 10px;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  ${props =>
    props.active ? `background: ${props.theme.palette.primary.main};` : ''}
  transition: background 0.1s ease-in-out;
  &:hover {
    ${props =>
      props.active ? '' : `background: ${props.theme.palette.grey[600]};`}
  }
`;

const HoverContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  left: 0;
  align-items: center;
  cursor: pointer;
  font-size: 18px;
  font-weight: 800;
  border-radius: 4px;
  transition: opacity 150ms ease-in-out;
  width: 100%;
  height: 100%;
  opacity: 0;
  backdrop-filter: blur(4px);
  will-change: opacity;
  &:hover {
    opacity: 1;
  }
`;

const AccountsContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  padding-right: 2px;
`;

const AccountContainer = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;
