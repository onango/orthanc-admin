import { createStore, createLogger } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import state from './state';
import getters from './getters';
import actions from './actions';
import mutations from './mutations';
import app from './modules/app';
import member from './modules/member';
import token from './modules/token';
import router from './modules/router';

//orthanc
import configuration from '../orthanc/store/modules/configuration';
import studies from '@/orthanc/store/modules/studies';
import jobs from '@/orthanc/store/modules/jobs';
import labels from '@/orthanc/store/modules/labels';

const debug = process.env.NODE_ENV !== 'production';
const plugins = [
  createPersistedState({
    key: 'vuex',
    storage: window.localStorage,
  }),
];

if (debug) {
  plugins.push(createLogger());
}
//end
export default createStore({
  //   state: state,
  //   getters: getters,
  //   mutations: mutations,
  //   actions: actions,
  modules: {
    app,
    member,
    token,
    router,

    studies,
    configuration,
    jobs,
    labels,
  },
  strict: debug,
  plugins,
});
