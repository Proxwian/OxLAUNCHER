import React, { useState, useEffect, memo, useMemo } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImages, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { ipcRenderer } from 'electron';
import axios from 'axios';
// import { promises as fs } from 'fs';
// import path from 'path';
import Instances from '../components/Instances';
import News from '../components/News';
import { openModal } from '../../../common/reducers/modals/actions';
import {
  _getCurrentAccount
  // _getInstances
} from '../../../common/utils/selectors';
import { extractFace } from '../utils';
import { updateLastUpdateVersion } from '../../../common/reducers/actions';

import { _getInstances, _getInstancesPath, _getTempPath } from '../../../common/utils/selectors';

import { useDebouncedCallback } from 'use-debounce';
import { ACCOUNT_ELYBY, BOOSTY_PAGE_URL, ACCOUNT_OFFLINE, ACCOUNT_OXAUTH } from '../../../common/utils/constants';



const { shell } = require('electron');

const AddInstanceIcon = styled(Button)`
  position: fixed;
  bottom: 20px;
  left: 20px;
`;

const ShowScreenshotsIcon = styled(Button)`
  position: fixed;
  bottom: 20px;
  left: 75px;
`;

const SupportIcon = styled(Button)`
  position: fixed;
  bottom: 20px;
  background-color: #f15f2c;
  left: 140px;
`;

const AccountContainer = styled(Button)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
`;

const Home = () => {
  const dispatch = useDispatch();
  const account = useSelector(_getCurrentAccount);
  const news = useSelector(state => state.news);
  const lastUpdateVersion = useSelector(state => state.app.lastUpdateVersion);

  const openAddInstanceModal = defaultPage => {
    dispatch(openModal('AddInstance', { defaultPage }));
  };

  const openAccountModal = () => {
    dispatch(openModal('AccountsManager'));
  };

  const [profileImage, setProfileImage] = useState(null);
  const [annoucement, setAnnoucement] = useState(null);

  useEffect(() => {
    const discordRPCDetails = `На главной`;
    ipcRenderer.invoke('update-discord-rpc', discordRPCDetails);
    const init = async () => {
		// setInstalling(false);
		// setInitinstall(false);
      const appVersion = await ipcRenderer.invoke('getAppVersion');
      if (lastUpdateVersion !== appVersion) {
        dispatch(updateLastUpdateVersion(appVersion));
        dispatch(openModal('ChangeLogs'));
      }
      try {
        const { data } = await axios.get(
          'https://raw.githubusercontent.com/Proxwian/OxLAUNCHER/master/announcement.md'
        );
        setAnnoucement(null);
      } catch (e) {
        console.log('No announcement to show');
      }
    };

    init();
  }, []);

  useEffect(() => {
    extractFace(account.skin).then(setProfileImage).catch(console.error);
  }, [account]);

  const openBoosty = () => {
    shell.openExternal(BOOSTY_PAGE_URL)
  }

  return (
    <div>
      {/* <News news={news} /> */}
      {annoucement ? (
        <div
          css={`
            padding: 30px;
            font-size: 18px;
            font-weight: bold;
            color: ${props => props.theme.palette.colors.yellow};
          `}
        >
          {annoucement}
        </div>
      ) : null}
      <Instances
        css={`
          bottom: 20px;
          left: 20px;`
        }/>
      <AddInstanceIcon type="primary" onClick={() => openAddInstanceModal(0)}>
        <FontAwesomeIcon icon={faPlus} />
      </AddInstanceIcon>
      <ShowScreenshotsIcon type="primary" onClick={() => dispatch(openModal('ScreenshotManager'))}>
        <FontAwesomeIcon icon={faImages} />
      </ShowScreenshotsIcon>
      <SupportIcon type="primary" onClick={openBoosty}>
        Boosty
      </SupportIcon>
      <AccountContainer
        type="primary"
        onClick={openAccountModal}
        css={`
          background-color: ${account.accountType == ACCOUNT_OFFLINE ? (`#545454`) : account.accountType == ACCOUNT_OXAUTH ? (`#3c6a5b`) : account.accountType == ACCOUNT_ELYBY ? (`#187c41`) : (`#830d0d`)};
          border-color: ${account.accountType == ACCOUNT_OFFLINE ? (`#545454`) : account.accountType == ACCOUNT_OXAUTH ? (`#3c6a5b`) : account.accountType == ACCOUNT_ELYBY ? (`#187c41`) : (`#830d0d`)};
        `}
      >
        {profileImage && account.accountType !== ACCOUNT_OFFLINE ? (
          <img
            src={`data:image/jpeg;base64,${profileImage}`}
            css={`
              width: 15px;
              cursor: pointer;
              height: 15px;
              margin-right: 10px;
            `}
            alt="profile"
          />
        ) : ""}
        {account && account.selectedProfile.name}
      </AccountContainer>
    </div>
  );
};

export default memo(Home);
