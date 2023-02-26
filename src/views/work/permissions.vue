<template>
  <el-form :model="form" class="window-tab">
    <el-form-item label="右侧栏">
      <el-checkbox-group v-model="form.windowTabs">
        <el-checkbox :label="tab.code" :key="tab.code" v-for="tab in allTabs">{{ tab.name }}</el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item style="margin-top: 100px">
      <el-button type="primary" size="small" @click="handleUpdate" :loading="$store.state.isLoading">确定</el-button>
      <el-button size="small" @click="$router.back()">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import {updateUserChatWindowTab, queryChatWindowTab, queryUserChatWindowTab} from '@/api/work/work'

export default {
  data() {
    return {
      form: {
        userId: this.$route.query.userId,
        windowTabs: []
      },
      allTabs: []
    }
  },
  created() {
    this.queryChatWindowTab()
    this.queryUserChatWindowTab()
  },
  methods: {

    async queryChatWindowTab() {
      const result = await queryChatWindowTab()
      this.allTabs = result.data
    },

    async queryUserChatWindowTab() {
      const result = await queryUserChatWindowTab(this.form.userId)
      this.form.windowTabs = result.data.map(i => i.chatWindowTab)
    },

    async handleUpdate() {
      await updateUserChatWindowTab(this.form)
      this.msgSuccess("设置成功");
      this.$router.back()
    },
  },
};
</script>

<style lang="scss" scoped>
.window-tab {
  padding: 20px;
}
</style>
