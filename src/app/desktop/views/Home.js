import React, { useState, useEffect, memo, useMemo } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { ipcRenderer } from 'electron';
import axios from 'axios';
// import { promises as fs } from 'fs';
// import path from 'path';
import Instances from '../components/Instances';
import News from '../components/News';
import { openModal } from '../../../common/reducers/modals/actions';
import {
  _getCurrentAccount
  // _getInstances
} from '../../../common/utils/selectors';
import { extractFace } from '../utils';
import { updateLastUpdateVersion } from '../../../common/reducers/actions';

import path from 'path';
import { _getInstances, _getInstancesPath, _getTempPath } from '../../../common/utils/selectors';

import { useDebouncedCallback } from 'use-debounce';
import { getSearch } from '../../../common/api';
import { addToQueue } from '../../../common/reducers/actions';
import { FABRIC, VANILLA, FORGE, FTB, CURSEFORGE, ACCOUNT_MICROSOFT } from '../../../common/utils/constants';
import { downloadFile } from '../utils/downloader';
import { 
  downloadAddonZip,
  importAddonZip,
  convertcurseForgeToCanonical,
  extractFabricVersionFromManifest
} from '../../../app/desktop/utils';

const AddInstanceIcon = styled(Button)`
  position: fixed;
  bottom: 20px;
  left: 20px;
`;

