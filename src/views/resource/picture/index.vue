
<template>
  <div class="full-screen">
    <div class="picture">
      <div class="header">
        <div class="title">我的图片</div>
      </div>
      <div class="content">
        <div class="group-control">
          <el-tooltip content="上传图片" placement="top-start">
            <el-button
              icon="el-icon-upload"
              type="primary"
              round
              circle
              @click="createFile"
            />
          </el-tooltip>
          <el-tooltip content="添加分组" placement="top">
            <el-button
              icon="el-icon-plus"
              type="success"
              round
              circle
              @click="addGroup"
            />
          </el-tooltip>
          <el-tooltip content="删除图片" placement="top-end">
            <el-button
              :disabled="!checkList.length"
              icon="el-icon-delete"
              type="danger"
              round
              circle
              @click="(e) => removeFiles()"
            />
          </el-tooltip>
        </div>
        <el-tabs
          ref="content"
          v-model="paginator.groupId"
          v-loading="groupData.loading"
          tab-position="left"
          style="height: 100%"
        >
          <el-tab-pane
            v-for="tab in groupData.rows"
            :key="tab.groupId"
            :name="tab.groupId"
          >
            <span slot="label" class="label">
              <span class="field">{{ tab.groupName }}</span>
              <i
                class="el-icon-edit-outline"
                style="margin-left: 10px"
                @click.stop="updateGroup(tab)"
              />
              <i
                class="el-icon-delete"
                style="margin-left: 10px"
                @click.stop="deleteGroup(tab)"
              />
            </span>
            <div v-loading="onLoading" class="tab-content">
              <empty
                v-if="!onLoading && fileList.length === 0"
                style="padding-top: 100px"
              />
              <el-checkbox-group v-model="checkList">
                <span
                  v-for="i in fileList"
                  :key="i.fileId"
                  class="image-item"
                  style="margin-right: 10px; margin-bottom: 10px"
                  @click.prevent="toggle(i.fileId)"
                >
                  <div class="image-item-header">
                    <el-checkbox border :label="i.fileId" />
                    <div class="right">
                      <span class="image-item-size">{{ i.size }}</span>
                      <!-- <i @click.stop="editFile(i)" class="el-icon-edit-outline" style="color:#1890ff;margin-left: 10px" /> -->
                      <i
                        class="el-icon-delete"
                        style="color: #ff4949; margin-left: 10px"
                        @click.stop="removeFile(i)"
                      />
                    </div>
                  </div>
                  <div class="image-item-footer">
                    <div>{{ i.fileName }}</div>
                    <el-button type="primary" size="mini" style="padding: 4px 8px;" @click.stop="copy(i.fileKey)">复制</el-button>
                  </div>
                  <el-image
                    :src="i.src"
                    style="width: 212px; height: 212px"
                    @mouseenter="(e) => getSize(i, e)"
                  />
                </span>
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
      </div>
    </div>
    <EditGroupDialog
      :type="groupDialog.type"
      :group-id="groupDialog.groupId"
      :visible.sync="groupDialog.visible"
      @close="groupDialog = {}"
      @complete="groupData.run"
    />
    <EditPictureDialog
      :type="pictureDialog.type"
      :group-id="paginator.groupId"
      :file-id="pictureDialog.fileId"
      :visible.sync="pictureDialog.visible"
      @close="handleClose"
      @complete="refreshResource"
    />
  </div>
</template>

<script>
import * as pictureApi from '@/api/resource/picture'
import EditGroupDialog from './edit-group'
import Empty from '@/components/Empty'
import EditPictureDialog from './edit-picture'
import useRows from './useRows'
import throttle from 'lodash.throttle'
import Clipboard from 'clipboard'

