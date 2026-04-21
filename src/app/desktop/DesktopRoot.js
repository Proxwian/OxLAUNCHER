import React, { useEffect, memo } from 'react';
import { useDidMount } from 'rooks';
import styled from 'styled-components';
import { Switch } from 'react-router';
import { ipcRenderer } from 'electron';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { message } from 'antd';
import RouteWithSubRoutes from '../../common/components/RouteWithSubRoutes';
import {
  addStartedInstance,
  launchInstance,
  loginWithAccessToken,
  initManifests,
  initNews,
  loginThroughNativeLauncher,
  switchToFirstValidAccount,
  selectFirstValidAccount,
  checkClientToken,
  updateUserData,
  loginWithOAuthAccessToken
} from '../../common/reducers/actions';
import {
  load,
  received,
  requesting
} from '../../common/reducers/loading/actions';
import features from '../../common/reducers/loading/features';
import GlobalStyles from '../../common/GlobalStyles';
import RouteBackground from '../../common/components/RouteBackground';
import ga from '../../common/utils/analytics';
import routes from './utils/routes';
import {
  _getCurrentAccount,
  _getInstances
} from '../../common/utils/selectors';
import { isLatestJavaDownloaded } from './utils';
import SystemNavbar from './components/SystemNavbar';
import useTrackIdle from './utils/useTrackIdle';
import { openModal } from '../../common/reducers/modals/actions';
import Message from './components/Message';
import {
  ACCOUNT_MICROSOFT
} from '../../common/utils/constants';

const isMissingIpcHandler = err =>
  String(err?.message || err).includes('No handler registered');

const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
`;

const Container = styled.div`
  position: absolute;
  top: ${props => props.theme.sizes.height.systemNavbar}px;
  height: calc(100vh - ${props => props.theme.sizes.height.systemNavbar}px);
  width: 100vw;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
  transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: transform;
