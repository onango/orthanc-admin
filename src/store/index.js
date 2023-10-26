import { createStore, createLogger } from 'vuex';
import configuration from './modules/configuration';
import studies from './modules/studies';
import jobs from './modules/jobs';
import labels from './modules/labels';
import createPersistedState from 'vuex-persistedstate';
import state from './state';
import getters from './getters';
import actions from './actions';
import mutations from './mutations';
import app from '../admin/store/modules/app';
import member from '../admin/store/modules/member';
import token from '../admin/store/modules/token';
import router from '../admin/store/modules/router';

const debug = process.env.NODE_ENV !== 'production';

export default createStore({
  state: state,
  getters: getters,
  mutations: mutations,
  actions: actions,
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
  plugins: debug ? [createLogger()] : [],
});
