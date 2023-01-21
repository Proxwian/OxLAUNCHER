import React, { memo } from 'react';
import styled from 'styled-components';
import Modal from '../components/Modal';

const AutoUpdatesNotAvailable = () => {
  return (
    <Modal
      css={`
        height: 200px;
        width: 400px;
      `}
      title="Доступно обновление лаунчера"
    >
      <Container>
        <div></div>
        <div
          css={`
            margin-top: 20px;
          `}
        >
          Для OxLAUNCHER вышло обновление! Пожалуйста, загрузите его с 
          <a href="https://oxlauncher.online"> официального сайта</a>
        </div>
      </Container>
    </Modal>
  );
};

export default memo(AutoUpdatesNotAvailable);

const Container = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;
  color: ${props => props.theme.palette.text.primary};
`;