`;

function DesktopRoot({ store }) {
  const dispatch = useDispatch();
  const currentAccount = useSelector(_getCurrentAccount);
  const instances = useSelector(_getInstances);
  const authenticationState = useSelector(
    state => state.loading[features.mcAuthentication]
  );
  const clientToken = useSelector(state => state.app.clientToken);
  const java8Path = useSelector(state => state.settings.java.path8);
  const java17Path = useSelector(state => state.settings.java.path17);
  const java21Path = useSelector(state => state.settings.java.path21);
  const location = useSelector(state => state.router.location);
  // const modals = useSelector(state => state.modals);
  const shouldShowDiscordRPC = useSelector(state => state.settings.discordRPC);
  const [pendingProtocolInstance, setPendingProtocolInstance] = React.useState(null);
  // const [contentStyle, setContentStyle] = useState({ transform: 'scale(1)' });
  const resolvedPendingProtocolInstance = React.useMemo(() => {
    if (!pendingProtocolInstance) return null;

    return (
      instances.find(instance => instance.name === pendingProtocolInstance)?.name ||
      instances.find(
        instance =>
          instance.name?.trim().toLowerCase() ===
          pendingProtocolInstance.trim().toLowerCase()
      )?.name ||
      null
    );
  }, [instances, pendingProtocolInstance]);

  const queueProtocolLaunch = protocolUrl => {
    if (!protocolUrl) return;

    try {
      const parsed = new URL(protocolUrl);
      const launchTarget = parsed.hostname || parsed.pathname.replace(/^\/+/, '');
      const normalizedLaunchTarget = launchTarget.replace(/\/+$/, '');
      if (normalizedLaunchTarget !== 'launch-instance') return;
      const instanceName = parsed.searchParams.get('name');
      if (instanceName) {
        setPendingProtocolInstance(instanceName);
      }
    } catch (err) {
      console.error(err);
    }
  };

  message.config({
    top: 45,
    maxCount: 1
  });

  const init = async () => {
    dispatch(requesting(features.mcAuthentication));
    const userDataStatic = await ipcRenderer.invoke('getUserData');
    const userData = dispatch(updateUserData(userDataStatic));
    await dispatch(checkClientToken());
    dispatch(initNews());

    const manifests = await dispatch(initManifests());

    let isJava8OK = false;
    let isJava17OK = false;
    let isJava21OK = false;

    if (!java8Path) {
      ({ isValid: isJava8OK } = await isLatestJavaDownloaded(
        manifests,
        userData,
        true
      ));
    }

    if (!isJava17OK) {
      ({ isValid: isJava17OK } = await isLatestJavaDownloaded(
        manifests,
        userData,
        true,
        17
      ));
    }

    if (!isJava21OK) {
      ({ isValid: isJava21OK } = await isLatestJavaDownloaded(
        manifests,
        userData,
        true,
        21
      ));
    }

    if (!isJava8OK || !isJava17OK) {
      dispatch(openModal('JavaSetup', { preventClose: true }));

      // Super duper hacky solution to await the modal to be closed...
      // Please forgive me
      await new Promise(resolve => {
        function checkModalStillOpen(state) {
          return state.modals.find(v => v.modalType === 'JavaSetup');
        }

        let currentValue;
        const unsubscribe = store.subscribe(() => {
          const previousValue = currentValue;
          currentValue = store.getState().modals.length;
          if (previousValue !== currentValue) {
            const stillOpen = checkModalStillOpen(store.getState());

            if (!stillOpen) {
              unsubscribe();
              return resolve();
            }
          }
        });
      });
    }

    if (currentAccount) {
      dispatch(
        load(
          features.mcAuthentication,
          dispatch(
            currentAccount.accountType === ACCOUNT_MICROSOFT
              ? loginWithOAuthAccessToken()
              : loginWithAccessToken()
          )
        )
      ).catch(() => {
        dispatch(selectFirstValidAccount());
      });
    } else {
      dispatch(
        load(features.mcAuthentication, dispatch(loginThroughNativeLauncher()))
      ).catch(() => {
        dispatch(selectFirstValidAccount());
      });
    }

    if (shouldShowDiscordRPC) {
      ipcRenderer.invoke('init-discord-rpc');
    }

    ipcRenderer
      .invoke('consume-pending-protocol-url')
      .then(queueProtocolLaunch)
      .catch(err => {
        if (!isMissingIpcHandler(err)) {
          console.error(err);
        }
      });

    ipcRenderer.on('custom-protocol-event', (e, data) => {
      queueProtocolLaunch(data);
    });
  };

  // Handle already logged in account redirect
  useDidMount(init);

  useEffect(() => {
    if (!currentAccount) {
      dispatch(push('/'));
    }
  }, [currentAccount]);

  useEffect(() => {
    if (clientToken && process.env.NODE_ENV !== 'development') {
      ga.setUserId(clientToken);
      ga.trackPage(location.pathname);
    }
  }, [location.pathname, clientToken]);

  useEffect(() => {
    if (!currentAccount || !pendingProtocolInstance) return;
    if (authenticationState?.isRequesting) return;
    if (!resolvedPendingProtocolInstance) {
      return;
    }

    dispatch(push('/home'));
    dispatch(addStartedInstance({ instanceName: resolvedPendingProtocolInstance }));
    dispatch(launchInstance(resolvedPendingProtocolInstance));
    setPendingProtocolInstance(null);
  }, [
    authenticationState?.isRequesting,
    currentAccount,
    dispatch,
    pendingProtocolInstance,
    resolvedPendingProtocolInstance
  ]);

  useTrackIdle(location.pathname);

  // useEffect(() => {
  //   if (
  //     modals[0] &&
  //     modals[0].modalType === 'Settings' &&
  //     !modals[0].unmounting
  //   ) {
  //     setContentStyle({ transform: 'scale(0.4)' });
  //   } else {
  //     setContentStyle({ transform: 'scale(1)' });
  //   }
  // }, [modals]);

  return (
    <Wrapper>
      <SystemNavbar />
      <Message />
      <Container>
        <GlobalStyles />
        <RouteBackground />
        <Switch>
          {routes.map((route, i) => (
            <RouteWithSubRoutes key={i} {...route} /> // eslint-disable-line
          ))}
        </Switch>
      </Container>
    </Wrapper>
  );
}

export default memo(DesktopRoot);
