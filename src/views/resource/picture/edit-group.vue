<template>
  <div>
    <el-dialog v-bind="$attrs" @open="onOpen" v-on="$listeners" @close="onClose" width="380px" :title="type | title">
      <el-form ref="elForm" :model="formData" :rules="rules" size="medium" label-width="100px">
        <el-form-item label="分组名称" prop="groupName">
          <el-input v-model="formData.groupName" placeholder="请输入分组名称" clearable/>
        </el-form-item>
        <el-form-item label="分组序号" prop="groupNumber">
          <el-input clearable style="width: 100%" v-model="formData.groupNumber" placeholder="请输入分组序号"/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="handelConfirm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as pictureApi from '@/api/resource/picture'
/**
 * TODO 修改功能暂时没有（修改接口需要和上传接口操作方式一致才便于操作，暂无此接口）
 */
export default {
  inheritAttrs: false,
  components: {},
  props: ['groupId', 'type'],
  filters: {
    title(type) {
      switch(type) {
        case 'create':
          return '添加图片分组'
        case 'update':
          return '修改图片分组'
      }
    }
  },
  data() {
    return {
      formData: {
        groupName: null,
        groupNumber: null,
      },
      rules: {
        groupName: [{
          required: true,
          message: '请输入分组名称',
          trigger: 'blur',
        }, {
          max: 5,
          message: '最多不超过5个字符'
        }],
        groupNumber: [{
          message: '请输入分组序号',
          trigger: 'blur',
        }, {
          pattern: /^\d+$/,
          message: '请输入正整数'
        }],
      },
    }
  },
  methods: {
    async onOpen() {
      if (this.groupId != null) {
        const result = await pictureApi.groupInfo(this.groupId)
        if (result.code === 200) {
          this.formData = result.data
        }
      }
    },
    onClose() {
      this.$refs['elForm'].resetFields()
    },
    close() {
      this.$emit('update:visible', false)
    },
    handelConfirm() {
      this.$refs['elForm'].validate(async valid => {
        if (!valid) return
        if (this.type === 'create') {
          const result = await pictureApi.addGroup(this.formData)
          if (result.code === 200) {
            this.$emit('complete')
            this.msgSuccess('新增成功')
          }
        } else if (this.type === 'update') {
          const result = await pictureApi.updateGroup(this.formData)
          if (result.code === 200) {
            this.$emit('complete')
            this.msgSuccess('修改成功')
          }
        }
        this.close()
      })
    },
  }
}

</script>
<style>
</style>
