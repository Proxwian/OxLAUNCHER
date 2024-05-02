import React, { useState } from 'react';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../components/Modal';
import {
  addNextInstanceToCurrentDownload,
  downloadInstance,
  removeDownloadFromQueue,
  updateInstanceConfig
} from '../reducers/actions';
import { openModal, closeModal } from '../reducers/modals/actions';
import { _getInstancesPath, _getTempPath } from '../utils/selectors';
import { rollBackInstanceZip } from '../utils';

const InstanceDownloadFailed = ({
  instanceName,
  error,
  isUpdate,
  preventClose
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const instancesPath = useSelector(_getInstancesPath);
  const tempPath = useSelector(_getTempPath);

  const ellipsedName =
    instanceName.length > 20
      ? `${instanceName.substring(0, 20)}...`
      : instanceName;

  const deleteDownload = async () => {
    await dispatch(removeDownloadFromQueue(instanceName, true));

    dispatch(closeModal());
    await new Promise(resolve => setTimeout(resolve, 1000));
    dispatch(openModal('InstanceDeleteConfirmation', { instanceName }));
  };

  const restoreDownload = async () => {
    await dispatch(removeDownloadFromQueue(instanceName, true));
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // if instanceName is ever empty, this will delete ALL instances, so don't run it if we don't have a name
    if (instanceName) {
      await rollBackInstanceZip(
        isUpdate,
        instancesPath,
        instanceName,
        tempPath,
        dispatch,
        updateInstanceConfig
      );
    }

    setLoading(false);
    dispatch(addNextInstanceToCurrentDownload());
    dispatch(closeModal());
  };

  const retry = async () => {
    // Reset current download state
    dispatch(closeModal());
    dispatch(downloadInstance(instanceName));
  };

  return (
    <Modal
      css={`
        width: 50%;
        max-width: 550px;
        overflow-x: hidden;
      `}
      preventClose={preventClose}
      title={`Ошибка загрузки - ${ellipsedName}`}
    >
      <div>
        Загрузка {instanceName} не удалась.
        <div
          css={`
            background: ${props => props.theme.palette.grey[900]};
            padding: 10px;
            margin: 10px 0;
          `}
        >
          {'> '}
          {error.toString()}
        </div>
        <div>Похоже, подключение оборвалось. Такое бывает, если провайдер ограничивает число подключений к серверам Forge. Рекомендую установить VPN для загрузки клиента. Если же у вас просто пропал интернет, можете попробовать скачать игру заново.</div>
        <div
          css={`
            margin-top: 10px;
            display: flex;
            width: 100%;
            justify-content: space-between;
          `}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={deleteDownload}
            disabled={loading}
          >
            Отмена
          </Button>
          {isUpdate && (
            <Button
              variant="contained"
              color="primary"
              onClick={restoreDownload}
              loading={loading}
            >
              Restore instance
            </Button>
          )}
          <Button danger type="primary" onClick={retry} disabled={loading}>
            Повторить загрузку
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InstanceDownloadFailed;
