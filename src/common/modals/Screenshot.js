import React, { useEffect, useState, useCallback, useRef } from 'react';
import path from 'path';
import fse from 'fs-extra';
import { clipboard, ipcRenderer } from 'electron';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector, useDispatch } from 'react-redux';
import {
  ContextMenuTrigger,
  ContextMenu,
  MenuItem,
  hideMenu
} from 'react-contextmenu';
import {
  faTrash,
  faCopy,
  faLink,
  faFolder,
  faImage
} from '@fortawesome/free-solid-svg-icons';

import Modal from '../components/Modal';
import { openModal } from '../reducers/modals/actions';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  text-align: center;
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
`;

export default function Screenshot({ screenshotsPath, file }) {
  const imagePath = `${path.join(screenshotsPath, file.name)}`
  const image = `file:///${imagePath}`;
  const [progressUpdate, setProgressUpdate] = useState(null);
  const [uploadingFileName, setUploadingFileName] = useState(null);
  const dispatch = useDispatch();

  const isImageCopied = progressUpdate => {
    if (
      progressUpdate === 100 &&
      uploadingFileName !== null
    ) {
      return 'Изображение скопировано в буфер обмена!';
    } else if (
      uploadingFileName != null
    ) {
      return 'Подождите загрузки предыдущего изображения';
    } else return 'Поделиться ссылкой на изображение';
  };

  const deleteFile = useCallback(
    async() => {
      await fse.remove(
        imagePath
      );
    },
    []
  );

  return (
    <Modal
      css={`
        height: 85%;
        width: 85%;
        max-width: 1500px;
        overflow: hidden;
      `}
      title="ScreenShot"
    >
      <ContextMenuTrigger id="image">
        <Container>
          <Img src={image} />
        </Container>
      </ContextMenuTrigger>

      <StyledContexMenu
        id="image">
                        {true && (
                          <>
                            <MenuItem
                              onClick={() => {
                                clipboard.writeImage(
                                  path.join(file.screenshotsPath, file.name)
                                );
                              }}
                            >
                              <FontAwesomeIcon icon={faCopy} />
                              Копировать картинку
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                dispatch(
                                  openModal('ActionConfirmation', {
                                    message:
                                      'Вы уверены, что хотите удалить это изображение?',
                                    fileName: file.name,
                                    confirmCallback: deleteFile,
                                    title: 'Подтвердить'
                                  })
                                );
                              }}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                              Удалить
                            </MenuItem>
                          </>
                        )}
                      </StyledContexMenu>
    </Modal>
  );
}

const StyledContexMenu = styled(ContextMenu)`
  svg {
    margin: 0 7px 0 0;
  }
`;

const ImgurShareMenuItem = styled(MenuItem)`
  overflow: hidden;
  position: relative;
  padding: 0 !important;
`;

const MenuShareLink = styled.div`
  padding: 4px 10px;
  position: relative;
  svg {
    margin: 0 7px 0 0;
  }
`;

const LoadingSlider = styled.div`
  position: absolute;
  bottom: 4px;
  z-index: -1;
  width: 100%;
  height: 100%;
  transform: ${props =>
    props.uploadingFileName != null
      ? `translate(${props.translateAmount}%)`
      : 'translate(-100%)'};
  transition: transform 0.1s ease-in-out;
  background: ${props => props.theme.palette.primary.main};
`;