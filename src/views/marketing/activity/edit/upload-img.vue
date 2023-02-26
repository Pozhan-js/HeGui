<template>
  <el-upload
    ref="uploadRef"
    :limit="1"
    accept="image/*"
    class="avatar-uploader"
    list-type="picture-card"
    :action="actionUrl"
    :headers="headers"
    :show-file-list="!!uploadUrl"
    :file-list="fileList"
    :on-success="handleSuccess"
    :on-remove="handleRemove"
  >
    <i class="el-icon-plus avatar-uploader-icon" />
  </el-upload>
</template>

<script>
import { getToken } from '@/utils/auth'

export default {
  props: {
    value: String
  },
  data: () => ({
    actionUrl: process.env.VUE_APP_BASE_API + '/system/file/uploadApi',
    headers: {
      Authorization: 'Bearer ' + getToken()
    },
    prefix: sessionStorage.getItem('prefix'),
    uploadUrl: undefined,
    fileList: []
  }),
  watch: {
    value: {
      immediate: true,
      handler(newV) {
        if (newV) {
          this.uploadUrl = this.value
          this.fileList = [{ url: this.value }]
        }
      }
    }
  },
  methods: {
    clearFiles() {
      this.$refs.uploadRef.clearFiles()
    },
    handleSuccess(res) {
      if (res.data?.fileKey) {
        this.uploadUrl = this.prefix + res.data?.fileKey
        this.$emit('input', this.uploadUrl)
      } else {
        this.msgError(res.msg)
        this.clearFiles()
      }
    },
    handleRemove() {
      this.uploadUrl = undefined
      this.$emit('input', this.uploadUrl)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/styles/variables";

  .avatar-uploader /deep/ .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader  /deep/ .el-upload:hover {
    border-color: $primaryHover;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    line-height: 120px;
    text-align: center;
  }
  .avatar {
    width: 120px;
    height: 120px;
    display: block;
  }
</style>
