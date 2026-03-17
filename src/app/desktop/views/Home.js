import React, { useState, useEffect, memo, useMemo } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImages, faPlus, faLaugh, faTimes, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal } from 'antd';
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

import { sendAnalyticsEvent } from '../utils/analytics';



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
  position: fixed !important;
  bottom: 20px !important;
  background-color: #f15f2c !important;
  left: 280px !important;
  z-index: 1000 !important;
`;

const AccountContainer = styled(Button)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
`;

const JokeButton = styled(Button)`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`;

const Home = () => {
  const dispatch = useDispatch();
  const account = useSelector(_getCurrentAccount);
  const news = useSelector(state => state.news);
  const lastUpdateVersion = useSelector(state => state.app.lastUpdateVersion);

  const [profileImage, setProfileImage] = useState(null);
  const [annoucement, setAnnoucement] = useState(null);
  const [annoucementLink, setAnnoucementLink] = useState(null);
  const [announcementHidden, setAnnouncementHidden] = useState(false);
  const [lastAnnouncementHash, setLastAnnouncementHash] = useState('');
  const [jokeModalVisible, setJokeModalVisible] = useState(false);
  const [jokeText, setJokeText] = useState('');
  const [jokeLoading, setJokeLoading] = useState(false);

  const openAddInstanceModal = defaultPage => {
    dispatch(openModal('AddInstance', { defaultPage }));
  };

  const openAccountModal = () => {
    dispatch(openModal('AccountsManager'));
  };

  const fetchJoke = async () => {
    setJokeLoading(true);
    try {
      const response = await fetch('https://r.jina.ai/http://www.anekdot.ru/random/anekdot.html');
      const text = await response.text();
      
      if (text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const jokeLines = [];
        let inJoke = false;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          if (line.includes('http://') || line.includes('https://') ||
              line.includes('anekdot.ru') || line.includes('RSS') ||
              line.includes('Telegram') || line.includes('VK') ||
              line.startsWith('Анекдоты') || line.startsWith('Рубрики') ||
              line.startsWith('Темы') || line.startsWith('Конкурсы') ||
              line.startsWith('©') || line.startsWith('Реклама') ||
              line.match(/^\d{2}\.\d{2}\.\d{4}/) ||
              line.match(/^[A-Z]+$/) ||
              line.length < 20) {
            continue;
          }
          
          if (line.match(/[а-яёa-z]/i) && line.match(/[.,!?]/)) {
            if (!inJoke) {
              inJoke = true;
            }
            jokeLines.push(line);
            
            if (jokeLines.join(' ').length > 300) {
              break;
            }
          } else if (inJoke && line.length > 50) {
            jokeLines.push(line);
          } else if (inJoke && line.length < 20) {
            break;
          }
        }
        
        let joke = jokeLines.join('\n\n').trim();
        
        if (!joke || joke.length < 50) {
          let currentChunk = [];
          let bestChunk = [];
          
          for (const line of lines) {
            if (line.length > 40 && !line.includes('http')) {
              currentChunk.push(line);
              if (currentChunk.join(' ').length > bestChunk.join(' ').length) {
                bestChunk = [...currentChunk];
              }
            } else {
              if (currentChunk.length > 0) {
                currentChunk = [];
              }
            }
          }
          
          joke = bestChunk.join('\n\n').trim();
        }
        
        joke = joke.replace(/\s+/g, ' ').replace(/  +/g, ' ').trim();
        
        if (joke.length > 600) {
          joke = joke.substring(0, 600) + '...';
        }
        
        if (joke.length > 30 && joke.length < 1000) {
          setJokeText(joke);
          setJokeModalVisible(true);
        } else {
          setJokeText('Не удалось загрузить анекдот. Попробуйте ещё раз.');
          setJokeModalVisible(true);
        }
      } else {
        setJokeText('Не удалось загрузить анекдот. Попробуйте ещё раз.');
        setJokeModalVisible(true);
      }
    } catch (error) {
      console.error('Error fetching joke:', error);
      setJokeText('Ошибка при загрузке анекдота. Проверьте подключение к интернету.');
      setJokeModalVisible(true);
    } finally {
      setJokeLoading(false);
    }
  };

  useEffect(() => {
      sendAnalyticsEvent(account.selectedProfile.name, account.accountType);
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

        const [url, text] = data.split(" : ");
        
        const hash = data.trim();
        
        if (hash !== lastAnnouncementHash) {
          setAnnouncementHidden(false);
          setLastAnnouncementHash(hash);
          setAnnoucement(text);
          setAnnoucementLink(url);
        } else if (!announcementHidden) {
          setAnnoucement(text);
          setAnnoucementLink(url);
        }
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

  const toggleAnnouncement = () => {
    setAnnouncementHidden(!announcementHidden);
  };

  return (
    <div>
      {/* <News news={news} /> */}
      {!announcementHidden && annoucement && (
        <div
          css={`
            padding: 20px;
            font-size: 18px;
            font-weight: bold;
            color: ${props => props.theme.palette.colors.white};
            display: flex;
            align-items: center;
            justify-content: space-between;
          `}
        >
          <a href={annoucementLink} style={{ flex: 1 }}>{annoucement}</a>
          <Button
            type="text"
            onClick={toggleAnnouncement}
            style={{ marginRight: '50px' }}
            title="Скрыть объявление"
          >
            <FontAwesomeIcon icon={faEyeSlash} />
          </Button>
        </div>
      )}
      
      <JokeButton type="default" onClick={fetchJoke}>
        {jokeLoading ? (
          <FontAwesomeIcon icon={faTimes} size="lg" spin />
        ) : (
          <FontAwesomeIcon icon={faLaugh} size="lg" />
        )}
      </JokeButton>
      
      {announcementHidden && (
        <Button
          type="default"
          onClick={toggleAnnouncement}
          title="Показать объявление"
          css={`
            position: fixed;
            top: 70px;
            right: 20px;
            z-index: 100;
            border-radius: 50%;
            width: 45px;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
          `}
        >
          <FontAwesomeIcon icon={faEye} size="lg" />
        </Button>
      )}
      
      <Modal
        title={
          <span>
            <FontAwesomeIcon icon={faLaugh} style={{ marginRight: '8px', color: '#f15f2c' }} />
            Анекдот дня
          </span>
        }
        open={jokeModalVisible}
        visible={jokeModalVisible}
        onCancel={() => setJokeModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setJokeModalVisible(false)}>
            Закрыть
          </Button>,
          <Button key="another" type="primary" onClick={fetchJoke}>
            {jokeLoading ? (
              <><FontAwesomeIcon icon={faTimes} spin style={{ marginRight: '8px' }} /> Загрузка...</>
            ) : (
              'Ещё один'
            )}
          </Button>
        ]}
        width={500}
        getContainer={() => document.body}
        zIndex={1000}
      >
        <div
          style={{
            fontSize: '15px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {jokeText || 'Загрузка...'}
        </div>
      </Modal>
      
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
      {/* <SupportIcon type="primary" onClick={openBoosty}>
        Boosty
      </SupportIcon> */}
    </div>
  );
};

export default memo(Home);
