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
          Запускаю Minecraft....
        </span>
        <div
              css={`
                display: flex;
                justify-content: center;
                flex-direction: column;
                text-align: center;
              `}
            >
              <link rel="stylesheet" href="https://mineserv.top/widgets.min.css"/> 
              <a href="https://mineserv.top/oxfortpack" target="_blank" rel="noopener noreferrer" class="mn-srv-btn mn-srv-btn--small">
                <span class="mn-srv-btn__icon"><svg width="16" height="16" viewBox="0 0 360 360"><g fill="none" fill-rule="evenodd"><path d="M0 0H360V360H0z" transform="translate(-371 -350) translate(371 350)"></path> <g fill="#FFF"><path d="M253.844 259.461L253.844.539 203.075.539 203.065 52.329 152.307 52.324 152.307 104.108 203.065 104.108 203.075 259.461zM152.307 156.432L152.307 104.647 101.538 104.647 101.538 156.432zM50.769.539L0 .539 0 259.461 50.769 259.461 50.769 104.108 101.538 104.108 101.538 52.324 50.769 52.324z" transform="translate(-371 -350) translate(371 350) translate(53 50)"></path></g></g></svg></span> <span class="mn-srv-btn__text">MineAdventure | OxFORTPACK Online</span></a>
            </div>
      </div>
    </Modal>
  );
};

export default memo(InstanceStartupAd);
