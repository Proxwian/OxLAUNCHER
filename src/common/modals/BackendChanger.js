import { Select } from 'antd';
import React, { memo, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons';
import path from 'path';
import { isEqual } from 'lodash';
import Modal from '../components/Modal';
import { addToQueue } from '../reducers/actions';
import { _getInstance } from '../utils/selectors';
import { closeAllModals } from '../reducers/modals/actions';
import { getFilteredVersions } from '../../app/desktop/utils';

const BackendChanger = ({ instanceName, defaultValue }) => {
  const config = useSelector(state => _getInstance(state)(instanceName));
  const [selectedBackend, setSelectedBackend] = useState(null);

  const dispatch = useDispatch();

  return (
    <Modal
      title="Изменение сервера авторизации"
      css={`
        height: 380px;
        width: 600px;
      `}
      removePadding
    >
      <Container>
        <Select
          options={filteredVers}
          defaultValue={patchedDefaultValue}
          onChange={setSelectedBackend}
          allowClear={false}
          placeholder="Выберите сервер"
          size="large"
          css={`
            width: 400px;
          `}
        >
            {Object.entries(BACKEND_SERVERS).map(([k, v]) => (
                  <Select.Option
                    title={v}
                    key={k}
                    value={v}
                  >
                    {v}
                  </Select.Option>
                ))}
        </Select>
        <div
          css={`
            position: absolute;
            bottom: 20px;
            right: 20px;
          `}
        >
          <div
            isVersionDifferent={
              selectedBackend && !isEqual(defaultValue?.name, selectedBackend)
            }
            css={`
              width: 70px;
              height: 40px;
              transition: 0.1s ease-in-out;
              display: flex;
              justify-content: center;
              align-items: center;
              border-radius: 4px;
              font-size: 40px;
              color: ${props =>
                props.isVersionDifferent
                  ? props.theme.palette.text.icon
                  : props.theme.palette.text.disabled};
              ${props => (props.isVersionDifferent ? 'cursor: pointer;' : '')}
              &:hover {
                background-color: ${props =>
                  props.isVersionDifferent
                    ? props.theme.action.hover
                    : 'transparent'};
              }
            `}
            onClick={async () => {
              if (
                !selectedBackend ||
                isEqual(defaultValue?.name, selectedBackend)
              ) {
                return;
              }
              const background = config?.background
                ? `background${path.extname(config?.background)}`
                : null;

              if (selectedBackend) {
                dispatch(
                  addToQueue(
                    instanceName,
                    {
                      ...defaultValue,
                      backend: selectedBackend
                    },
                    null,
                    background
                  )
                );
              }

              dispatch(closeAllModals());
            }}
          >
            <FontAwesomeIcon icon={faLongArrowAltRight} />
          </div>
        </div>
      </Container>
    </Modal>
  );
};

export default memo(McVersionChanger);

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  flex-direction: column;
`;
