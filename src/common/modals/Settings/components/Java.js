import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faJava } from '@fortawesome/free-brands-svg-icons';
import {
  faMemory,
  faFolder,
  faUndo,
  faLevelDownAlt,
  faList,
  faDesktop,
  faPlay
} from '@fortawesome/free-solid-svg-icons';
import { Slider, Button, Input, Switch, Select } from 'antd';
import {
  updateJava17Path,
  updateJava21Path,
  updateJavaArguments,
  updateJavaMemory,
  updateJava8Path,
  updateMcStartupMethod,
  updateResolution
} from '../../../reducers/settings/actions';
import {
  DEFAULT_JAVA_ARGS,
  resolutionPresets
} from '../../../../app/desktop/utils/constants';
import { _getJavaPath } from '../../../utils/selectors';
import { openModal } from '../../../reducers/modals/actions';
import {
  MC_STARTUP_METHODS
} from '../../../utils/constants';
import { marks, scaleMem, scaleMemInv, sysMemScaled } from '../../../utils';

const AutodetectPath = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  margin-bottom: 30px;
`;

const SelectMemory = styled.div`
  width: 100%;
  height: 100px;
`;

const Resolution = styled.div`
  width: 100%;
  height: 100px;
`;

const McStartupMethod = styled.div`
  width: 100%;
  height: 100px;
`;

const McStartupMethodRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  margin-bottom: 30px;
`;

const ResolutionInputContainer = styled.div`
  margin-top: 10px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  div {
    width: 200px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
`;

const JavaCustomArguments = styled.div`
  width: 100%;
  height: 120px;
`;

const Title = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.palette.text.secondary};
`;

const Paragraph = styled.p`
  max-width: 510px;
  color: ${props => props.theme.palette.text.third};
`;

const Hr = styled.div`
  height: 35px;
`;

const MainTitle = styled.h1`
  color: ${props => props.theme.palette.text.primary};
  width: 80px;
  margin: 30px 0 20px 0;
`;

const StyledButtons = styled(Button)`
  float: right;
