<template>
  <div class="component-upload-image" :class="{vertical}">
    <div class="picker-perview">
      <div class="el-upload el-upload--picture-card" :key="path" v-for="path in valueList">
        <el-image :src="prefix + path + (timestamp ? `?t=${date}` : '')" :style="`width:150px;height:150px;`" fit="fill"/>
        <div class="mask">
          <div class="actions">
            <span title="预览" @click.stop="previewItem(path)">
              <i style="font-size: 20px; color: #1890ff" class="el-icon-zoom-in"/>
            </span>
            <span title="移除" v-if="!disabled && showRemove" @click.stop="removeItem(path)">
              <i style="font-size: 20px; color: #ff4949; margin-left: 20px" class="el-icon-delete"/>
            </span>
          </div>
        </div>
      </div>
      <div
        @click="handleAdd"
        class="add el-upload el-upload--picture-card"
        v-if="!disabled && limit > valueList.length"
      >
        <i class="el-icon-plus"/>
      </div>
    </div>
    <span class="size-hint" v-if="sizeHint != null">{{ sizeHint }}</span>
    <el-dialog :visible.sync="perviewDialogVisible" title="预览" width="800" append-to-body>
      <img :src="prefix + previewImg" style="display: block; max-width: 100%; margin: 0 auto;">
    </el-dialog>
    <el-dialog
      :visible.sync="pickerDialogVisible"
      title="选择图片"
      width="955px"
      append-to-body
      class="resource-picker-dialog"
    >
      <el-tabs style="height: 620px" v-loading="groupData.loading" v-model="paginator.groupId" tab-position="left">
        <el-tab-pane :name="group.groupId" :key="group.groupId" v-for="group in groupData.rows"
                     :label="group.groupName">
          <div class="tab-pane-content">
            <empty style="padding-top: 100px" v-if="!onLoading && fileList.length === 0"/>
            <el-checkbox-group v-model="picked">
              <div
                class="image-item"
                v-for="(i, index) in fileList"
                :key="i.fileId"
                @click.prevent="handlePick(i.fileKey)"
                :style="{
                  'margin-right': (index + 1) % 4 === 0 ? 0 : '15px',
                  'margin-bottom': '15px'
                }"
              >
                <div class="image-item-header">
                  <el-checkbox :label="i.fileKey"></el-checkbox>
                </div>
                <div :class="{show: i.size != null}" class="size">{{ i.size }}</div>
                <el-image
                  @mouseenter="(e) => getSize(i, e)"
                  :src="i.src"
                  :style="{
                    width: '180px',
                    height: '180px',
                  }"
                >
                </el-image>
              </div>
            </el-checkbox-group>
          </div>
          <el-pagination
            :page-size.sync="paginator.pageSize"
            :current-page.sync="paginator.pageNum"
            background
            layout="prev, pager, next"
            :total="paginator.total"
          />
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog_footer">
        <el-upload
          v-if="picked.length < limit"
          accept="image/*"
          :action="uploadImgUrl"
          :on-success="handleSuccess"
          :show-file-list="false"
          ref="uploader"
          name="file"
          :headers="headers"
          style="float: left; margin-left: 0px"
          :on-error="stopLoading"
          :before-upload="startLoading"
          :on-change="handleChange"
          :auto-upload="showDialog"
        >
          <el-button icon="el-icon-upload" type="success">使用本地图片</el-button>
        </el-upload>
        <el-button @click="pickerDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleChoose">选 择</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import * as pictureApi from '@/api/resource/picture'
import useRows from '@/views/resource/picture/useRows'
import Empty from '@/components/Empty'

