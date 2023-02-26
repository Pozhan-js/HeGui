import variables from '@/assets/styles/element-variables.scss'
import defaultSettings from '@/settings'

const { title, sideTheme, showSettings, topNav, tagsView, fixedHeader, sidebarLogo } = defaultSettings

const storageSetting = JSON.parse(localStorage.getItem('layout-setting')) || ''

const state = {
  title: title,
  theme: storageSetting.theme || variables.theme,
  sideTheme: storageSetting.sideTheme || sideTheme,
  showSettings: showSettings,
  topNav: storageSetting.topNav === void 0 ? topNav : storageSetting.topNav,
  tagsView: storageSetting.tagsView === void 0 ? tagsView : storageSetting.tagsView,
  fixedHeader: storageSetting.fixedHeader === void 0 ? fixedHeader : storageSetting.fixedHeader,
  sidebarLogo: storageSetting.sidebarLogo === void 0 ? sidebarLogo : storageSetting.sidebarLogo
}
const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    // eslint-disable-next-line no-prototype-builtins
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

