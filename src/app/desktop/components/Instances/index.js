import React, { memo, useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Popover } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSort,
  faSortAlphaDown,
  faSortNumericDown,
  faSortNumericDownAlt,
  faArrowsAltV
} from '@fortawesome/free-solid-svg-icons';
import { _getInstances } from '../../../../common/utils/selectors';
import { updateInstanceOrder, updateInstanceSortType } from '../../../../common/reducers/settings/actions';
import Instance from './Instance';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 2rem;
  left: 20px;
`;

const SortControls = styled.div`
  position: fixed;
  bottom: 20px;
  left: 140px;
  z-index: 90;

  button {
    z-index: 90;
  }
`;

const SortButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DraggableWrapper = styled.div`
  cursor: ${props => (props.draggable ? 'grab' : 'default')};
  opacity: ${props => (props.isDragging ? 0.5 : 1)};
  transition: opacity 150ms ease-in-out, transform 150ms ease-in-out;
  
  &:hover {
    transform: ${props => (props.draggable ? 'scale(1.05)' : 'none')};
  }
  
  ${props => props.isDragOver ? `
    transform: scale(1.1);
    z-index: 10;
  ` : ''}
`;

const NoInstance = styled.div`
  width: 100%;
  text-align: center;
  font-size: 25px;
  margin-top: 100px;
`;

const SubNoInstance = styled.div`
  width: 100%;
  text-align: center;
  font-size: 15px;
  margin-top: 20px;
`;

const sortAlphabetical = instances =>
  instances.sort((a, b) => (a.name > b.name ? 1 : -1));

const sortByLastPlayed = instances =>
  instances.sort((a, b) => (a.lastPlayed < b.lastPlayed ? 1 : -1));

const sortByMostPlayed = instances =>
  instances.sort((a, b) => (a.timePlayed < b.timePlayed ? 1 : -1));

const getInstances = (instances, sortOrder, customOrder = []) => {
  // Data normalization for missing fields
  const inst = instances.map(instance => {
    return {
      ...instance,
      timePlayed: instance.timePlayed || 0,
      lastPlayed: instance.lastPlayed || 0
    };
  });

  // Custom order (drag-and-drop)
  if (sortOrder === 3) {
    if (customOrder.length > 0) {
      return customOrder
        .map(name => inst.find(i => i.name === name))
        .filter(Boolean);
    }
    return inst;
  }

  switch (sortOrder) {
    case 0:
      return sortAlphabetical(inst);
    case 1:
      return sortByLastPlayed(inst);
    case 2:
      return sortByMostPlayed(inst);
    default:
      return inst;
  }
};

const Instances = () => {
  const dispatch = useDispatch();
  const instanceSortOrder = useSelector(
    state => state.settings.instanceSortOrder
  );
  const instances = useSelector(_getInstances);
  const customInstanceOrder = useSelector(
    state => state.settings.customInstanceOrder || []
  );

  const [localOrder, setLocalOrder] = useState(() => {
    return customInstanceOrder.length > 0 ? customInstanceOrder : [];
  });

  useEffect(() => {
    if (customInstanceOrder.length > 0) {
      setLocalOrder(customInstanceOrder);
    }
  }, [customInstanceOrder]);

  useEffect(() => {
    if (instanceSortOrder === 3 && localOrder.length === 0 && instances.length > 0) {
      const initialOrder = instances.map(i => i.name);
      setLocalOrder(initialOrder);
      dispatch(updateInstanceOrder(initialOrder));
    }
  }, [instanceSortOrder, instances.length]);

  const memoInstances = useMemo(
    () => getInstances(instances || [], instanceSortOrder, localOrder),
    [instances, instanceSortOrder, localOrder]
  );

  const [draggedInstance, setDraggedInstance] = useState(null);
  const [dragOverInstance, setDragOverInstance] = useState(null);

  const handleDragStart = (e, instanceName) => {
    setDraggedInstance(instanceName);
    e.dataTransfer.effectAllowed = 'move';
    const dragImage = document.createElement('div');
    dragImage.style.opacity = '0';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragOver = (e, instanceName) => {
    e.preventDefault();
    if (draggedInstance && draggedInstance !== instanceName) {
      setDragOverInstance(instanceName);
    }
  };

  const handleDrop = (e, targetInstanceName) => {
    e.preventDefault();
    if (draggedInstance && draggedInstance !== targetInstanceName) {
      const currentOrder = localOrder.length > 0
        ? [...localOrder]
        : [...instances.map(i => i.name)];

      const draggedIndex = currentOrder.indexOf(draggedInstance);
      const targetIndex = currentOrder.indexOf(targetInstanceName);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        currentOrder.splice(draggedIndex, 1);
        currentOrder.splice(targetIndex, 0, draggedInstance);

        setLocalOrder(currentOrder);

        dispatch(updateInstanceOrder(currentOrder));
      }
    }
    setDraggedInstance(null);
    setDragOverInstance(null);
  };

  const handleDragEnd = () => {
    setDraggedInstance(null);
    setDragOverInstance(null);
  };

  const sortOptions = [
    { value: 0, label: 'По алфавиту', icon: faSortAlphaDown },
    { value: 1, label: 'По последним', icon: faSortNumericDown },
    { value: 2, label: 'По популярным', icon: faSortNumericDownAlt },
    { value: 3, label: 'Свой порядок', icon: faArrowsAltV }
  ];

  const currentSort = sortOptions.find(s => s.value === instanceSortOrder);

  const sortMenu = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: '150px'
      }}
    >
      {sortOptions.map(option => (
        <Button
          key={option.value}
          type={instanceSortOrder === option.value ? 'primary' : 'text'}
          onClick={() => {
            dispatch(updateInstanceSortType(option.value));
            if (option.value === 3 && localOrder.length === 0) {
              const initialOrder = instances.map(i => i.name);
              setLocalOrder(initialOrder);
              dispatch(updateInstanceOrder(initialOrder));
            }
          }}
          style={{ justifyContent: 'flex-start' }}
        >
          <FontAwesomeIcon
            icon={option.icon}
            style={{ marginRight: '8px', width: '16px' }}
          />
          {option.label}
        </Button>
      ))}
    </div>
  );

  return (
    <>
      <SortControls>
        <Popover content={sortMenu} trigger="click" placement="topLeft" zIndex={80}>
          <SortButton type="primary">
            <FontAwesomeIcon icon={currentSort?.icon || faSort} />
            {currentSort?.label || 'Сортировка'}
          </SortButton>
        </Popover>
      </SortControls>
      <Container>
        {memoInstances.length > 0 ? (
          memoInstances.map(i => (
            <DraggableWrapper
              key={i.name}
              draggable={instanceSortOrder === 3}
              isDragging={draggedInstance === i.name}
              isDragOver={dragOverInstance === i.name && dragOverInstance !== draggedInstance}
              onDragStart={e => handleDragStart(e, i.name)}
              onDragOver={e => handleDragOver(e, i.name)}
              onDrop={e => handleDrop(e, i.name)}
              onDragEnd={handleDragEnd}
            >
              <Instance instanceName={i.name} />
            </DraggableWrapper>
          ))
        ) : (
          <NoInstance>
            Клиенты не установлены
            <SubNoInstance>
              Нажмите на значок + в нижнем левом углу, чтобы скачать клиент
            </SubNoInstance>
          </NoInstance>
        )}
      </Container>
    </>
  );
};

export default memo(Instances);