`;

function resetJavaArguments(dispatch) {
  dispatch(updateJavaArguments(DEFAULT_JAVA_ARGS));
}

export default function MyAccountPreferences() {
  const [screenResolution, setScreenResolution] = useState(null);
  const javaArgs = useSelector(state => state.settings.java.args);
  const javaMemory = useSelector(state => state.settings.java.memory);
  const java8Path = useSelector(state => _getJavaPath(state)(8));
  const java17Path = useSelector(state => _getJavaPath(state)(17));
  const java21Path = useSelector(state => _getJavaPath(state)(21));
  const customJava8Path = useSelector(state => state.settings.java.path8);
  const customJava17Path = useSelector(state => state.settings.java.path17);
  const customJava21Path = useSelector(state => state.settings.java.path21);
  const mcStartupMethod = useSelector(state => state.settings.mcStartupMethod);
  const mcResolution = useSelector(
    state => state.settings.minecraftSettings.resolution
  );
  const dispatch = useDispatch();

  useEffect(() => {
    ipcRenderer
      .invoke('getAllDisplaysBounds')
      .then(setScreenResolution)
      .catch(console.error);
  }, []);

  return (
    <>
      <MainTitle>Java</MainTitle>
      <Title
        css={`
          width: 500px;
          text-align: left;
        `}
      >
        Автоопределение установки Java <FontAwesomeIcon icon={faJava} />
        <br/>
        <a
          css={`
            margin-left: 30px;
          `}
          onClick={() => {
            dispatch(openModal('JavaSetup'));
          }}
        >
          Запустить установку Java заново
        </a>
      </Title>
      <AutodetectPath>
        <Paragraph
          css={`
            text-align: left;
          `}
        >
          Отключите это, чтобы указать путь к Java вручную. Это отключит
          используемую OxLAUNCHER версию OpenJDK по умолчанию.
        </Paragraph>
        <Switch
          color="primary"
          onChange={c => {
            if (c) {
              dispatch(updateJava8Path(null));
              dispatch(updateJava17Path(null));
              dispatch(updateJava21Path(null));
            } else {
              dispatch(updateJava8Path(java8Path));
              dispatch(updateJava17Path(java17Path));
              dispatch(updateJava21Path(java21Path));
            }
          }}
          checked={!customJava8Path && !customJava17Path && !customJava21Path}
        />
      </AutodetectPath>
      {customJava8Path && customJava17Path && customJava21Path && (
        <>
          <div
            css={`
              height: 50px;
              margin: 30px 0;
            `}
          >
            <h3
              css={`
                text-align: left;
              `}
            >
              Java 8
            </h3>
            <div
              css={`
                width: 100%;
              `}
            >
              <FontAwesomeIcon
                icon={faLevelDownAlt}
                flip="horizontal"
                transform={{ rotate: 90 }}
              />
              <Input
                css={`
                  width: 75% !important;
                  margin: 0 10px !important;
                `}
                onChange={e =>
                  dispatch(
                    updateJava8Path(
                      e.target.value === '' ? null : e.target.value
                    )
                  )
                }
                value={customJava8Path}
              />
              <StyledButtons
                color="primary"
                onClick={async () => {
                  const { filePaths, canceled } = await ipcRenderer.invoke(
                    'openFileDialog',
                    java8Path
                  );
                  if (!filePaths[0] || canceled) return;
                  dispatch(updateJava8Path(filePaths[0]));
                }}
              >
                <FontAwesomeIcon icon={faFolder} />
              </StyledButtons>
            </div>
          </div>
          <div
            css={`
              height: 50px;
              margin: 30px 0;
            `}
          >
            <h3
              css={`
                text-align: left;
              `}
            >
              Java 17
            </h3>
            <div
              css={`
                width: 100%;
              `}
            >
              <FontAwesomeIcon
                icon={faLevelDownAlt}
                flip="horizontal"
                transform={{ rotate: 90 }}
              />
              <Input
                css={`
                  width: 75% !important;
                  margin: 0 10px !important;
                `}
                onChange={e => {
                  dispatch(
                    updateJava17Path(
                      e.target.value === '' ? null : e.target.value
                    )
                  );
                }}
                value={customJava17Path}
              />
              <StyledButtons
                color="primary"
                onClick={async () => {
                  const { filePaths, canceled } = await ipcRenderer.invoke(
                    'openFileDialog',
                    javaPath
                  );
                  if (!filePaths[0] || canceled) return;
                  dispatch(updateJava17Path(filePaths[0]));
                }}
              >
                <FontAwesomeIcon icon={faFolder} />
              </StyledButtons>
            </div>
          </div>
          <div
            css={`
              height: 50px;
              margin: 30px 0;
            `}
          >
            <h3
              css={`
                text-align: left;
              `}
            >
              Java 21
            </h3>
            <div
              css={`
                width: 100%;
              `}
            >
              <FontAwesomeIcon
                icon={faLevelDownAlt}
                flip="horizontal"
                transform={{ rotate: 90 }}
              />
              <Input
                css={`
                  width: 75% !important;
                  margin: 0 10px !important;
                `}
                onChange={e => {
                  dispatch(
                    updateJava21Path(
                      e.target.value === '' ? null : e.target.value
                    )
                  );
                }}
                value={customJava21Path}
              />
              <StyledButtons
                color="primary"
                onClick={async () => {
                  const { filePaths, canceled } = await ipcRenderer.invoke(
                    'openFileDialog',
                    javaPath
                  );
                  if (!filePaths[0] || canceled) return;
                  dispatch(updateJava21Path(filePaths[0]));
                }}
              >
                <FontAwesomeIcon icon={faFolder} />
              </StyledButtons>
            </div>
          </div>
        </>
      )}
      <Hr />
      <Resolution>
        <Title
          css={`
            width: 100%;
            margin-top: 0px;
            height: 8px;
            text-align: left;
            margin-bottom: 20px;
          `}
        >
          Разрешение экрана&nbsp; <FontAwesomeIcon icon={faDesktop} />
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          Выберите базовое разрешение экрана для игры (ширина х высота).
        </Paragraph>
        <ResolutionInputContainer>
          <div>
            <Input
              placeholder="Ширина"
              value={mcResolution.width}
              onChange={e => {
                const w = parseInt(e.target.value, 10);
                dispatch(updateResolution({ width: w || 854 }));
              }}
            />
            &nbsp;X&nbsp;
            <Input
              placeholder="Высота"
              value={mcResolution.height}
              onChange={e => {
                const h = parseInt(e.target.value, 10);
                dispatch(updateResolution({ height: h || 480 }));
              }}
            />
          </div>
          <Select
            placeholder="Пресеты"
            onChange={v => {
              const w = parseInt(v.split('x')[0], 10);
              const h = parseInt(v.split('x')[1], 10);
              dispatch(updateResolution({ height: h, width: w }));
            }}
            virtual={false}
          >
            {resolutionPresets.map(v => {
              const w = parseInt(v.split('x')[0], 10);
              const h = parseInt(v.split('x')[1], 10);

              const isBiggerThanScreen = (screenResolution || []).every(
                bounds => {
                  return bounds.width < w || bounds.height < h;
                }
              );
              if (isBiggerThanScreen) return null;
              return (
                <Select.Option key={v} value={v}>
                  {v}
                </Select.Option>
              );
            })}
          </Select>
        </ResolutionInputContainer>
      </Resolution>
      <Hr />
      <SelectMemory>
        <Title
          css={`
            width: 100%;
            margin-top: 0px;
            height: 8px;
            text-align: left;
            margin-bottom: 20px;
          `}
        >
          Память Java&nbsp; <FontAwesomeIcon icon={faMemory} />
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          Выберите выделяемую Java память для запуска игры.
        </Paragraph>
        <div
          css={`
            display: flex;
          `}
        >
          <Slider
            css={`
              margin: 20px 40px !important;
              white-space: nowrap;
              flex: 1;
            `}
            onChange={e =>
              dispatch(updateJavaMemory(Math.round(scaleMemInv(e))))
            }
            defaultValue={scaleMem(javaMemory)}
            min={0}
            max={sysMemScaled}
            step={0.1}
            marks={marks}
            valueLabelDisplay="auto"
          />
          <div
            css={`
              display: grid;
              place-items: center;
              width: 100px;
            `}
          >
            {javaMemory} МБ
          </div>
        </div>
      </SelectMemory>
      <Hr />
      <JavaCustomArguments>
        <Title
          css={`
            width: 100%;
            text-align: left;
          `}
        >
          Параметры запуска JVM &nbsp; <FontAwesomeIcon icon={faList} />
        </Title>
        <Paragraph
          css={`
            text-align: left;
          `}
        >
          Укажите собственные параметры запуска виртуальной машины Java.
        </Paragraph>
        <div
          css={`
            margin-top: 20px;
            width: 100%;
          `}
        >
          <Input
            onChange={e => dispatch(updateJavaArguments(e.target.value))}
            value={javaArgs}
            css={`
              width: 83% !important;
              height: 32px !important;
              float: left !important;
            `}
          />
          <StyledButtons
            onClick={() => resetJavaArguments(dispatch)}
            color="primary"
          >
            <FontAwesomeIcon icon={faUndo} />
          </StyledButtons>
        </div>
      </JavaCustomArguments>
      <Hr />
      <McStartupMethod>
        <Title
          css={`
            width: 70%;
            text-align: left;
          `}
        >
          Способ запуска Minecraft &nbsp; <FontAwesomeIcon icon={faPlay} />
        </Title>
        <McStartupMethodRow>
          <Paragraph
            css={`
              text-align: left;
            `}
          >
            Выберите основной или альтернативный способ запуска игры. Используйте в случае,
            когда предыдущий метод не сработал.
          </Paragraph>
          <Select
            value={mcStartupMethod}
            onChange={v => dispatch(updateMcStartupMethod(v))}
            disabled={process.platform !== 'win32'}
          >
            {Object.entries(MC_STARTUP_METHODS).map(([k, v]) => (
              <Select.Option key={k} value={k}>
                {v}
              </Select.Option>
            ))}
          </Select>
        </McStartupMethodRow>
      </McStartupMethod>
    </>
  );
}
