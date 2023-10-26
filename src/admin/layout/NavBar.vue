<template>
  <nav
    class="navbar navbar-expand-lg navbar-light border-bottom py-0 fixed-top bg-white"
  >
    <div class="container-fluid">
      <a
        class="navbar-brand d-flex justify-content-start align-items-center border-end"
        href="./index.html"
      >
        <div class="d-flex align-items-center">
          <div class="logo">
            <img :src="logo" />
          </div>
        </div>
      </a>
      <div
        class="d-flex justify-content-between align-items-center flex-grow-1 navbar-actions"
      >
        <!-- Search Bar and Menu Toggle-->
        <div class="d-flex align-items-center">
          <!-- Menu Toggle-->
          <SideBarCollapse />
          <div
            class="menu-toggle cursor-pointer me-4 text-primary-hover transition-color disable-child-pointer"
          >
            <i
              class="ri-skip-back-mini-line ri-lg fold align-middle"
              data-bs-toggle="tooltip"
              data-bs-placement="right"
              title=""
              data-bs-original-title="Close menu"
              aria-label="Close menu"
            ></i>
            <i
              class="ri-skip-forward-mini-line ri-lg unfold align-middle"
              data-bs-toggle="tooltip"
              data-bs-placement="right"
              title=""
              data-bs-original-title="Open Menu"
              aria-label="Open Menu"
            ></i>
          </div>
          <!-- / Menu Toggle-->
        </div>
        <!-- / Search Bar and Menu Toggle-->

        <!-- Right Side Widgets-->
        <div class="d-flex align-items-center">
          <!-- Activity-->
          <button
            class="btn-action mx-1"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasActivity"
            aria-controls="offcanvasActivity"
          >
            <span class="f-w-4 text-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="feather feather-activity"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </span>
          </button>
          <!-- / Activity-->

          <!-- Messages-->
          <button
            class="btn-action mx-1"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasMessage"
            aria-controls="offcanvasMessage"
          >
            <span class="f-w-4 text-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="feather feather-message-square"
              >
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                ></path>
              </svg>
            </span>
          </button>
          <!-- / Messages-->
          <!-- Profile Menu-->
          <div class="dropdown ms-1">
            <button
              class="btn btn-link p-0 position-relative"
              type="button"
              id="profileDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <picture>
                <template v-if="memberData">
                  <el-dropdown class>
                    <span class="el-dropdown-link">
                      <el-avatar
                        class="avatar mr-1"
                        :size="30"
                        :src="memberData.avatar || avatar"
                      ></el-avatar>
                      {{ memberData.nickname || 'None' }}
                      <el-icon class="el-icon--right">
                        <arrow-down />
                      </el-icon>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item icon="avatar">
                          <router-link to="/member/profile"
                            >Profile</router-link
                          >
                        </el-dropdown-item>
                        <el-dropdown-item icon="back" @click="toLogout"
                          >Logout</el-dropdown-item
                        >
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
                <template v-else>
                  <el-button type="text" @click="toLogin">Login</el-button>
                </template>
              </picture>
            </button>
          </div>
          <!-- / Profile Menu-->
        </div>
        <!-- / Notifications & Profile-->
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import SideBarCollapse from './SideBarCollapse.vue';
import avatar from '../assets/image/avatar.png';
import logo from '../assets/image/logo.png';

const store = useStore();
const route = useRoute();
const router = useRouter();

const memberData = computed(() => store.getters.member.memberData);

const toLogin = () => router.push(`/login`);

const toLogout = () =>
  store.dispatch('memberLogout').then(() => {
    if (!route.meta.auth && !route.meta.permission) {
      location.reload();
    } else {
      router.push({ path: '/login', query: { redirect: route.fullPath } });
    }
  });
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  align-items: center;
  height: 40px;
  border-bottom: solid 1px #e6e6e6;
  .logo {
    display: flex;
    justify-content: center;
    width: 200px;
    img {
      width: 50px;
    }
  }
  .rightbar {
    position: absolute;
    right: 2%;
    width: 500px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .el-dropdown-link {
    height: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
