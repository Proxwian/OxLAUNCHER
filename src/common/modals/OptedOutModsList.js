import React, { useEffect, useRef, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Spin } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faFileDownload
} from '@fortawesome/free-solid-svg-icons';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import Modal from '../components/Modal';
import { UPDATE_MODAL } from '../reducers/modals/actionTypes';
import { closeModal } from '../reducers/modals/actions';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-conter: space-between;
  align-items: center;
  text-align: center;
  color: ${props => props.theme.palette.text.primary};
`;

const ModsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  width: 100%;
  height: 100%;
  max-height: 250px;
`;

const RowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  font-size: 16px;
  width: 100%;
  height: 20px;
  padding: 20px 10px;
  background: ${props => props.theme.palette.grey[800]};

  &:hover {
    .rowCenterContent {
      color: ${props => props.theme.palette.text.primary};
    }
  }

  .dot {
    border-radius: 50%;
    height: 10px;
    width: 10px;
    background: ${props => props.theme.palette.colors.green};
  }
`;

const ModRow = ({
  mod,
  loadedMods,
  currentMod,
  missingMods,
  downloadedMods,
  cloudflareBlock,
  downloadUrl
}) => {
  const { modManifest, addon } = mod;
  const loaded = loadedMods.includes(modManifest.id);
  const missing = missingMods.includes(modManifest.id);
  const downloaded = downloadedMods.includes(modManifest.id);
  const ref = useRef();

  const isCurrentMod = currentMod?.modManifest?.id === modManifest.id;

  useEffect(() => {
    if (!loaded && isCurrentMod) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [isCurrentMod, loaded]);

  return (
    <RowContainer ref={ref}>
      <div>{`${addon?.name} - ${modManifest?.displayName}`}</div>
      {loaded && !missing && !cloudflareBlock && <div className="dot" />}
      {loaded && missing && !cloudflareBlock && (
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          css={`
            color: ${props => props.theme.palette.colors.yellow};
          `}
        />
      )}
      {loaded && !missing && cloudflareBlock && !downloaded && (
        <Button href={downloadUrl}>
          <FontAwesomeIcon icon={faFileDownload} />
        </Button>
      )}
      {!loaded && isCurrentMod && (
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      )}
    </RowContainer>
  );
};

const OptedOutModsList = ({
  optedOutMods,
  instancePath,
  resolve,
  reject,
  preventClose
}) => {
  const [loadedMods, setLoadedMods] = useState([]);
  const [missingMods, setMissingMods] = useState([]);
  const [downloadedMods, setDownloadedMods] = useState([]);
  const [cloudflareBlock, setCloudflareBlock] = useState(false);
  const [manualDownloadUrls, setManualDownloadUrls] = useState([]);
  const [downloading, setDownloading] = useState(false);

  const dispatch = useDispatch();
  const modals = useSelector(state => state.modals);

  const optedOutModalIndex = modals.findIndex(
    x => x.modalType === 'OptedOutModsList'
  );

  const currentMod = downloading ? optedOutMods[loadedMods.length] : null;

  useEffect(() => {
    const listener = () => {
      dispatch(closeModal());
      setTimeout(() => {
        reject('Окно загрузки было неожиданно закрыто');
      }, 300);
    };

    ipcRenderer.once('opted-out-window-closed-unexpected', listener);

    return () => {
      ipcRenderer.removeListener(
        'opted-out-window-closed-unexpected',
        listener
      );
    };
  }, []);

  useEffect(() => {
    const listener = (e, status) => {
      if (!status.error) {
        if (optedOutMods.length === loadedMods.length + 1) {
          if (missingMods.length === 0 && !cloudflareBlock) {
            resolve();
            dispatch(closeModal());
          }
          setDownloading(false);
        }
        setLoadedMods(prev => [...prev, status.modId]);
        if (status.warning) {
          if (!status.cloudflareBlock) {
            setMissingMods(prev => [...prev, status.modId]);
          } else {
            setCloudflareBlock(true);
            setManualDownloadUrls(prev => [...prev, status.modId]);
          }
        } else {
          setDownloadedMods(prev => [...prev, status.modId]);
        }
      } else {
        dispatch(closeModal());
        setTimeout(() => {
          reject(status.error);
        }, 300);
      }
    };

    ipcRenderer.once('opted-out-download-mod-status', listener);

    return () => {
      ipcRenderer.removeListener(
        'opted-out-window-closed-unexpected',
        listener
      );
    };
  }, [downloadedMods, loadedMods, missingMods, cloudflareBlock, manualDownloadUrls]);

  return (
    <Modal
      css={`
        height: 400px;
        width: 800px;
        overflow-x: hidden;
      `}
      preventClose={preventClose}
      closeCallback={() => {
        setTimeout(
          () => reject(new Error('Загрузка прервана пользователем')),
          300
        );
      }}
      title="Загрузка сторонних модификаций"
    >
      <Container>
        {!cloudflareBlock && (
          <div
            css={`
              text-align: left;
              margin-bottom: 2rem;
            `}
          >
            Часть модов из сборки необходимо скачать через внутренний браузер.
            Не переживайте, это произойдёт автоматически. Нажмите "Подтвердить",
            и подождите, пока все загрузки завершатся! Пожалуйста, не нажимайте
            ничего внутри браузера - процесс автоматический.
          </div>
        )}
        <ModsContainer>
          {optedOutMods &&
            optedOutMods.map(mod => {
              return (
                <ModRow
                  mod={mod}
                  loadedMods={loadedMods}
                  currentMod={currentMod}
                  missingMods={missingMods}
                  downloadedMods={downloadedMods}
                  cloudflareBlock={cloudflareBlock}
                  downloadUrl={`${mod.addon.links.websiteUrl}/download/${mod.modManifest.id}`}
                />
              );
            })}
        </ModsContainer>
        {cloudflareBlock && (
          <p
            css={`
              width: 90%;
              margin: 20px auto 0 auto;
            `}
          >
            Cloudflare заблокировал трафик из вашей сети. Вы можете загрузить
            модификации вручную и поместить их в папку mods. Используйте кнопки
            Загрузить напротив незагруженных модификаций выше, и кнопку ниже,
            чтобы открыть папку с игрой.
          </p>
        )}
        <div
          css={`
            display: flex;
            width: 100%;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            margin-top: 20px;
          `}
        >
          <Button
            danger
            type="text"
            disabled={
              (missingMods.length > 0 && !cloudflareBlock) || downloading
            }
            onClick={() => {
              dispatch(closeModal());
              setTimeout(
                () => reject(new Error('Загрузка прервана пользователем')),
                300
              );
            }}
          >
            Отмена
          </Button>
          {missingMods.length === 0 && !cloudflareBlock && (
            <Button
              type="primary"
              disabled={downloading}
              onClick={() => {
                setDownloading(true);

                dispatch({
                  type: UPDATE_MODAL,
                  modals: [
                    ...modals.slice(0, optedOutModalIndex),
                    {
                      modalType: 'OptedOutModsList',
                      modalProps: {
                        ...modals[optedOutModalIndex].modalProps,
                        preventClose: true
                      }
                    },
                    ...modals.slice(optedOutModalIndex + 1)
                  ]
                });
                ipcRenderer.invoke('download-optedout-mods', {
                  mods: optedOutMods,
                  instancePath
                });
                setDownloading(false);
              }}
              css={`
                background-color: ${props => props.theme.palette.colors.green};
              `}
            >
              Подтвердить
            </Button>
          )}
          {missingMods.length > 0 && !cloudflareBlock && (
            <Button
              type="primary"
              disabled={downloading}
              onClick={() => {
                resolve();
                dispatch(closeModal());
              }}
              css={`
                background-color: ${props => props.theme.palette.colors.green};
              `}
            >
              Продолжить
            </Button>
          )}
          {cloudflareBlock && (
            <>
              <Button
                type="primary"
                disabled={downloading}
                onClick={() => {
                  ipcRenderer.invoke('openFolder', instancePath);
                }}
                css={`
                  background-color: ${props => props.theme.palette.colors.blue};
                `}
              >
                Открыть папку
              </Button>
              <Button
                type="primary"
                disabled={downloading}
                onClick={() => {
                  for (const index in manualDownloadUrls) {
                    window.open(`${optedOutMods[0].addon.links.websiteUrl}/download/${manualDownloadUrls[index]}`);
                  }
                }}
                css={`
                  background-color: ${props => props.theme.palette.colors.blue};
                `}
              >
                Открыть все ссылки
              </Button>
              <Button
                type="primary"
                disabled={downloading}
                onClick={() => {
                  resolve();
                  dispatch(closeModal());
                }}
                css={`
                  background-color: ${props =>
                    props.theme.palette.colors.orange};
                `}
              >
                Продолжить
              </Button>
            </>
          )}
        </div>
      </Container>
    </Modal>
  );
};

export default OptedOutModsList;
