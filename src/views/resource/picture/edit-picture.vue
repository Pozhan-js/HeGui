<template>
  <div>
    <el-dialog v-bind="$attrs" v-on="$listeners" @open="onOpen" width="500px" @close="onClose" :title="type | title">
      <el-form ref="elForm" :model="formData" :rules="rules" size="medium" label-width="100px">
        <el-form-item label="图片分组" prop="fileGroupId" required>
          <el-select filterable v-model="formData.fileGroupId" placeholder="请选择图片分组" clearable :style="{width: '100%'}">
            <el-option v-for="(item, index) in groupData.rows" :key="index" :label="item.groupName"
              :value="item.groupId" :disabled="item.disabled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="上传图片" prop="fileKey" class="is-required">
          <image-upload
            @change="onChange"
            ref="upload"
            @success="onSuccess"
            v-model="formData.fileKey"
            :params="{fileGroupId: formData.fileGroupId, fileName: formData.fileName}"
          />
        </el-form-item>
        <el-form-item label="图片描述" prop="fileName">
          <el-input max="50" v-model="formData.fileName" type="textarea" placeholder="请输入图片描述"/>
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
import ImageUpload from '@/components/ImageUpload'
import * as pictureApi from '@/api/resource/picture'
import useRows from './useRows'

export default {
  inheritAttrs: false,
  components: {ImageUpload},
  props: ['fileId', 'type', 'groupId'],
  data() {
    return {
      formData: {
        fileGroupId: null,
        fileKey: null,
        fileName: null,
      },
      rules: {
        fileGroupId: [{
          required: true,
          message: '请选择图片分组',
          trigger: 'change'
        }],
        fileKey: [{
          validator: (rule, value, callback) => {
            if (this.$refs.upload.fileList.length) {
              callback()
            } else {
              callback(new Error('请选择上传图片'))
            }
          },
          trigger: 'change'
        }],
        fileName: [{
          max: 50,
          message: '只能输入50个字符以内'
        }]
      },
      groupData: useRows(pictureApi.fileGroup, 'data'),
    }
  },
  filters: {
    title(type) {
      switch(type) {
        case 'create':
          return '新增图片资源'
        case 'update':
          return '修改图片资源'
      }
    }
  },
  watch: {
    groupId(value) {
      this.formData.fileGroupId = value
    }
  },
  methods: {
    async onOpen() {
      this.formData.fileGroupId = this.groupId
      this.groupData.run()
      if (this.fileId != null) {
        const result = await pictureApi.fileInfo(this.fileId)
        if (result.code === 200) {
          this.formData = result.data
        }
      }
    },
    onSuccess() {
      this.close()
      this.$emit('complete')
    },
    onChange(file) {
      this.formData.fileName = file.name
    },
    onClose() {
      this.$refs.elForm.resetFields()
      this.$refs.upload.reset()
    },
    close() {
      this.$emit('update:visible', false)
    },
    handelConfirm() {
      this.$refs['elForm'].validate(async valid => {
        if (!valid) return
        await this.$refs.upload.submit()
        // this.close()
      })
    },
  }
}

</script>
<style>
.el-upload__tip {
  line-height: 1.2;
}

</style>
