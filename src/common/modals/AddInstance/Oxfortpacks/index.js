/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Select, Input } from 'antd';
import { useDebouncedCallback } from 'use-debounce';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBomb, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { getSearch } from '../../../api';
import ModpacksListWrapper from './ModpacksListWrapper';

let lastRequest;
const Oxfortpacks = ({ setStep, setVersion, setModpack }) => {
  const mcVersions = useSelector(state => state.app.vanillaManifest?.versions);
  const categories = useSelector(state => state.app.curseforgeCategories);
  const infiniteLoaderRef = useRef(null);
  const [modpacks, setModpacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minecraftVersion, setMinecraftVersion] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [sortBy, setSortBy] = useState('Featured');
  const [searchText, setSearchText] = useState('');
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState(false);

  const updateModpacks = useDebouncedCallback(() => {
    if (infiniteLoaderRef?.current?.scrollToItem) {
      infiniteLoaderRef.current.scrollToItem(0);
    }
    loadMoreModpacks(true);
  }, 250);

  const loadMoreModpacks = async (reset = false) => {
    const reqObj = {};
    lastRequest = reqObj;
    if (!loading) {
      setLoading(true);
    }
    if (reset && (modpacks.length !== 0 || hasNextPage)) {
      setModpacks([]);
      setHasNextPage(false);
    }
    let data = null;
    try {
      if (error) {
        setError(false);
      }
      data = await getSearch(
        'modpacks',
        'oxfortpack',
        8,
        reset ? 0 : modpacks.length,
        'popularity',
        true,
        minecraftVersion,
        categoryId
      );
    } catch (err) {
      setError(err);
      return;
    }
    const newModpacks = reset ? data : [...modpacks, ...data];
    if (lastRequest === reqObj) {
      setLoading(false);
      setHasNextPage(newModpacks.length % 40 === 0 && newModpacks.length !== 0);
      setModpacks(newModpacks);
    }
  };

  useEffect(() => {
    updateModpacks();
  }, [searchText, sortBy, minecraftVersion, categoryId]);

  return (
    <Container>
      <ModpacksContainer>
        {!error ? (
          !loading && modpacks.length === 0 ? (
            <div
              css={`
                margin-top: 120px;
                display: flex;
                flex-direction: column;
                align-items: center;
                font-size: 150px;
              `}
            >
              <FontAwesomeIcon icon={faExclamationCircle} />
              <div
                css={`
                  font-size: 20px;
                  margin-top: 70px;
                `}
              >
                Мы ничего не нашли по заданным фильтрам...
              </div>
            </div>
          ) : (
            <AutoSizer>
              {({ height, width }) => (
                <ModpacksListWrapper
                  hasNextPage={hasNextPage}
                  isNextPageLoading={loading}
                  items={modpacks}
                  loadNextPage={loadMoreModpacks}
                  width={width}
                  height={height}
                  setStep={setStep}
                  setVersion={setVersion}
                  setModpack={setModpack}
                  infiniteLoaderRef={infiniteLoaderRef}
                />
              )}
            </AutoSizer>
          )
        ) : (
          <div
            css={`
              margin-top: 120px;
              display: flex;
              flex-direction: column;
              align-items: center;
              font-size: 150px;
            `}
          >
            <FontAwesomeIcon icon={faBomb} />
            <div
              css={`
                font-size: 20px;
                margin-top: 70px;
              `}
            >
              Произошла ошибка при загрузке списка модов...
            </div>
          </div>
        )}
      </ModpacksContainer>
    </Container>
  );
};

export default React.memo(Oxfortpacks);

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const StyledSelect = styled(Select)`
  width: 170px;
  margin-right: 20px;
`;

const StyledInput = styled(Input.Search)``;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const ModpacksContainer = styled.div`
  height: calc(100% - 15px);
  overflow: hidden;
  padding: 10px 0;
`;
