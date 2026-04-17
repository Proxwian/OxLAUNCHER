/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Select, Input } from 'antd';
import { useDebouncedCallback } from 'use-debounce';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBomb, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { getCurseForgeSearch } from '../../../api';
import { translateLegacyString } from '../../../localization/translations';
import { useTranslation } from '../../../localization/useTranslation';
import ModpacksListWrapper from './ModpacksListWrapper';

let lastRequest;
const CurseForgeModpacks = ({ setStep, setVersion, setModpack }) => {
  const { language, t } = useTranslation();
  const mcVersions = useSelector(state => state.app.vanillaManifest?.versions);
  const categories = useSelector(state => state.app.curseforgeCategories);
  const getCategoryLabel = category =>
    translateLegacyString(language, category?.name || '');
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
    let data = null;
    try {
      if (error) {
        setError(false);
      }
      data = await getCurseForgeSearch(
        'modpacks',
        searchText,
        40,
        reset ? 0 : modpacks.length,
        sortBy,
        true,
        minecraftVersion,
        categoryId
      );
    } catch (err) {
      setError(err);
      setLoading(false);
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
    const discordRPCDetails = t('discord.curseforge.modpacks', 'Смотрит сборки CurseForge');
    ipcRenderer.invoke('update-discord-rpc', discordRPCDetails);
    updateModpacks();
  }, [searchText, sortBy, minecraftVersion, categoryId]);

  return (
    <Container>
      <HeaderContainer>
        <StyledSelect
          placeholder={t('minecraft.version', 'Версия Minecraft')}
          onChange={setMinecraftVersion}
          value={minecraftVersion}
          virtual={false}
        >
          <Select.Option value={null}>{t('common.all_versions', 'Все версии')}</Select.Option>
          {(mcVersions || [])
            .filter(v => v?.type === 'release')
            .map(v => (
              <Select.Option key={v?.id} value={v?.id}>
                {v?.id}
              </Select.Option>
            ))}
        </StyledSelect>
        <StyledSelect
          placeholder={t('categories.placeholder', 'Категория')}
          onChange={setCategoryId}
          value={categoryId}
          virtual={false}
        >
          <Select.Option key="allcategories" value={null}>
            {t('categories.all', 'Все категории')}
          </Select.Option>
          {(categories || [])
            .filter(v => v?.classId === 4471)
            .sort((a, b) => a?.name.localeCompare(b?.name))
            .map(v => (
              <Select.Option value={v?.id} key={v?.id}>
                <div
                  css={`
                    display: flex;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                  `}
                >
                  <img
                    src={v?.iconUrl}
                    css={`
                      height: 16px;
                      width: 16px;
                      margin-right: 10px;
                    `}
                    alt="icon"
                  />
                  {getCategoryLabel(v)}
                </div>
              </Select.Option>
            ))}
        </StyledSelect>
        <StyledSelect
          placeholder={t('common.sort', 'Сортировать')}
          value={sortBy}
          onChange={setSortBy}
          virtual={false}
        >
          <Select.Option key="Featured" value="Featured">
            {t('common.featured', 'Рекомендуемые')}
          </Select.Option>
          <Select.Option key="Popularity" value="Popularity">
            {t('common.popularity', 'Популярные')}
          </Select.Option>
          <Select.Option key="LastUpdated" value="LastUpdated">
            {t('common.updated', 'Обновлённые')}
          </Select.Option>
          <Select.Option key="Name" value="Name">
            {t('common.name', 'Название')}
          </Select.Option>
          <Select.Option key="Author" value="Author">
            {t('common.author', 'Автор')}
          </Select.Option>
          <Select.Option key="TotalDownloads" value="TotalDownloads">
            {t('common.downloads', 'Загрузок')}
          </Select.Option>
        </StyledSelect>
        <StyledInput
          placeholder={t('common.search', 'Поиск...')}
          onSearch={setSearchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
      </HeaderContainer>
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
                {t('modpacks.not_found_with_filters', 'Я ничего не нашёл по заданным фильтрам...')}
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
              {t('modpacks.loading_error', 'Произошла ошибка при загрузке списка модификаций...')}
            </div>
          </div>
        )}
      </ModpacksContainer>
    </Container>
  );
};

export default React.memo(CurseForgeModpacks);

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

