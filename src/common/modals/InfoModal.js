import React from 'react';
import Modal from '../components/Modal';

const InfoModal = ({ modName, error, preventClose }) => {
  return (
    <Modal
      css={`
        width: 50%;
        max-width: 550px;
        overflow-x: hidden;
      `}
      preventClose={preventClose}
      title="Не удалось загрузить модификацию"
    >
      <div>
        Модификацию ${modName || ''} не удалось загрузить
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
      </div>
    </Modal>
  );
};

export default InfoModal;
