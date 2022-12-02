import React, { memo } from 'react';
import { useDispatch } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
import Modal from '../components/Modal';
import { closeModal, openModal } from '../reducers/modals/actions';
import BisectHosting from '../../ui/BisectHosting';
import ga from '../utils/analytics';

let timer;

const InstanceStartupAd = ({ instanceName }) => {
  const dispatch = useDispatch();

  const openBisectHostingModal = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    dispatch(closeModal());
    setTimeout(() => {
      ga.sendCustomEvent('BHAdViewNavbar');
      dispatch(openModal('BisectHosting'));
    }, 225);
  };

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
          Ваша сборка запускается....
          <LoadingOutlined
            css={`
              margin-left: 30px;
              font-size: 50px;
            `}
          />
        </span>
      </div>
    </Modal>
  );
};

export default memo(InstanceStartupAd);
