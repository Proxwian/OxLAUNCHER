/* eslint-disable no-loop-func */
import React, { useState, useEffect, memo } from 'react';
import { Button, Progress, Input } from 'antd';
import { Transition } from 'react-transition-group';
import styled, { useTheme } from 'styled-components';
import { ipcRenderer } from 'electron';
import fse from 'fs-extra';
import { useSelector, useDispatch } from 'react-redux';
import path from 'path';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import { exec } from 'child_process';
import { promisify } from 'util';
import Modal from '../components/Modal';
import { downloadFile } from '../../app/desktop/utils/downloader';
import {
  convertOSToJavaFormat,
  convertArchToJavaFormat,
  extractAll,
  isLatestJavaDownloaded
} from '../../app/desktop/utils';
import { _getTempPath } from '../utils/selectors';
import { closeModal } from '../reducers/modals/actions';
import {
  updateJava21Path,
  updateJava17Path,
  updateJava8Path
} from '../reducers/settings/actions';
import { UPDATE_MODAL } from '../reducers/modals/actionTypes';
import { LATEST_JAVA_VERSION } from '../utils/constants';

const JavaSetup = () => {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState(null);
  const [isJava8Downloaded, setIsJava8Downloaded] = useState(null);
  const [isJava17Downloaded, setisJava17Downloaded] = useState(null);
  const [isJava21Downloaded, setisJava21Downloaded] = useState(null);
  const [java8Log, setJava8Log] = useState(null);
  const [java17Log, setJava17Log] = useState(null);
  const [java21Log, setJava21Log] = useState(null);
  const java8Manifest = useSelector(state => state.app.java8Manifest);
  const java17Manifest = useSelector(state => state.app.java17Manifest);
  const java21Manifest = useSelector(state => state.app.java17Manifest);
  const userData = useSelector(state => state.userData);
  const manifests = {
    java21: java21Manifest,
    java17: java17Manifest,
    java8: java8Manifest
  };

  useEffect(() => {
    isLatestJavaDownloaded(manifests, userData, true, 8)
      .then(e => {
        setIsJava8Downloaded(e?.isValid);
        return setJava8Log(e?.log);
      })
      .catch(err => console.error(err));
    isLatestJavaDownloaded(manifests, userData, true, 17)
      .then(e => {
        setisJava17Downloaded(e?.isValid);
        return setJava17Log(e?.log);
      })
      .catch(err => console.error(err));
    isLatestJavaDownloaded(manifests, userData, true, 21)
      .then(e => {
        setisJava21Downloaded(e?.isValid);
        return setJava21Log(e?.log);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <Modal
      title="Установка Java"
      css={`
        height: 380px;
        width: 600px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        padding: 20px;
        position: relative;
      `}
      header={false}
    >
      <Transition in={step === 0} timeout={200}>
        {state => (
          <FirstStep state={state}>
            <div
              css={`
                font-size: 28px;
                text-align: center;
                margin-bottom: 20px;
              `}
            >
              Установка Java
            </div>
            <div
              css={`
                margin-bottom: 20px;
                font-size: 18px;
                text-align: justify;
              `}
            >
              Для наилучшей производительности, рекомендую разрешить лаунчеру
              автоматически установить нужные версии Java для вас.
            </div>

            <div
              css={`
                display: flex;
                align-items: center;
                justify-content: space-evenly;
                margin-bottom: 40px;
                opacity: 0;
                opacity: ${isJava8Downloaded !== null &&
                isJava17Downloaded !== null &&
                (!isJava8Downloaded || !isJava17Downloaded) &&
                '1'};
                * > h3 {
                  border-radius: 5px;
                  padding: 2px 4px;
                  background: ${props => props.theme.palette.colors.red};
                }
              `}
            >
              <h3>Отсутствуют версии:</h3>
              <div
                css={`
                  display: flex;
                  align-items: center;
                  margin-right: 40px;
                  h3 {
                    width: 71px;
                    display: flex;
                    justify-content: center;
                    align-content: center;
                    padding: 2px;
                    box-sizing: content-box;
                  }
                `}
              >
                {!isJava8Downloaded && isJava8Downloaded !== null && (
                  <h3
                    css={`
                      margin-right: 20px;
                    `}
                  >
                    Java 8
                  </h3>
                )}
                {!isJava17Downloaded && isJava17Downloaded !== null && (
                  <h3>Java 17</h3>
                )}
                {!isJava21Downloaded && isJava21Downloaded !== null && (
                  <h3>Java 21</h3>
                )}
              </div>
            </div>

            <div
              css={`
                & > div {
                  display: flex;
                  justify-content: center;
                  margin-top: 20px;
                }
              `}
            >
              <div>
                <Button
                  type="primary"
                  css={`
                    width: 150px;
                  `}
                  onClick={() => {
                    setStep(1);
                    setChoice(0);
                  }}
                >
                  Авто установка
                </Button>
              </div>
              <div>
                <Button
                  type="text"
                  css={`
                    width: 150px;
                  `}
                  onClick={() => {
                    setStep(1);
                    setChoice(1);
                  }}
                >
                  Ручная установка
                </Button>
              </div>
            </div>
          </FirstStep>
        )}
      </Transition>
      <Transition in={step === 1} timeout={200}>
        {state => (
          <SecondStep state={state}>
            <div
              css={`
                font-size: 28px;
                text-align: center;
                margin-bottom: 20px;
              `}
            >
              {choice === 0 ? 'Авто' : 'Вручную'} Установка
            </div>
            {choice === 0 ? (
              <AutomaticSetup
                isJava8Downloaded={isJava8Downloaded}
                isJava17Downloaded={isJava17Downloaded}
                isJava21Downloaded={isJava21Downloaded}
                java8Log={java8Log}
                java17Log={java17Log}
                java21Log={java21Log}
              />
            ) : (
              <ManualSetup setStep={setStep} />
            )}
          </SecondStep>
        )}
      </Transition>
    </Modal>
  );
};

const ManualSetup = ({ setStep }) => {
  const [java8Path, setJava8Path] = useState('');
  const [java17Path, setJava17Path] = useState('');
  const [java21Path, setJava21Path] = useState('');
  const dispatch = useDispatch();

  const selectFolder = async version => {
    const { filePaths, canceled } = await ipcRenderer.invoke('openFileDialog');
    if (!canceled) {
      if (version === 21) {
        setJava21Path(filePaths[0]);
      } else if (version === 17) {
        setJava17Path(filePaths[0]);
      } else {
        setJava8Path(filePaths[0]);
      }
    }
  };
  return (
    <div
      css={`
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
      `}
    >
      <div
        css={`
          margin-bottom: 50px;
          font-size: 18px;
        `}
      >
        Укажите путь установки Java. Java 8 будет использована для всех версий
        ниже 1.17, Java 17 для версий 1.17-1.20, Java {LATEST_JAVA_VERSION} для версий {'>='}{' '}
        1.21. Можно указать один и тот же исполняемый файл, но некоторые версии
        работать не будут.
      </div>

      <div
        css={`
          width: 100%;
          display: flex;
          margin-bottom: 10px;
        `}
      >
        <Input
          placeholder="Выберите файл исполняемый файл Java 8 (MC < 1.17)"
          onChange={e => setJava8Path(e.target.value)}
          value={java8Path}
        />
        <Button
          type="primary"
          onClick={() => selectFolder(8)}
          css={`
            margin-left: 10px;
          `}
        >
          <FontAwesomeIcon icon={faFolder} />
        </Button>
      </div>

      <div
        css={`
          width: 100%;
          display: flex;
        `}
      >
        <Input
          placeholder={`Выберите файл исполняемый файл Java 17 (MC >= 1.17)`}
          onChange={e => setJava17Path(e.target.value)}
          value={java17Path}
        />
        <Button
          type="primary"
          onClick={() => selectFolder(17)}
          css={`
            margin-left: 10px;
          `}
        >
          <FontAwesomeIcon icon={faFolder} />
        </Button>
      </div>

      <div
        css={`
          width: 100%;
          display: flex;
        `}
      >
        <Input
          placeholder={`Выберите файл исполняемый файл Java 21 (MC >= 1.21)`}
          onChange={e => setJava21Path(e.target.value)}
          value={java21Path}
        />
        <Button
          type="primary"
          onClick={() => selectFolder(21)}
          css={`
            margin-left: 10px;
          `}
        >
          <FontAwesomeIcon icon={faFolder} />
        </Button>
      </div>

      <div
        css={`
          width: 100%;
          display: flex;
          justify-content: space-between;
          margin-top: 45px;
          position: absolute;
          bottom: 0;
        `}
      >
        <Button type="primary" onClick={() => setStep(0)}>
          Назад
        </Button>
        <Button
          type="danger"
          disabled={java8Path === '' || java17Path === '' || java21Path === ''}
          onClick={() => {
            dispatch(updateJava8Path(java8Path));
            dispatch(updateJava17Path(java17Path));
            dispatch(updateJava21Path(java21Path));
            dispatch(closeModal());
          }}
        >
          Указать вручную
        </Button>
      </div>
    </div>
  );
};

const AutomaticSetup = ({
  isJava8Downloaded,
  isJava17Downloaded,
  isJava21Downloaded,
  java8Log,
  java17Log,
  java21Log
}) => {
  const [downloadPercentage, setDownloadPercentage] = useState(0);
  const [currentSubStep, setCurrentSubStep] = useState('Downloading Java');
  const [currentStepPercentage, setCurrentStepPercentage] = useState(0);
  const java8Manifest = useSelector(state => state.app.java8Manifest);
  const java17Manifest = useSelector(state => state.app.java17Manifest);
  const java21Manifest = useSelector(state => state.app.java21Manifest);
  const userData = useSelector(state => state.userData);
  const tempFolder = useSelector(_getTempPath);
  const modals = useSelector(state => state.modals);
  const dispatch = useDispatch();

  const theme = useTheme();
  const javaToInstall = [];
  useEffect(() => {
    if (javaToInstall.length > 0) {
      const instanceManagerModalIndex = modals.findIndex(
        x => x.modalType === 'JavaSetup'
      );

      dispatch({
        type: UPDATE_MODAL,
        modals: [
          ...modals.slice(0, instanceManagerModalIndex),
          {
            modalType: 'JavaSetup',
            modalProps: { preventClose: true }
          },
          ...modals.slice(instanceManagerModalIndex + 1)
        ]
      });
    }
  }, []);

  if (!isJava8Downloaded) javaToInstall.push(8);

  if (!isJava17Downloaded) javaToInstall.push(17);

  if (!isJava21Downloaded) javaToInstall.push(21);

  const installJava = async () => {
    const javaOs = convertOSToJavaFormat(process.platform);
    const javaArch = convertArchToJavaFormat(process.arch);
    const java8Meta = java8Manifest.find(
      v =>
        v.os === javaOs &&
        v.architecture === javaArch &&
        (v.binary_type === 'jre' || v.binary_type === 'jdk')
    );
    const java17Meta = java17Manifest.find(
      v =>
        v.os === javaOs &&
        v.architecture === javaArch &&
        (v.binary_type === 'jre' || v.binary_type === 'jdk')
    );
    const java21Meta = java21Manifest.find(
      v =>
        v.os === javaOs &&
        v.architecture === javaArch &&
        (v.binary_type === 'jre' || v.binary_type === 'jdk')
    );

    const totalExtractionSteps = process.platform !== 'win32' ? 2 : 1;
    const totalSteps = (totalExtractionSteps + 1) * javaToInstall.length;

    const setStepPercentage = (stepNumber, percentage) => {
      setCurrentStepPercentage(
        parseInt(percentage / totalSteps + (stepNumber * 100) / totalSteps, 10)
      );
    };

    let index = 0;
    for (const javaVersion of javaToInstall) {
      const {
        version_data: { openjdk_version: version },
        binary_link: url
      } = javaVersion === 8 ? java8Meta : javaVersion === 17 ? java17Meta : java21Meta;
      const javaBaseFolder = path.join(userData, 'java');

      await fse.remove(path.join(javaBaseFolder, version));
      const downloadLocation = path.join(tempFolder, path.basename(url));

      setCurrentSubStep(`Java ${javaVersion} - Загрузка`);
      await downloadFile(downloadLocation, url, p => {
        ipcRenderer.invoke('update-progress-bar', p);
        setDownloadPercentage(p);
        setStepPercentage(index, p);
      });

      ipcRenderer.invoke('update-progress-bar', -1);
      index += 1;
      setDownloadPercentage(0);
      setStepPercentage(index, 0);
      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentSubStep(
        `Java ${javaVersion} - Извлечение 1 / ${totalExtractionSteps}`
      );
      let { extractedParentDir } = await extractAll(
        downloadLocation,
        tempFolder,
        {
          $progress: true
        },
        {
          update: percent => {
            ipcRenderer.invoke('update-progress-bar', percent);
            setDownloadPercentage(percent);
            setStepPercentage(index, percent);
          }
        }
      );

      index += 1;
      setDownloadPercentage(0);
      setStepPercentage(index, 0);

      await fse.remove(downloadLocation);

      // If NOT windows then tar.gz instead of zip, so we need to extract 2 times.
      if (process.platform !== 'win32') {
        ipcRenderer.invoke('update-progress-bar', -1);
        await new Promise(resolve => setTimeout(resolve, 500));
        setCurrentSubStep(
          `Java ${javaVersion} - Извлечение 2 / ${totalExtractionSteps}`
        );

        const tempTarName = path.join(
          tempFolder,
          path.basename(url).replace('.tar.gz', '.tar')
        );

        ({ extractedParentDir } = await extractAll(
          tempTarName,
          tempFolder,
          {
            $progress: true
          },
          {
            update: percent => {
              ipcRenderer.invoke('update-progress-bar', percent);
              setDownloadPercentage(percent);
              setStepPercentage(index, percent);
            }
          }
        ));
        await fse.remove(tempTarName);
        index += 1;
        setDownloadPercentage(0);
        setStepPercentage(index, 0);
      }

      const directoryToMove =
        process.platform === 'darwin'
          ? path.join(tempFolder, extractedParentDir, 'Contents', 'Home')
          : path.join(tempFolder, extractedParentDir);
      await fse.move(directoryToMove, path.join(javaBaseFolder, version));

      await fse.remove(path.join(tempFolder, extractedParentDir));

      const ext = process.platform === 'win32' ? '.exe' : '';

      if (process.platform !== 'win32') {
        const execPath = path.join(
          javaBaseFolder,
          version,
          'bin',
          `java${ext}`
        );

        await promisify(exec)(`chmod +x "${execPath}"`);
        await promisify(exec)(`chmod 755 "${execPath}"`);
      }
    }

    dispatch(updateJava8Path(null));
    dispatch(updateJava17Path(null));
    dispatch(updateJava21Path(null));
    setCurrentSubStep(`Java установлена!`);
    ipcRenderer.invoke('update-progress-bar', -1);
    setDownloadPercentage(100);
    setCurrentStepPercentage(100);
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (!java17Log || !java21Log || !java8Log) dispatch(closeModal());
  };

  useEffect(() => {
    installJava();
  }, []);

  return (
    <div
      css={`
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
      `}
    >
      {javaToInstall.length > 0 ? (
        <>
          <div
            css={`
              margin-top: -15px; //cheaty way to get up to the Modal title :P
              margin-bottom: 50px;
              width: 50%;
            `}
          >
            <Progress
              percent={currentStepPercentage}
              strokeColor={theme.palette.primary.main}
              status="normal"
            />
          </div>
          <div
            css={`
              margin-bottom: 20px;
              font-size: 18px;
            `}
          >
            {currentSubStep}
          </div>
          <div
            css={`
              padding: 0 10px;
              width: 100%;
            `}
          >
            {downloadPercentage ? (
              <Progress
                percent={downloadPercentage}
                strokeColor={theme.palette.primary.main}
                status="normal"
              />
            ) : null}
          </div>
        </>
      ) : (
        <div
          css={`
            display: flex;
            flex-direction: column;
            div {
              display: flex;
              flex-direction: column;
            }
          `}
        >
          <h2>Java уже установлена!</h2>
          <div
            css={`
              margin-bottom: 10px;
            `}
          >
            <h3>Параметры Java 8:</h3>
            <code>{java8Log}</code>
          </div>
          <div>
            <h3>Параметры Java 17:</h3>
            <code>{java17Log}</code>
          </div>
          <div>
            <h3>Параметры Java 21:</h3>
            <code>{java21Log}</code>
          </div>
        </div>
      )}
      {java21Log && java17Log && java8Log && (
        <Button
          css={`
            position: absolute;
            bottom: 0;
            right: 0;
          `}
          type="primary"
          onClick={() => dispatch(closeModal())}
        >
          Закрыть
        </Button>
      )}
    </div>
  );
};

export default memo(JavaSetup);

const FirstStep = styled.div`
  transition: 0.2s ease-in-out;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
  transform: translateX(
    ${({ state }) => (state === 'exiting' || state === 'exited' ? -100 : 0)}%
  );
`;

const SecondStep = styled.div`
  transition: 0.2s ease-in-out;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
  transform: translateX(
    ${({ state }) => (state === 'entering' || state === 'entered' ? 0 : 101)}%
  );
`;
