import React, { useState, useEffect, memo } from 'react';
import styled from 'styled-components';
import { ipcRenderer, clipboard } from 'electron';
import { useSelector, useDispatch } from 'react-redux';
import path from 'path';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fsa from 'fs-extra';
import { promises as fs } from 'fs';
import {
  faCopy,
  faDownload,
  faTachometerAlt,
  faTrash,
  faPlay,
  faToilet,
  faNewspaper,
  faFolder,
  faFire,
  faSort
} from '@fortawesome/free-solid-svg-icons';
import { Select, Tooltip, Button, Switch, Input, Checkbox } from 'antd';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import {
  _getCurrentAccount,
  _getDataStorePath,
  _getInstancesPath,
  _getTempPath
} from '../../../utils/selectors';
import {
  updateDiscordRPC,
  updateHideWindowOnGameLaunch,
  updatePotatoPcMode,
  updateInstanceSortType,
  updateShowNews,
  updateCurseReleaseChannel
} from '../../../reducers/settings/actions';
import { updateConcurrentDownloads } from '../../../reducers/actions';
import { openModal } from '../../../reducers/modals/actions';
import HorizontalLogo from '../../../../ui/HorizontalLogo';
import { extractFace } from '../../../../app/desktop/utils';

const Title = styled.div`
  margin-top: 30px;
  margin-bottom: 5px;
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.palette.text.primary};
  z-index: 1;
  text-align: left;
  -webkit-backface-visibility: hidden;
`;

const Content = styled.div`
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  *:first-child {
    margin-right: 15px;
  }
`;

const PersonalData = styled.div`
  margin-top: 38px;
  width: 100%;
`;

const MainTitle = styled.h1`
  color: ${props => props.theme.palette.text.primary};
  margin: 0 500px 20px 0;
`;

const ProfileImage = styled.img`
  position: relative;
  top: 20px;
  left: 20px;
  background: #212b36;
  width: 50px;
  height: 50px;
`;

const Uuid = styled.div`
  font-size: smaller;
  font-weight: 200;
  color: ${props => props.theme.palette.grey[100]};
  display: flex;
`;

const Username = styled.div`
  font-size: smaller;
  font-weight: 200;
  color: ${props => props.theme.palette.grey[100]};
  display: flex;
`;

const PersonalDataContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  background: ${props => props.theme.palette.grey[900]};
  border-radius: ${props => props.theme.shape.borderRadius};
`;

const LauncherVersion = styled.div`
  margin: 30px 0;
  p {
    text-align: left;
    color: ${props => props.theme.palette.text.third};
    margin: 0 0 0 6px;
  }

  h1 {
    color: ${props => props.theme.palette.text.primary};
  }
`;

const CustomDataPathContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: ${props => props.theme.shape.borderRadius};

  h1 {
    width: 100%;
    font-size: 15px;
    font-weight: 700;
    color: ${props => props.theme.palette.text.primary};
    z-index: 1;
    text-align: left;
  }
`;

function copy(setCopied, copyText) {
  setCopied(true);
  clipboard.writeText(copyText);
  setTimeout(() => {
    setCopied(false);
  }, 500);
}

function dashUuid(UUID) {
  // UUID is segmented into: 8 - 4 - 4 - 4 - 12
  // Then dashes are added between.

  // eslint-disable-next-line
  return `${UUID.substring(0, 8)}-${UUID.substring(8, 12)}-${UUID.substring(
    12,
    16
  )}-${UUID.substring(16, 20)}-${UUID.substring(20, 32)}`;
}

