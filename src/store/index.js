import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import user from './modules/user'
import tagsView from './modules/tagsView'
import permission from './modules/permission'
import settings from './modules/settings'
import getters from './getters'
import remind from './modules/remind'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    isLoading: false,
  },
  modules: {
    app,
    user,
    tagsView,
    permission,
    settings,
    remind
  },
  getters
})

export default store
