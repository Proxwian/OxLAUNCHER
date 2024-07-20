import { combineReducers } from 'redux';
import * as ActionTypes from './actionTypes';
import {
  DEFAULT_JAVA_ARGS,
  DEFAULT_MEMORY
} from '../../../app/desktop/utils/constants';
import { MC_STARTUP_METHODS } from '../../utils/constants';

function sounds(state = true, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_SOUNDS:
      return action.sounds;
    default:
      return state;
  }
}

// 0 is stable, 1 is beta
function releaseChannel(state = 0, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_RELEASE_CHANNEL:
      return action.releaseChannel;
    default:
      return state;
  }
}

// 0 is Alphabetical, 1 is last played, 2 is most played
function instanceSortOrder(state = 0, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_INSTANCE_SORT_METHOD:
      return action.value;
    default:
      return state;
  }
}

// 0 is stable, 1 is beta
function concurrentDownloads(state = 3, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_CONCURRENT_DOWNLOADS:
      return action.concurrentDownloads;
    default:
      return state;
  }
}

function discordRPC(state = true, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_DISCORD_RPC:
      return action.val;
    default:
      return state;
  }
}

function hideWindowOnGameLaunch(state = false, action) {
  switch (action.type) {
    case ActionTypes.HIDE_WINDOW_ON_GAME_LAUNCH:
      return action.hideWindow;
    default:
      return state;
  }
}

function potatoPcMode(state = false, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_POTATO_PC_MODE:
      return action.value;
    default:
      return state;
  }
}

function showNews(state = true, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_SHOW_NEWS:
      return action.value;
    default:
      return state;
  }
}

// 1 is stable, 2 is beta, 3 is alpha
function curseReleaseChannel(state = 1, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_CURSE_RELEASE_CHANNEL:
      return action.curseReleaseChannel;
    default:
      return state;
  }
}

function minecraftSettings(
  state = { resolution: { height: 480, width: 854 } },
  action
) {
  switch (action.type) {
    case ActionTypes.UPDATE_MINECRAFT_RESOLUTION:
      return {
        ...state,
        resolution: { ...state.resolution, ...action.resolution }
      };
    default:
      return state;
  }
}

function mcStartupMethod(state = MC_STARTUP_METHODS.DEFAULT, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_MC_STARTUP_METHOD:
      return action.method;
    default:
      return state;
  }
}

function java(
  state = {
    path8: null,
    path17: null,
    path21: null,
    memory: DEFAULT_MEMORY,
    args: DEFAULT_JAVA_ARGS
  },
  action
) {
  switch (action.type) {
    case ActionTypes.UPDATE_JAVA_ARGUMENTS:
      return { ...state, args: action.args };
    case ActionTypes.UPDATE_JAVA_MEMORY:
      return { ...state, memory: action.memory };
    case ActionTypes.UPDATE_JAVA_8_PATH: {
      return { ...state, path8: action.path };
    }
    case ActionTypes.UPDATE_JAVA_17_PATH: {
      return { ...state, path17: action.path };
    }
    case ActionTypes.UPDATE_JAVA_21_PATH: {
      return{ ...state, path21: action.path}
    }
    default:
      return state;
  }
}

export default combineReducers({
  sounds,
  releaseChannel,
  instanceSortOrder,
  concurrentDownloads,
  discordRPC,
  hideWindowOnGameLaunch,
  potatoPcMode,
  showNews,
  curseReleaseChannel,
  java,
  minecraftSettings,
  mcStartupMethod
});
