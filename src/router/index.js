import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router';
import Layout from '../admin/layout/index.vue';

import Settings from '../components/Settings.vue';
import StudyList from '../components/StudyList.vue';
import RemoteStudyList from '../components/RemoteStudyList.vue';
import UploadHandler from '../components/UploadHandler.vue';
import SideBar from '../components/SideBar.vue';
import NotFound from '../components/NotFound.vue';
import { baseOe2Url } from '../globalConfigurations';
import { nextTick } from 'vue';

console.log('Base URL for router: ', baseOe2Url);

function removeKeyCloakStates(to, from, next) {
  if (to.path.includes('&state=')) {
    // the router does not recognize the &state=... after a redirect from KeyCloak -> simply block it (it works but I don't really understand why !)
    console.log('removeKeyCloakStates', to, from);
    next(false);
  } else {
    next();
  }
}

// importing multiple modules from the file system: https://cn.vitejs.dev/guide/features.html#glob-import
const modules = import.meta.glob('../admin/views/**/**.vue');
const _import = (file) => modules[`../admin/views/${file}.vue`];
//console.debug('modules', modules);

export const constRouters = [
  {
    path: '/404',
    component: _import('error/404'),
    name: 'NotFound',
    meta: { hidden: true },
  },
  {
    path: '/401',
    component: _import('error/401'),
    name: 'NotAuth',
    meta: { hidden: true },
  },
  { path: '/', redirect: '/dashboard', meta: { hidden: true } },
  {
    path: '/dashboard',
    component: Layout,
    name: 'Dashboard',
    meta: { icon: 'Odometer', auth: true },
    children: [
      {
        path: '',
        // dont't use repeat name
        // who use repeat name first, it will render the first one, and doesn't render the other component
        name: 'DashboardX',
        component: _import('dashboard'),
        // components: {
        //   SideBarView: SideBar,
        //   ContentView: StudyList, //_import('dashboard'),
        // },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: _import('member/login'),
    // components: {
    //   SideBarView: SideBar,
    //   ContentView: StudyList,
    // },
    meta: { hidden: true },
    props: (route) => ({ redirect: route.query.redirect }),
  },
  {
    path: '/register',
    name: 'Register',
    // components: {
    //   SideBarView: SideBar,
    //   ContentView: StudyList,
    // },
    component: _import('member/register'),
    meta: { hidden: true },
    props: (route) => ({ redirect: route.query.redirect }),
  },
  {
    path: '/nestedMenu',
    component: Layout,
    name: 'Nested Menu',
    meta: { icon: 'menu', dropDown: true, hidden: true },
    children: [
      {
        path: '11',
        name: '11',
        component: _import('nestedMenu/11'),
        meta: { icon: 'menu' },
      },
      {
        path: '12',
        name: '12',
        // use empty.vue to be a children placeholder
        component: _import('empty'),
        meta: { icon: 'menu', dropDown: true },
        children: [
          {
            path: '12-21',
            name: '12-21',
            component: _import('nestedMenu/12-21'),
            meta: { icon: 'menu' },
          },
          {
            path: '12-22',
            name: '12-22',
            component: _import('nestedMenu/12-22'),
            meta: { icon: 'menu' },
          },
          {
            path: '12-23',
            name: '12-23',
            component: _import('empty'),
            meta: { icon: 'menu', dropDown: true },
            children: [
              {
                path: '12-23-31',
                name: '12-23-31',
                component: _import('nestedMenu/12-23-31'),
                meta: { icon: 'menu' },
              },
              {
                path: '12-23-32',
                name: '12-23-32',
                component: _import('nestedMenu/12-23-32'),
                meta: { icon: 'menu' },
              },
            ],
          },
        ],
      },
    ],
  },
];

export const asyncRouters = [
  {
    path: '/studies',
    name: 'Studies',
    component: Layout,
    children: [
      {
        path: 'studies',
        name: 'Studies',
        component: StudyList,
      },
    ],
    meta: { icon: 'DocumentCopy', auth: false },
    props: (route) => ({ redirect: route.query.redirect }),
  },
  {
    path: '/add-studies',
    component: Layout,
    name: 'Add Study',
    meta: { icon: 'DocumentAdd', auth: true },
    children: [
      {
        path: 'add-study',
        name: 'Add Study',
        component: _import('dicomUpload/add'),
      },
    ],
  },

  // {
  //   path: '/filtered-studies',
  //   name: 'Filtered Studies',
  //   components: {
  //     SideBarView: SideBar,
  //     ContentView: StudyList,
  //   },
  //   meta: { icon: 'house', auth: true },
  // },
  // {
  //   path: '/filtered-remote-studies',
  //   name: 'R Studies',
  //   components: {
  //     SideBarView: SideBar,
  //     ContentView: RemoteStudyList,
  //   },
  //   meta: { icon: 'house', auth: true },
  // },
  // {
  //   path: '/settings',
  //   name: 'Settings',
  //   components: {
  //     SideBarView: SideBar,
  //     ContentView: Settings,
  //   },
  //   meta: { icon: 'house', auth: true },
  // },
  {
    path: '/member',
    component: Layout,
    name: 'Users',
    meta: { icon: 'user', dropDown: true },
    children: [
      {
        path: 'profile',
        name: 'Member Profile',
        component: _import('member/profile'),
        meta: { hidden: true, auth: true },
      },
      {
        path: 'list',
        name: 'Manage Users',
        component: _import('member/list'),
        meta: { icon: 'user', auth: true, permission: ['member:list'] },
      },
    ],
  },
  {
    path: '/role',
    component: Layout,
    name: 'Roles & Permissions',
    meta: { icon: 'Key', dropDown: true },
    children: [
      {
        path: 'list',
        name: 'Manage Roles',
        component: _import('role/list'),
        meta: { icon: 'Key', auth: true, permission: ['role:list'] },
      },
    ],
  },
  {
    path: '/imageUpload',
    component: Layout,
    name: 'File Upload',
    meta: { icon: 'upload', auth: true },
    children: [
      {
        path: 'add',
        name: 'Image UploadX',
        component: _import('imageUpload/add'),
      },
    ],
  },
  {
    path: '/pair',
    component: Layout,
    name: 'Pair Config',
    meta: { icon: 'setting', auth: true, permission: ['pair:list'] },
    children: [
      {
        path: 'list',
        name: 'PairX',
        component: _import('pair/list'),
      },
    ],
  },
  {
    path: '/log',
    component: Layout,
    name: 'System Log',
    meta: { icon: 'document', auth: true, permission: ['log:list'] },
    children: [
      {
        path: 'list',
        name: 'LogX',
        component: _import('log/list'),
      },
    ],
  },
];

const defaultRouter = () =>
  createRouter({
    /**
     * History modes: https://router.vuejs.org/zh/guide/essentials/history-mode.html
     * Hash Mode: createWebHashHistory
     * HTML5 Mode: createWebHistory
     */
    history: createWebHashHistory(baseOe2Url),
    routes: constRouters,
    /**
     * Scroll behavior: https://router.vuejs.org/zh/guide/advanced/scroll-behavior.html
     *
     * @param {*} to
     * @param {*} from
     * @param {*} savedPosition
     * @returns
     */
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition;
      } else {
        // always scroll to top
        return {
          top: 0,
          behavior: 'smooth',
        };
      }
    },
  });

const router = defaultRouter();

export default router;