export default {
  components: { Empty },
  data() {
    return {
      uploadImgUrl: process.env.VUE_APP_BASE_API + '/system/file/upload',
      headers: {
        Authorization: 'Bearer ' + getToken()
      },
      pickerDialogVisible: false,
      perviewDialogVisible: false,
      onLoading: false,
      hasMore: true,
      fileList: [],
      prefix: sessionStorage.getItem('prefix'),
      picked: [],
      previewImg: '',
      paginator: {
        pageSize: 12,
        pageNum: 1,
        groupId: null,
        total: null
      },
      date: undefined,
      groupData: useRows(pictureApi.fileGroup, 'data')
    }
  },
  props: {
    timestamp: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 1
    },
    disabled: {
      type: Boolean,
      default: false
    },
    sizeHint: String,
    vertical: {
      type: Boolean,
      default: false
    },
    showRemove: {
      type: Boolean,
      default: true
    },
    showDialog: {
      type: Boolean,
      default: true
    },
    value: {
      type: [String, Array],
      default: ''
    }
  },
  computed: {
    valueList() {
      if (this.value && this.value.length !== 0) {
        return this.value.split(',')
      }
      return []
    }
  },
  mounted() {
    this.groupData.run()
    this.setPicked(this.value)
  },
  methods: {
    handleAdd() {
      if (this.showDialog) {
        this.pickerDialogVisible = true
      } else {
        this.$refs.uploader?.$refs['upload-inner']?.$refs.input?.click()
      }
    },
    setPicked(str) {
      if (!str) {
        this.picked = []
      } else {
        this.picked =str.split(',')
      }
    },
    // 鼠标划入获取图片尺寸
    getSize(item, event) {
      if (item.size != null) {
        return;
      }
      this.fileList = this.fileList.map((i) => {
        if (i === item) {
          return {
            ...i,
            size:
              event.target.naturalWidth + ' x ' + event.target.naturalHeight
          }
        }
        return i
      })
    },
    stopLoading() {
      this.loading.close()
    },
    handleChange(file) {
      if (!this.showDialog && file.status === 'ready') {
        this.$emit('select', file.raw)
      }
    },
    startLoading() {
      this.loading = this.$loading({
        lock: true,
        text: '上传中',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    handleSuccess(res) {
      this.loading.close()
      if (res.code === 200) {
        this.picked.push(res.data.fileKey)
        this.$emit('input', this.picked.join(','))
        this.pickerDialogVisible = false
      } else {
        this.msgError(res.msg)
      }
    },
    previewItem(item) {
      this.previewImg = item
      this.perviewDialogVisible = true
    },
    handlePick(path) {
      // 如果有，取消勾选
      if (this.picked.includes(path)) {
        this.picked = this.picked.filter(i => i !== path)
      } else if (this.limit === 1) {
        this.picked = [path]
      } else if (this.picked.length < this.limit) {
        this.picked.push(path)
      } else {
        this.msgInfo('图片最多可选' + this.limit + '张')
      }
    },
    handleChoose() {
      this.$emit('input', this.picked.join(','))
      this.pickerDialogVisible = false
    },
    removeItem(item) {
      this.$emit('input', this.picked.filter(i => i !== item).join(','))
    },
    async getFileList() {
      const { total, groupId, ...params } = this.paginator
      this.onLoading = true
      const result = await pictureApi.fileListTableData({ fileGroupId: groupId }, params)
      if (result.code === 200) {
        this.onLoading = false
        if (result.rows.length < this.paginator.pageSize) {
          this.hasMore = false
        }
        this.fileList = result.rows.map(i => ({
          ...i,
          src: this.prefix + i.fileKey
        }))
        this.$set(this.paginator, 'total', +result.total)
      }
    }
  },
  watch: {
    'groupData.rows'(rows) {
      this.paginator.groupId = rows?.[0]?.groupId
    },
    value: 'setPicked',
    'paginator.pageSize': 'getFileList',
    'paginator.pageNum': 'getFileList',
    'paginator.groupId'(v) {
      /**
       * @fuck ElementUI, tabs vModel 双向绑定 BUG，第一次渲染值为 ‘0’
       */
      if (v !== '0') {
        this.getFileList()
      }
    },
    value() {
      if (this.timestamp) {
        this.date = Date.now()
      }
    },
  }
}
</script>

<style scoped lang="scss">
.component-upload-image {
  display: flex;
  align-items: center;

  &.vertical {
    width: 100%;
    flex-direction: column;

    .size-hint {
      margin-left: 0;
      margin-top: 10px;
    }
  }

  .el-upload--picture-card {
    margin-right: 18px;
    margin-bottom: 18px;
    overflow: hidden;
    position: relative;

    .mask {
      opacity: 0;
      position: absolute;
      top: 0;
      width: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      transition: all 0.3s;
    }

    &:hover .mask {
      opacity: 1;
    }
  }

  .size-hint {
    margin-left: 20px;
    font-size: 14px;
    color: #b1b1b1;
  }

  .dialog_footer {
    text-align: right;
    padding-bottom: 0;
  }
}

.resource-picker-dialog {
  .image-item {
    position: relative;

    .size {
      position: absolute;
      z-index: 999;
      top: 0;
      height: 40px;
      left: 0;
      background: rgba(7, 17, 27, 0.4);
      right: 0;
      color: #fff;
      font-size: 14px;
      line-height: 40px;
      text-align: center;
      transition: opacity .4s;
      opacity: 0;

      &.show {
        opacity: 1;
      }
    }

    .image-item-header {
      padding: 10px;
      transform: scale(1.2);
      position: absolute;
      z-index: 1999;
    }
  }

  .tab-pane-content {
    flex: 1;
  }

  ::v-deep {
    .el-tabs__header {
      padding-bottom: 50px;
    }

    .el-tabs__nav-wrap {
      padding-top: 0 !important;
      padding-bottom: 10px !important;
    }

    .el-tabs__nav-scroll {
      overflow: scroll;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .el-tabs__nav-next, .el-tabs__nav-prev {
      display: none;
    }

    .el-tabs__content {
      height: 100%;
    }

    .el-tab-pane {
      height: 100%;
      display: flex;
      flex-direction: column;

      .el-pagination {
        text-align: center;
      }
    }

    .el-dialog__body {
      padding-top: 10px;
      padding-bottom: 0;
    }

    .el-dialog__footer {
      padding-top: 0;
    }

    .el-checkbox__label {
      display: none;
    }

    .el-tabs__item {
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .el-checkbox-group {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
    }
  }
}

</style>
