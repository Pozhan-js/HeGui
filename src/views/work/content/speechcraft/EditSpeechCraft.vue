<template>
  <el-dialog v-bind="$attrs" @open="onOpen" v-on="$listeners" @close="onClose" :title="type | title" width="650px" append-to-body>
    <el-form class="content-wrap" ref="dialogForm" :model="form"  :rules="rules" size="medium">
      <el-form-item label="分组" prop="dictionGroupId" label-width="60px">
        <el-select v-model="form.dictionGroupId" placeholder="请选择" style="width: 70%">
          <el-option
            v-for="item in dictionGroup"
            :key="item.dictionGroupId"
            :label="item.dictionGroupName"
            :value="item.dictionGroupId">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="标题" prop="dictionTitle" label-width="60px" class="mb20">
        <el-input v-model="form.dictionTitle" placeholder="请输入话术分组标题" maxlength="36" show-word-limit style="width: 70%"/>
      </el-form-item>
      <div v-for="(radio, index) in form.dictionContentList" :key="radio._id" >
        <el-form-item>
          <div class="flex justify-content-between">
            <el-radio-group class="tab_radios" v-model="radio.messageType" @change="handleTypeChange(radio)">
              <el-radio v-for="item in radiOptions" :key="item.label" :label="item.label">{{item.title}}</el-radio>
            </el-radio-group>
            <i v-if="form.dictionContentList.length>1" class="el-icon-delete" @click="handleDel(index)" ></i>
          </div>
        </el-form-item>
        <div class="tab-content mt20">
          <el-form-item :prop="`dictionContentList[${index}].dictionContent`" :rules="rules.dictionContent"> 
            <div v-show="radio.messageType == '文字'" class="tab-content_text">
                <el-input 
                  type="textarea" 
                  :rows="5"
                  v-model="radio.dictionContent"
                  placeholder="请输入话术内容"
                  maxlength="1300"
                  show-word-limit
                />
            </div>
            <div v-show="radio.messageType == '图片'" class="tab-content_picture">
              <ResourcePicker v-model="radio.dictionContent"/>
            </div>
            <div v-show="radio.messageType == '图文'" class="tab-content_text-pic">
                <el-input type="text" placeholder="请输入链接" v-model="radio.dictionContent" />
            </div>
          </el-form-item>
        </div>
      </div>

      <!-- <div class="flex align-center mb20">
        <el-button type="primary" icon="el-icon-plus" plain @click="addContentRow">添加内容</el-button>
        <span class="tips ml10">(添加的多个内容可一键发送)</span>
      </div> -->

      <!-- <div class="keyworks-wrap">
        <h4 class="keywork-title">关键词匹配</h4>
        <div class="keywork-body" style="border: 1px solid rgba(0, 0, 0, 0.1); background: #f2f2f2; padding: 10px;">
          设置关键词后，当客户发送的消息中有对应的关键词，将在侧边栏快捷回复中智能推荐该话术
关键词匹配功能需开通会话存档后才能使用，企业没有员工开通此功能，暂时无法使用,去开通
        </div>
      </div> -->
    </el-form>
    <div slot="footer" class="dialog-footer flex justify-content-between">
      <!-- <el-checkbox v-model="form.checked" type="primary"> 话术更新后，通知员工</el-checkbox> -->
      <span></span>
      <div class="group-button">
        <el-button @click="close">取 消</el-button>
        <el-button type="primary" @click="handelConfirm">添加</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import {addDictionManage, updateDictionManage, getDictionManage, listDictionGroup } from "@/api/work/content"
import ResourcePicker from '@/components/ResourcePicker'

  export default {
    components: {
      ResourcePicker,
    },
    props: ['dictionType', 'type', 'dictionManageId'],
    filters: {
      title(type) {
        switch(type) {
          case 'create':
            return '添加话术管理'
          case 'update':
            return '修改话术管理'
        }
      }
    },
    data() {
      const validateDictionContent = (rule, value, callback) => {
        const _idx = rule.field.match((/\[(\d+)\]/))[1]>>0
        switch (this.form.dictionContentList[_idx].messageType) {
          case '文字':
            return !value ? callback(new Error('请输入内容')) : callback()
          case '图片':
            return !value ? callback(new Error('请上传图片')) : callback()
          case '图文':
            if(!value) {
              return callback(new Error('请输入图文链接地址'))
            } else if(!(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+$/.test(value))) {
              return callback(new Error('请输入正确的图文链接地址'))
            } else {
              return callback()
            }
          default :
            return callback()
        }
      }
      return {
        prefix: sessionStorage.getItem('prefix'),
        form: {
          dictionContentList: [
            {
              messageType: '',
              dictionContent: '',
            }
          ],
          dictionGroupId: null,
          dictionTitle: null,
        },
        radiOptions: [
          {label: '文字', title:'文字'},
          {label: '图片', title:'图片'},
          {label: '图文', title:'图文'},
        ],


        rules: {
          dictionTitle: [{
            required: true,
            message: '请输入标题',
            trigger: 'blur'
          }],
          dictionContent: [
            {validator: validateDictionContent, trigger: 'blue'}
          ]
        },
        // 话术分组
        dictionGroup: []
      }
    },
    created() {
      if(this.type == 'create') this.addContentRow()
    },
    methods: {
      async onOpen() {
        this.getDictionGroup()
        if(!this.dictionManageId) {
          this.form.dictionContentList[0].messageType = '文字'
        } else {
          getDictionManage(this.dictionManageId).then(response => {
            const {messageType, dictionContent, dictionGroupId, dictionTitle } = response.data
            this.form = {dictionGroupId, dictionTitle, dictionManageId: this.dictionManageId, dictionContentList: [{messageType, dictionContent}]}
          })
        }
      },

      onClose() {
        this.form = {
          dictionContentList: [{
            messageType: '',
            dictionContent: '',
          }],
          dictionGroupId: null,
          dictionTitle: null,
        }
      },
      close() {
        this.$emit('update:visible', false)
      },
      // 查询话术分组列表
      getDictionGroup() {
        listDictionGroup().then((res) => {
          const arr = res.rows ?? []
          this.dictionGroup = [
            { dictionGroupId: "", dictionGroupName: "全部" },
            ...arr,
          ];
        });
      },
      handelConfirm() {
        this.$refs["dialogForm"].validate(valid => {
          if (valid) {
            const type = this.form.dictionManageId != null ? '修改' : '新增'
            this.$confirm(`是否确认${type}话术管理?`, "警告", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                const query = {...this.form, dictionType: this.dictionType}
                return this.form.dictionManageId != null ? updateDictionManage(query) : addDictionManage(query)
            }).then(() => {
              this.msgSuccess(`${type}话术管理成功`);
              this.close()
              this.$emit('complete')
            })
          }
        })
      },
      handleDel(index) {
        this.form.dictionContentList.splice(index, 1)
      },
      addContentRow() {
        this.form.dictionContentList.push({
          messageType: '文字',
          dictionContent: '',
          fileList:[]
        })
      },
      handleTypeChange(radio) {
        radio.dictionContent = ''
        radio.fileList = []
      }
    }
  }
</script>

<style lang="scss" scoped>
.content-wrap{
  max-height: 500px; 
  overflow-y: auto; 
  padding-right: 40px;
}
</style>