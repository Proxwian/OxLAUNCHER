import React, { useState, useEffect, memo } from 'react';
import { transparentize } from 'polished';
import styled, { keyframes } from 'styled-components';
import { promises as fs } from 'fs';
import { LoadingOutlined } from '@ant-design/icons';
import path from 'path';
import { ipcRenderer } from 'electron';
import { Portal } from 'react-portal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faClock,
  faSpinner,
  faWrench,
  faFolder,
  faTrash,
  faStop,
  faBoxOpen,
  faCopy,
  faServer,
  faHammer,
  faImage
} from '@fortawesome/free-solid-svg-icons';
import psTree from 'ps-tree';
import { ContextMenuTrigger, ContextMenu, MenuItem } from 'react-contextmenu';
import { useSelector, useDispatch } from 'react-redux';
import {
  _getInstance,
  _getInstancesPath,
  _getDownloadQueue
} from '../../../../common/utils/selectors';
import {
  addStartedInstance,
  addToQueue,
  launchInstance,
  changeModpackVersion
} from '../../../../common/reducers/actions';
import { openModal } from '../../../../common/reducers/modals/actions';
import instanceDefaultBackground from '../../../../common/assets/instance_default.png';
import { convertMinutesToHumanTime } from '../../../../common/utils';
import { FABRIC, FORGE, VANILLA, QUILT } from '../../../../common/utils/constants';
import { getAddonFileChangelog, getAddonFiles, getAddon } from '../../../../common/api';

const Container = styled.div`
  position: relative;
  width: 180px;
  height: 100px;
  transform: ${p =>
    p.isHovered && !p.installing
      ? 'scale3d(1.1, 1.1, 1.1)'
      : 'scale3d(1, 1, 1)'};
  margin-right: 20px;
  margin-top: 20px;
  transition: transform 150ms ease-in-out;
  &:hover {
    ${p => (p.installing ? '' : 'transform: scale3d(1.1, 1.1, 1.1);')}
  }
`;

const Spinner = keyframes`
  0% {
    transform: translate3d(-50%, -50%, 0) rotate(0deg);
  }
  100% {
    transform: translate3d(-50%, -50%, 0) rotate(360deg);
  }
`;

const PlayButtonAnimation = keyframes`
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const InstanceContainer = styled.div`
  display: flex;
  position: absolute;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
  font-size: 20px;
  overflow: hidden;
  height: 100%;
  background: linear-gradient(0deg, rgba(60, 60, 60, 0.6), rgba(42, 42, 42, 0.6)),
    url('${props => props.background}') center no-repeat;
  background-position: center;
  color: ${props => props.theme.palette.text.secondary};
  font-weight: 600;
  background-size: cover;
  border-radius: 4px;
  margin: 10px;
`;

const HoverContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 18px;
  margin: 10px;
  padding: 10px;
  text-align: center;
  font-weight: 800;
  border-radius: 4px;
  transition: opacity 150ms ease-in-out;
  width: 100%;
  height: 100%;
  opacity: ${p => (p.installing || p.isHovered ? '1' : '0')};
  backdrop-filter: blur(4px);
  will-change: opacity;
  background: ${p => transparentize(0.5, p.theme.palette.grey[800])};
  &:hover {
    opacity: 1;
  }

  .spinner:before {
    animation: 1.5s linear infinite ${Spinner};
    animation-play-state: inherit;
    border: solid 3px transparent;
    border-bottom-color: ${props => props.theme.palette.colors.yellow};
    border-radius: 50%;
    content: '';
    height: 30px;
    width: 30px;
    position: absolute;
    top: 10px;
    transform: translate3d(-50%, -50%, 0);
    will-change: transform;
  }
`;

const MCVersion = styled.div`
  position: absolute;
  right: 5px;
  top: 5px;
  font-size: 11px;
  color: ${props => props.theme.palette.text.third};
`;

const TimePlayed = styled.div`
  position: absolute;
  left: 5px;
  top: 5px;
  font-size: 11px;
  color: ${props => props.theme.palette.text.third};
`;

const MenuInstanceName = styled.div`
  background: ${props => props.theme.palette.grey[800]};
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: ${props => props.theme.palette.text.primary};
  padding: 0 20px;
  font-weight: 700;
`;

