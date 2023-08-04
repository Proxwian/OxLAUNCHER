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
              <a href="https://mineserv.top/oxfortpack" target="_blank" rel="noopener noreferrer" data-project="1955" class="mn-srv-btn mn-srv-btn--online"><span class="mn-srv-btn__icon"><span><svg viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-dasharray="14.0625, 100"></path></svg> <span>9</span></span></span> <span class="mn-srv-btn__text"><span>MineAdventure 🔥 320 модов без ограничений</span> <p>Игроков 9 из 64</p></span></a><script src="https://mineserv.top/widgets.js"></script>
            </div>
      </div>
    </Modal>
  );
};

export default memo(InstanceStartupAd);
