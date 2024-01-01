import React, { memo } from 'react';
import { useDispatch } from 'react-redux';
import Modal from '../components/Modal';
import { closeModal, openModal } from '../reducers/modals/actions';
import ga from '../utils/analytics';

let timer;

const InstanceStartupAd = ({ instanceName }) => {
  return (
    <Modal
      css={`
        height: 330px;
        width: 650px;
        overflow-x: hidden;
      `}
      title={`Запуск ${instanceName}`}
    >
      <div
        css={`
          display: flex;
          justify-content: center;
          flex-direction: column;
          text-align: center;
        `}
      >
        <span
          css={`
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 30px;
            margin-top: 20px;
          `}
        >
          Запускаю Minecraft....
        </span>
      </div>
    </Modal>
  );
};

export default memo(InstanceStartupAd);