const Instance = ({ instanceName }) => {
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const [filesCache, setFilesCache] = useState(false);
  const [isNeedUpdate, setNeedUpdate] = useState(false);
  const [background, setBackground] = useState(`${instanceDefaultBackground}`);
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const downloadQueue = useSelector(_getDownloadQueue);
  const currentDownload = useSelector(state => state.currentDownload);
  const startedInstances = useSelector(state => state.startedInstances);
  const instancesPath = useSelector(_getInstancesPath);
  const isInQueue = downloadQueue[instanceName];

  const isPlaying = startedInstances[instanceName];

  const loadFilesCache = async() => {
    const data = await getAddonFiles(instance?.loader?.projectID);
    const mappedFiles = await Promise.all(
        data.map(async v => {
          const changelog = await getAddonFileChangelog(instance?.loader?.projectID, v.id);
          return {
            ...v,
            changelog
          };
        })
      );
    setFilesCache(mappedFiles);
    if (mappedFiles[0]?.id != null 
      && instance?.loader?.fileID != null 
      && mappedFiles[0]?.id != instance?.loader?.fileID
      && instance?.loader?.projectID != null
      && instance?.loader?.projectID != 0
      && instance?.loader?.projectID != -1
    ) {
      setNeedUpdate(true);
    } else {
      setNeedUpdate(false);
    }
  }

  useEffect(() => {
    if (instance.background) {
      fs.readFile(path.join(instancesPath, instanceName, instance.background))
        .then(res =>
          setBackground(`data:image/png;base64,${res.toString('base64')}`)
        )
        .catch(console.warning);
    } else {
      setBackground(`${instanceDefaultBackground}`);
    }
    loadFilesCache();
  }, [instance.background, instancesPath, instanceName]);

  

  const startInstance = () => {
    if (isInQueue || isPlaying) return;
    dispatch(addStartedInstance({ instanceName }));
    dispatch(launchInstance(instanceName));
  };
  const openFolder = () => {
    ipcRenderer.invoke('openFolder', path.join(instancesPath, instance.name));
  };
  const openConfirmationDeleteModal = () => {
    dispatch(openModal('InstanceDeleteConfirmation', { instanceName }));
  };
  const manageInstance = () => {
    dispatch(openModal('InstanceManager', { instanceName }));
  };
  const updateDatapack = async() => {
    const data = await getAddonFiles(instance?.loader?.projectID);
    const mappedFiles = await Promise.all(
        data.map(async v => {
          const changelog = await getAddonFileChangelog(instance?.loader?.projectID, v.id);
          return {
            ...v,
            changelog
          };
        })
      );
    const finallyUpdate = await dispatch(
        changeModpackVersion(instanceName, mappedFiles[0])
      );
    finallyUpdate;  
    setNeedUpdate(false);  
  }
  const openScreenshots = () => {
    dispatch(openModal('InstanceManager', { instanceName: instanceName, openScreenshots: true }));
  };
  const instanceExportCurseForge = () => {
    dispatch(openModal('InstanceExportCurseForge', { instanceName }));
  };
  const openDuplicateNameDialog = () => {
    dispatch(openModal('InstanceDuplicateName', { instanceName }));
  };
  const killProcess = () => {
    psTree(isPlaying.pid, (err, children) => {
      process.kill(isPlaying.pid);
      if (children?.length) {
        children.forEach(el => {
          if (el) {
            try {
              process.kill(el.PID);
            } catch {
              // No-op
            }
            try {
              process.kill(el.PPID);
            } catch {
              // No-op
            }
          }
        });
      } else {
        try {
          process.kill(isPlaying.pid);
        } catch {
          // No-op
        }
      }
    });
  };

  return (
    <>
      <ContextMenuTrigger id={instanceName}>
        <Container
          css={`
          filter: drop-shadow(0px ${isNeedUpdate ? 8 : 0}px ${isNeedUpdate ? 8 : 0}px #6D4D52);
          `}
          
          installing={isInQueue}
          onClick={startInstance}
          isHovered={isHovered || isPlaying}
        >
          <InstanceContainer installing={isInQueue} background={background}>
            <TimePlayed>
              <FontAwesomeIcon
                icon={faClock}
                css={`
                  margin-right: 5px;
                `}
              />

              {convertMinutesToHumanTime(instance.timePlayed)}
            </TimePlayed>
            <MCVersion>{instance.loader?.mcVersion}</MCVersion>
            {instanceName}
          </InstanceContainer>
          <HoverContainer
            installing={isInQueue}
            isHovered={isHovered || isPlaying}
          >
            {currentDownload === instanceName ? (
              <>
                <div
                  css={`
                    font-size: 14px;
                  `}
                >
                  {isInQueue ? isInQueue.status : null}
                </div>
                {`${isInQueue.percentage}%`}
                <LoadingOutlined
                  css={`
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                  `}
                />
              </>
            ) : (
              <>
                {isPlaying && (
                  <div
                    css={`
                      position: relative;
                      width: 20px;
                      height: 20px;
                    `}
                  >
                    {isPlaying.initialized && (
                      <FontAwesomeIcon
                        css={`
                          color: ${({ theme }) => theme.palette.colors.green};
                          font-size: 27px;
                          position: absolute;
                          margin-left: -6px;
                          margin-top: -2px;
                          animation: ${PlayButtonAnimation} 0.5s
                            cubic-bezier(0.75, -1.5, 0, 2.75);
                        `}
                        icon={faPlay}
                      />
                    )}
                    {!isPlaying.initialized && <div className="spinner" />}
                  </div>
                )}
                {isInQueue && 'В очереди'}
                {!isInQueue && !isPlaying && <span>ИГРАТЬ</span>}
              </>
            )}
          </HoverContainer>
        </Container>
      </ContextMenuTrigger>
      <Portal>
        <ContextMenu
          id={instance.name}
          onShow={() => setIsHovered(true)}
          onHide={() => setIsHovered(false)}
        >
          <MenuInstanceName>{instanceName}</MenuInstanceName>
          {isPlaying && (
            <MenuItem onClick={killProcess}>
              <FontAwesomeIcon
                icon={faStop}
                css={`
                  margin-right: 10px;
                  width: 25px !important;
                `}
              />
              Остановить
            </MenuItem>
          )}
          {Boolean(isNeedUpdate) && (
            <MenuItem disabled={Boolean(isInQueue)}
              css={`
                    color: #6D4D52;
                    `}
              onClick={updateDatapack}>
              <FontAwesomeIcon
                icon={faSpinner}
                css={`
                  color: #6D4D52;
                  margin-right: 10px;
                  width: 25px !important;
                `}
              />
              Обновить
            </MenuItem>
          )}
          <MenuItem disabled={Boolean(isInQueue)} onClick={manageInstance}>
            <FontAwesomeIcon
              icon={faWrench}
              css={`
                margin-right: 10px;
                width: 25px !important;
              `}
            />
            Управление
          </MenuItem>
          <MenuItem disabled={Boolean(isInQueue)} onClick={openScreenshots}>
            <FontAwesomeIcon
              icon={faImage}
              css={`
                margin-right: 10px;
                width: 25px !important;
              `}
            />
            Скриншоты
          </MenuItem>
          <MenuItem onClick={openFolder}>
            <FontAwesomeIcon
              icon={faFolder}
              css={`
                margin-right: 10px;
                width: 25px !important;
              `}
            />
            Открыть папку
          </MenuItem>

          {/* // TODO - Support other export options besides curseforge forge. */}
          <MenuItem
            onClick={instanceExportCurseForge}
            disabled={
              Boolean(isInQueue) ||
              !(
                instance.loader?.loaderType === FORGE ||
                instance.loader?.loaderType === FABRIC ||
                instance.loader?.loaderType === QUILT ||
                instance.loader?.loaderType === VANILLA
              )
            }
          >
            <FontAwesomeIcon
              icon={faBoxOpen}
              css={`
                margin-right: 10px;
                width: 25px !important;
              `}
            />
            Экспорт
          </MenuItem>
          <MenuItem
            disabled={Boolean(isInQueue)}
            onClick={openDuplicateNameDialog}
          >
            <FontAwesomeIcon
              icon={faCopy}
              css={`
                margin-right: 10px;
                width: 25px !important;
              `}
            />
            Дублировать
          </MenuItem>
          <MenuItem divider />
          <MenuItem
            disabled={Boolean(isInQueue) || Boolean(isPlaying)}
            onClick={async () => {
              let manifest = null;
              const isCursePack = await fs
                .stat(path.join(instancesPath, instanceName, 'manifest.json'))
                .then(() => true)
                .catch(() => false);

              if (isCursePack) {
                // CurseForge
                manifest = JSON.parse(
                  await fs.readFile(
                    path.join(instancesPath, instanceName, 'manifest.json')
                  )
                );
              } else {
                // Modrinth
                manifest = JSON.parse(
                  await fs.readFile(
                    path.join(
                      instancesPath,
                      instanceName,
                      'modrinth.index.json'
                    )
                  )
                );
              }

              dispatch(
                addToQueue(
                  instanceName,
                  instance.loader,
                  manifest,
                  instance.background,
                  instance.timePlayed,
                  {},
                  { isUpdate: true }
                )
              );
            }}
          >
            <FontAwesomeIcon
              icon={faHammer}
              css={`
                margin-right: 10px;
                width: 25px !important;
              `}
            />
            Починить
          </MenuItem>
          <MenuItem
            disabled={Boolean(isInQueue) || Boolean(isPlaying)}
            onClick={openConfirmationDeleteModal}
          >
            <FontAwesomeIcon
              icon={faTrash}
              css={`
                margin-right: 10px;
                width: 25px !important;
              `}
            />
            Удалить
          </MenuItem>
        </ContextMenu>
      </Portal>
    </>
  );
};

export default memo(Instance);
