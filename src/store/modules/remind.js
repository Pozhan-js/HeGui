import { getToken } from '@/utils/auth'

const remind = {
    state: {
        infoArr: [],
        socket: null
    },

    mutations: {
        SET_INFOARR: (state, info) => {
            state.infoArr.push(info)
        },
        DEL_INFOARR: (state, orderId) => {
            console.log(orderId)
            state.infoArr = state.infoArr.filter(item => item.orderId !== orderId)
        },
        SET_SOCKET: (state, event) => {
            state.socket = event
        }
    },

    actions: {
        open() {
            console.log(11)
            console.log("socket连接成功");
        },

        error() {
            console.log("连接错误");
        },

        getMessage(msg) {
            console.log(msg.data);
        },

        send() {
            this.socket.send(getToken());
        },

        close() {
            console.log("socket已经关闭");
        },

        StartSocket({ commit, state, dispatch }) {
            const socket = new WebSocket("ws://192.168.0.100:8082/ws")
            // 监听socket连接
            socket.onopen = dispatch('open');
            // 监听socket错误信息
            socket.onerror = dispatch('error');
            // 监听socket消息
            socket.onmessage = dispatch('getMessage');
            commit('SET_SOCKET', socket)
            
        },

        // 触发消息
        ReadInfo({ commit }, orderId) {
            commit('DEL_INFOARR', orderId)
        },

        // 前端 登出
        EndSocket({ commit, state }) {
            state.socket.onclose = this.close()
            commit('SET_SOCKET', null)
            
        }
    }
}

export default remind