const AccountContainer = styled(Button)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
`;

const Home = () => {
	let lastRequest;
	
	let isPackLoaded = false;
	
	const setPackNotLoaded = () => {
		isPackLoaded = false;
	}
	
	const setPackLoaded = () => {
		isPackLoaded = true;
	}
	
  const dispatch = useDispatch();
  const account = useSelector(_getCurrentAccount);
  const news = useSelector(state => state.news);
  const lastUpdateVersion = useSelector(state => state.app.lastUpdateVersion);
  const instances = useSelector(_getInstances);
  const instancesPath = useSelector(_getInstancesPath);
  const forgeManifest = useSelector(state => state.app.forgeManifest);

  const openAddInstanceModal = defaultPage => {
    dispatch(openModal('AddInstance', { defaultPage }));
  };

  const openAccountModal = () => {
    dispatch(openModal('AccountsManager'));
  };

  const [profileImage, setProfileImage] = useState(null);
  const [annoucement, setAnnoucement] = useState(null);

  useEffect(() => {
    const init = async () => {
		setInstalling(false);
		setInitinstall(false);
      //const appVersion = await ipcRenderer.invoke('getAppVersion');
      //if (lastUpdateVersion !== appVersion) {
        //dispatch(updateLastUpdateVersion(appVersion));
        //dispatch(openModal('ChangeLogs'));
      //}
      /*try {
        const { data } = await axios.get(
          'https://api.gdlauncher.com/announcement'
        );
        setAnnoucement(data || null);
      } catch (e) {
        console.log('No announcement to show');
      }*/
    };

    init();
  }, []);

  useEffect(() => {
    extractFace(account.skin).then(setProfileImage).catch(console.error);
  }, [account]);
  
  const [modpack, setModpack] = useState([]);
  const [modpacks, setModpacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(true);
  const [initInstall, setInitinstall] = useState(true);
  const [error, setError] = useState(false);
  const [step, setStep] = useState(false);
  const [version, setVersion] = useState(null);
  
  const imageURL = useMemo(() => {
    if (!modpack) return null;
    // Curseforge
    if (!modpack.synopsis) {
      return modpack?.logo?.thumbnailUrl;
    } else {
      // FTB
      const image = modpack?.art?.reduce((prev, curr) => {
        if (!prev || curr.size < prev.size) return curr;
        return prev;
      });
      return image.url;
    }
  }, [modpack]);
  
  const instanceSortOrder = useSelector(
    state => state.settings.instanceSortOrder
  );
  const tempPath = useSelector(_getTempPath);
  
   const loadMoreModpacks = async (reset = false) => {
    const reqObj = {};
    lastRequest = reqObj;
    if (!loading) {
      setLoading(true);
    }
    if (reset && (modpacks.length !== 0)) {
      setModpacks([]);
    }
    let data = null;
    try {
      if (error) {
        return;
      }
	  data = await getSearch(
        'modpacks',
        "oxfortpack",
        40,
        0,
        'Popularity',
        true,
        '',
        0
      );
    } catch (err) {
		console.log("catch err")
      setError(err);
      return;
    }
    const newModpacks = reset ? data : [...modpacks, ...data];
    if (modpacks.length < 1) {
      setLoading(false);
      setModpacks(newModpacks);
	  if (modpacks.length > 0) {
		
	  } else {
		  console.log("modpacks not loaded")
	  }
    }
  };
  
  const updateModpacks = useDebouncedCallback(() => {
    loadMoreModpacks(true);
  }, 250);
  
  const getInstances = (instances, sortOrder) => {
  // Data normalization for missing fields
  const inst = instances.map(instance => {
    return {
      ...instance,
      timePlayed: instance.timePlayed || 0,
      lastPlayed: instance.lastPlayed || 0
    };
  });

  switch (sortOrder) {
    default:
      return inst;
  }
};

  const memoInstances = useMemo(
    () => getInstances(instances || [], instanceSortOrder),
    [instances, instanceSortOrder]
  );
  
  useEffect(() => {
	  /**if (modpacks.length < 1) {
		updateModpacks();
	  } else {
		  if (installing) {
			console.log("isInstalling true");
		  } else {
			 console.log("isInstalling false");
		  }
		  if (instances.length < 1 && !installing) {
			console.log("loadOxfortPack!");
			loadOxfortpack();
			if (initInstall) {
				setInstalling(true);
				setInitinstall(false);
			} else {
				setInitinstall(true);
			}
		  }	
	  }	*/
  });
  
  const loadOxfortpack = () => {
	 const modpack = modpacks[0];
	 
     setVersion({
        projectID: modpack.id,
        fileID: modpack.latestFiles[modpack.latestFiles.length - 1].id,
        source: CURSEFORGE
     });
     setModpack(modpack);
     
	 createInstance("OxfortPack 0x256")
  }


const createInstance = async localInstanceName => {
    if (!version || !localInstanceName) return;

    const initTimestamp = Date.now();

    const isCurseForgeModpack = Boolean(version?.source === CURSEFORGE);
    const isFTBModpack = Boolean(modpack?.art);
    let manifest;

    // If it's a curseforge modpack grab the manfiest and detect the loader
    // type as we don't yet know what it is.
    if (isCurseForgeModpack) {

      manifest = await downloadAddonZip(
          version?.projectID,
          version?.fileID,
          path.join(instancesPath, localInstanceName),
          path.join(tempPath, localInstanceName)
        );

      const isForgeModpack = (manifest?.minecraft?.modLoaders || []).some(
        v => v.id.includes(FORGE) && v.primary
      );

      const isFabricModpack = (manifest?.minecraft?.modLoaders || []).some(
        v => v.id.includes(FABRIC) && v.primary
      );

      if (isForgeModpack) {
        version.loaderType = FORGE;
      } else if (isFabricModpack) {
        version.loaderType = FABRIC;
      } else {
        version.loaderType = VANILLA;
      }
    }

    const isVanilla = version?.loaderType === VANILLA;
    const isFabric = version?.loaderType === FABRIC;
    const isForge = version?.loaderType === FORGE;

    if (isCurseForgeModpack) {
      if (imageURL) {
        await downloadFile(
          path.join(
            instancesPath,
            localInstanceName,
            `background${path.extname(imageURL)}`
          ),
          imageURL
        );
      }

      if (isForge) {
        const loader = {
          loaderType: FORGE,
          mcVersion: manifest.minecraft.version,
          loaderVersion: convertcurseForgeToCanonical(
            manifest.minecraft.modLoaders.find(v => v.primary).id,
            manifest.minecraft.version,
            forgeManifest
          ),
          fileID: version?.fileID,
          projectID: version?.projectID,
          source: version?.source,
          sourceName: manifest.name
        };

        dispatch(
          addToQueue(
            localInstanceName,
            loader,
            manifest,
            imageURL ? `background${path.extname(imageURL)}` : null
          )
        );
      } else if (isFabric) {
        const loader = {
          loaderType: FABRIC,
          mcVersion: manifest.minecraft.version,
          loaderVersion: extractFabricVersionFromManifest(manifest),
          fileID: version?.fileID,
          projectID: version?.projectID,
          source: version?.source,
          sourceName: manifest.name
        };
        dispatch(
          addToQueue(
            localInstanceName,
            loader,
            manifest,
            imageURL ? `background${path.extname(imageURL)}` : null
          )
        );
      } else if (isVanilla) {
        const loader = {
          loaderType: VANILLA,
          mcVersion: manifest.minecraft.version,
          loaderVersion: version?.loaderVersion,
          fileID: version?.fileID
        };

        dispatch(
          addToQueue(
            localInstanceName,
            loader,
            manifest,
            imageURL ? `background${path.extname(imageURL)}` : null
          )
        );
      }
    }

    if (Date.now() - initTimestamp < 2000) {
      await wait(2000 - (Date.now() - initTimestamp));
    }
  };


  return (
    <div>
      <Instances 
      css={`
        bottom: 20px;
        left: 20px;`
      }/>
      <AddInstanceIcon type="primary" onClick={() => openAddInstanceModal(0)}>
        <FontAwesomeIcon icon={faPlus} />
      </AddInstanceIcon>
      <AccountContainer type="primary" onClick={openAccountModal}>
        {profileImage && account.accountType === ACCOUNT_MICROSOFT ? (
          <img
            src={`data:image/jpeg;base64,${profileImage}`}
            css={`
              width: 15px;
              cursor: pointer;
              height: 15px;
              margin-right: 10px;
            `}
            alt="profile"
          />
        ) : ""}
        {account && account.selectedProfile.name}
      </AccountContainer>
    </div>
  );
};

export default memo(Home);