const General = () => {
  /* eslint-disable prettier/prettier */
  const tempPath = useSelector(_getTempPath);
  const dataStorePath = useSelector(_getDataStorePath);
  const instancesPath = useSelector(_getInstancesPath);
  const currentAccount = useSelector(_getCurrentAccount);
  const userData = useSelector(state => state.userData);
  const isPlaying = useSelector(state => state.startedInstances);
  const queuedInstances = useSelector(state => state.downloadQueue);
  const updateAvailable = useSelector(state => state.updateAvailable);
  const showNews = useSelector(state => state.settings.showNews);
  const DiscordRPC = useSelector(state => state.settings.discordRPC);
  const potatoPcMode = useSelector(state => state.settings.potatoPcMode);
  const concurrentDownloads = useSelector(
    state => state.settings.concurrentDownloads
  );
  const curseReleaseChannel = useSelector(
    state => state.settings.curseReleaseChannel
  );
  const hideWindowOnGameLaunch = useSelector(
    state => state.settings.hideWindowOnGameLaunch
  );
  const instanceSortMethod = useSelector(
    state => state.settings.instanceSortOrder
  );
  /* eslint-enable */

  const [dataPath, setDataPath] = useState(userData);
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [moveUserData, setMoveUserData] = useState(false);
  const [deletingInstances, setDeletingInstances] = useState(false);
  const [loadingMoveUserData, setLoadingMoveUserData] = useState(false);
  const [version, setVersion] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [releaseChannel, setReleaseChannel] = useState(null);

  const dispatch = useDispatch();

  const disableInstancesActions =
    Object.keys(queuedInstances).length > 0 ||
    Object.keys(isPlaying).length > 0;

  useEffect(() => {
    ipcRenderer.invoke('getAppVersion').then(setVersion).catch(console.error);
    extractFace(currentAccount.skin).then(setProfileImage).catch(console.error);
    ipcRenderer
      .invoke('getAppdataPath')
      .then(appData =>
        fsa
          .readFile(path.join(appData, 'oxlauncher', 'rChannel'))
          .then(v => setReleaseChannel(parseInt(v.toString(), 10)))
          .catch(() => setReleaseChannel(0))
      )
      .catch(console.error);
  }, []);

  const clearSharedData = async () => {
    setDeletingInstances(true);
    try {
      await fsa.emptyDir(dataStorePath);
      await fsa.emptyDir(instancesPath);
      await fsa.emptyDir(tempPath);
    } catch (e) {
      console.error(e);
    }
    setDeletingInstances(false);
  };

  const changeDataPath = async () => {
    setLoadingMoveUserData(true);
    const appData = await ipcRenderer.invoke('getAppdataPath');
    const appDataPath = path.join(appData, 'oxlauncher');

    const notCopiedFiles = [
      'Cache',
      'Code Cache',
      'Dictionaries',
      'GPUCache',
      'Cookies',
      'Cookies-journal'
    ];
    await fsa.writeFile(path.join(appDataPath, 'override.data'), dataPath);

    if (moveUserData) {
      try {
        const files = await fs.readdir(userData);
        await Promise.all(
          files.map(async name => {
            if (!notCopiedFiles.includes(name)) {
              await fsa.copy(
                path.join(userData, name),
                path.join(dataPath, name),
                {
                  overwrite: true
                }
              );
            }
          })
        );
      } catch (e) {
        console.error(e);
      }
    }
    setLoadingMoveUserData(false);
    await ipcRenderer.invoke('appRestart');
  };

  const openFolder = async () => {
    const { filePaths, canceled } = await ipcRenderer.invoke(
      'openFolderDialog',
      userData
    );
    if (!filePaths[0] || canceled) return;
    setDataPath(filePaths[0]);
  };

  return (
    <>
      <PersonalData>
        <MainTitle>Общие</MainTitle>
        <PersonalDataContainer>
          <ProfileImage
            src={profileImage ? `data:image/jpeg;base64,${profileImage}` : null}
          />
          <div
            css={`
              margin: 20px 20px 20px 40px;
              width: 330px;
              * {
                text-align: left;
              }
            `}
          >
            <div>
              Никнейм <br />
              <Username>{currentAccount.selectedProfile.name}</Username>
            </div>
            <div>
              UUID
              <br />
              <Uuid>
                {dashUuid(currentAccount.selectedProfile.id)}
                <Tooltip title={copiedUuid ? 'Copied' : 'Copy'} placement="top">
                  <div
                    css={`
                      width: 13px;
                      height: 14px;
                      margin: 0 0 0 10px;
                    `}
                  >
                    <FontAwesomeIcon
                      icon={faCopy}
                      onClick={() =>
                        copy(
                          setCopiedUuid,
                          dashUuid(currentAccount.selectedProfile.id)
                        )
                      }
                    />
                  </div>
                </Tooltip>
              </Uuid>
            </div>
          </div>
        </PersonalDataContainer>
      </PersonalData>
      <Title>
        Одновременные загрузки &nbsp; <FontAwesomeIcon icon={faTachometerAlt} />
      </Title>
      <Content>
        <p>
          Выберите количество одновременных загрузок в лаунчере. Если у вас
          медленное подключение, выберите не больше 3-х.
        </p>
        <Select
          onChange={v => dispatch(updateConcurrentDownloads(v))}
          value={concurrentDownloads}
          css={`
            width: 70px;
            text-align: start;
          `}
          virtual={false}
        >
          {[...Array(20).keys()]
            .map(x => x + 1)
            .map(x => (
              <Select.Option key={x} value={x}>
                {x}
              </Select.Option>
            ))}
        </Select>
      </Content>
      <Title>
        Сортировка сборок &nbsp; <FontAwesomeIcon icon={faSort} />
      </Title>
      <Content>
        <p
          css={`
            margin: 0;
            width: 400px;
          `}
        >
          Выберите, каким образом будут отсортированы сборки на главном экране.
        </p>

        <Select
          onChange={v => dispatch(updateInstanceSortType(v))}
          value={instanceSortMethod}
          css={`
            width: 136px;
            text-align: start;
          `}
        >
          <Select.Option value={0}>По Алфавиту</Select.Option>
          <Select.Option value={1}>Последние</Select.Option>
          <Select.Option value={2}>Часто запускаемые</Select.Option>
        </Select>
      </Content>
      <Title>
        Предпочитаемый канал релизов &nbsp; <FontAwesomeIcon icon={faFire} />
      </Title>
      <Content>
        <p>
          Выберите предпочитаемые версии загрузок для модпаков CurseForge.
          Это также касается и обновлений модификаций.
        </p>
        <Select
          css={`
            width: 100px;
            text-align: start;
          `}
          onChange={e => dispatch(updateCurseReleaseChannel(e))}
          value={curseReleaseChannel}
          virtual={false}
        >
          <Select.Option value={1}>Релиз</Select.Option>
          <Select.Option value={2}>Бета</Select.Option>
          <Select.Option value={3}>Альфа</Select.Option>
        </Select>
      </Content>
      <Title>
        Спрятать лаунчер во время игры &nbsp; <FontAwesomeIcon icon={faPlay} />
      </Title>
      <Content>
        <p>
          Автоматически скрывать окно лаунчера во время игры. Вы всё
          ещё сможете его открыть из системного трея.
        </p>
        <Switch
          onChange={e => {
            dispatch(updateHideWindowOnGameLaunch(e));
          }}
          checked={hideWindowOnGameLaunch}
        />
      </Content>
      <Title>
        Режим "Картошка" &nbsp; <FontAwesomeIcon icon={faToilet} />
      </Title>
      <Content>
        <p>
          Слабый пк? Включите эту настройку, и мы уберем все тяжелые анимации для Вас.
        </p>
        <Switch
          onChange={e => {
            dispatch(updatePotatoPcMode(e));
          }}
          checked={potatoPcMode}
        />
      </Content>
      <Title>
        Очистить данные сборок&nbsp; <FontAwesomeIcon icon={faTrash} />
      </Title>
      <Content>
        <p>
          Удалить все сохранённые данные сборок. Внимание! Эта кнопка удалит
          ВСЕ сохранённые параметры.
        </p>
        <Button
          onClick={() => {
            dispatch(
              openModal('Подтверждение', {
                message: 'Вы уверены, что хотите удалить сохранённые?',
                confirmCallback: clearSharedData,
                title: 'Подтвердить'
              })
            );
          }}
          disabled={disableInstancesActions}
          loading={deletingInstances}
        >
          Очистить
        </Button>
      </Content>
      <Title>
        Папка с пользовательскими данными&nbsp; <FontAwesomeIcon icon={faFolder} />
        <a
          css={`
            margin-left: 30px;
          `}
          onClick={async () => {
            const appData = await ipcRenderer.invoke('getAppdataPath');
            const appDataPath = path.join(appData, 'oxlauncher');
            setDataPath(appDataPath);
          }}
        >
          Сбросить путь
        </a>
      </Title>
      <CustomDataPathContainer>
        <div
          css={`
            display: flex;
            justify-content: space-between;
            text-align: left;
            width: 100%;
            height: 30px;
            margin-bottom: 10px;
            p {
              text-align: left;
              color: ${props => props.theme.palette.text.third};
            }
          `}
        >
          <Input
            value={dataPath}
            onChange={e => setDataPath(e.target.value)}
            disabled={
              loadingMoveUserData ||
              deletingInstances ||
              disableInstancesActions
            }
          />
          <Button
            css={`
              margin-left: 20px;
            `}
            onClick={openFolder}
            disabled={loadingMoveUserData || deletingInstances}
          >
            <FontAwesomeIcon icon={faFolder} />
          </Button>
          <Button
            css={`
              margin-left: 20px;
            `}
            onClick={changeDataPath}
            disabled={
              disableInstancesActions ||
              userData === dataPath ||
              !dataPath ||
              dataPath.length === 0 ||
              deletingInstances
            }
            loading={loadingMoveUserData}
          >
            Применить и перезапустить
          </Button>
        </div>
        <div
          css={`
            display: flex;
            justify-content: flex-start;
            width: 100%;
          `}
        >
          <Checkbox
            onChange={e => {
              setMoveUserData(e.target.checked);
            }}
          >
            Копировать текущие данные в новую папку
          </Checkbox>
        </div>
      </CustomDataPathContainer>
      <LauncherVersion>
        <div
          css={`
            display: flex;
            justify-content: flex-start;
            align-items: center;
            margin: 10px 0;
          `}
        >
          <HorizontalLogo
            size={200}
            onClick={() => dispatch(openModal('ChangeLogs'))}
          />{' '}
          <div
            css={`
              margin-left: 10px;
            `}
          >
            v {version}
          </div>
        </div>
        <p>
          {updateAvailable
            ? 'Доступно обновление лаунчера. Нажмите на кнопку Обновить, чтобы загрузить актуальную версию лаунчера'
            : 'У вас установлена актуальная версия лаунчера.'}
        </p>
        <div
          css={`
            margin-top: 20px;
            height: 36px;
            display: flex;
            flex-direction: row;
          `}
        >
          {updateAvailable ? (
            <Button
              onClick={() =>
                ipcRenderer.invoke('installUpdateAndQuitOrRestart')
              }
              css={`
                margin-right: 10px;
              `}
              type="primary"
            >
              Обновить &nbsp;
              <FontAwesomeIcon icon={faDownload} />
            </Button>
          ) : (
            <div
              css={`
                width: 96px;
                height: 36px;
                padding: 6px 8px;
              `}
            >
              Нет обновлений
            </div>
          )}
        </div>
      </LauncherVersion>
    </>
  );
};

export default memo(General);