export default {
  name: 'Pciture',
  components: {
    EditGroupDialog,
    Empty,
    EditPictureDialog
  },
  data() {
    return {
      tabs: [],
      index: null,
      fileList: [],
      t: '',
      prefix: sessionStorage.getItem('prefix'),
      editMode: true,
      checkList: [],
      paginator: {
        pageNum: 1,
        pageSize: 15,
        total: null,
        groupId: null
      },
      onLoading: false,
      hasMore: true,
      groupDialog: {},
      pictureDialog: {},
      groupData: useRows(pictureApi.fileGroup, 'data')
    }
  },
  watch: {
    'groupData.rows'(rows) {
      if ([null, '0'].includes(this.paginator.groupId)) {
        this.$set(this.paginator, 'groupId', rows?.[0]?.groupId)
      }
    },
    'paginator.pageSize': 'getFileListWithGroupId',
    'paginator.pageNum': 'getFileListWithGroupId',
    'paginator.groupId'(v) {
      /**
       * @fuck ElementUI, tabs vModel 双向绑定 BUG，第一次渲染值为 ‘0’
       */
      if (v !== '0') {
        this.getFileListWithGroupId()
      }
    }
  },
  mounted() {
    this.computedMaxSizeWithGetData()
    this.throttleResizeListenner = throttle(this.computedMaxSizeWithGetData, 500)
    window.addEventListener('resize', this.throttleResizeListenner)
  },
  destroyed() {
    window.removeEventListener('resize', this.throttleResizeListenner)
  },
  methods: {
    copy(fileKey) {
      const fakerBtn = document.createElement('button')
      const clipboard = new Clipboard(fakerBtn, { text: () => fileKey })
      clipboard.on('success', () => {
        this.msgSuccess('复制成功')
        clipboard.destroy()
      })
      fakerBtn.click()
    },
    handleClose() {
      this.pictureDialog = {}
    },
    computedMaxSizeWithGetData() {
      try {
        // 计算最多放多少个 行和列， 再相乘， image-item 宽高 212 margin-left 10
        const boundClient =
          this.$refs.content.$el.children[1].getBoundingClientRect()
        this.paginator.pageSize =
          Math.floor(boundClient.width / 222) *
          Math.floor(boundClient.height / 222)
      } finally {
        this.groupData.run()
      }
    },
    // 鼠标划入获取图片尺寸
    getSize(item, event) {
      if (item.size != null) {
        return
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
    async removeFile(file) {
      this.removeFiles([file.fileId])
    },
    async removeFiles(files) {
      const file = files || this.checkList
      console.log(file)
      await this.$confirm('是否确定删除勾选图片?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const result = await pictureApi.removeFiles(file.join(','))
      if (result.code === 200) {
        this.msgSuccess('删除成功')
        this.refreshResource()
      }
    },
    addGroup() {
      this.groupDialog = {
        visible: true,
        type: 'create'
      }
    },
    createFile() {
      this.pictureDialog = {
        visible: true,
        type: 'create'
      }
    },
    editFile(file) {
      this.pictureDialog = {
        visible: true,
        type: 'update',
        fileId: file.fileId
      }
    },
    updateGroup(group) {
      this.groupDialog = {
        visible: true,
        type: 'update',
        groupId: group.groupId
      }
    },
    async deleteGroup(group) {
      await this.$confirm(`是否确定删除${group.groupName}?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const result = await pictureApi.removeGroup(group.groupId)
      if (result.code === 200) {
        this.msgSuccess('删除成功')
        this.groupData.run()
      }
    },
    toggle(fileId) {
      const checkSet = new Set(this.checkList)
      if (checkSet.has(fileId)) {
        checkSet.delete(fileId)
        this.checkList = Array.from(checkSet)
      } else {
        this.checkList.push(fileId)
      }
    },
    refreshResource() {
      this.groupData.run()
      this.getFileListWithGroupId()
    },
    // 获取文件列表
    async getFileListWithGroupId() {
      const { total, groupId, ...params } = this.paginator
      this.checkList = []
      this.onLoading = true
      const result = await pictureApi.fileListTableData(
        { fileGroupId: groupId },
        params
      )
      if (result.code === 200) {
        this.onLoading = false
        if (result.rows.length < this.paginator.pageSize) {
          this.hasMore = false
        }
        this.fileList = result.rows.map((i) => ({
          ...i,
          src: this.prefix + i.fileKey
        }))
        this.$set(this.paginator, 'total', +result.total)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.full-screen {
  height: calc(100vh - 50px);
  padding: 10px;
  overflow: hidden;
  .picture {
    box-shadow: 1px 1px 6px 0 rgba(7, 17, 27, 0.1);
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 10px;
    .header {
      margin-bottom: 10px;
      padding: 10px;
      .title {
        font-size: 20px;
        font-weight: bold;
      }
    }
    .content {
      padding-bottom: 10px;
      flex: 1;
      position: relative;
      overflow: hidden;
      .tab-content {
        flex: 1;
        overflow-y: scroll;
        padding-left: 10px;
      }
      .label {
        flex: 1;
        display: flex;
        overflow: hidden;
        align-items: center;
        .field {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .group-control {
        position: absolute;
        z-index: 999;
        top: 0;
        width: 200px;
        text-align: center;
      }
      .image-item {
        position: relative;
        display: inline-block;
        overflow: hidden;
        .image-item-footer {
          position: absolute;
          align-items: center;
          display: flex;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50px;
          transition: all 0.2s ease-in;
          z-index: 999;
          opacity: 0;
          font-size: 12px;
          color: #fff;
          padding: 10px;
          overflow: hidden;
          transform: translateY(100%);
          div {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        .image-item-header {
          display: flex;
          position: absolute;
          width: 100%;
          left: 0;
          top: 0;
          padding: 5px;
          z-index: 999;
          align-items: center;
          transition: all 0.3s linear;
          ::v-deep {
            .el-checkbox {
              padding-right: 0;
              flex: 1;
              border: 0;
            }
            .el-checkbox__label {
              display: none;
            }
          }
          .right {
            display: flex;
            text-align: right;
            display: none;
            .image-item-size {
              font-size: 12px;
              color: #fff;
              padding-right: 4px;
              padding-bottom: 3px;
            }
            i {
              cursor: pointer;
              &:before {
                font-size: 16px;
              }
            }
          }
        }
        &:hover {
          .image-item-footer {
            background: rgba(7, 17, 27, 0.7);
            opacity: 1;
            transform: translateY(0);
          }
          .image-item-header {
            background: rgba(7, 17, 27, 0.7);
            .right {
              display: block;
            }
          }
        }
      }
      ::v-deep {
        .el-tabs__item {
          display: flex;
          align-items: center;
        }
        .el-tabs__nav-wrap {
          padding: 0;
          display: flex;
          flex-direction: column;
        }
        .el-tabs__header {
          padding-top: 50px;
        }
        .el-tabs__nav-prev,
        .el-tabs__nav-next {
          display: none;
        }
        .el-tabs__nav-scroll {
          flex: 1;
          width: 200px;
          text-align: left;
          overflow: scroll;
          &::-webkit-scrollbar {
            display: none;
          }
          .el-tabs__item {
            text-align: left;
          }
        }
        .el-checkbox__inner {
          transform: scale(1.2);
        }
        .el-tabs__nav-wrap::after {
          display: none;
        }
        .el-tab-pane {
          display: flex;
          height: 100%;
          flex-direction: column;
          align-content: center;
        }
        .el-pagination {
          text-align: center;
        }
        .el-tabs__content,
        .el-tab-pane {
          height: 100%;
          overflow: hidden;
        }
      }
    }
  }
}
</style>
