<template>
  <el-dialog v-bind="$attrs" v-on="$listeners" width="600px" @close="onClose" title="新增分组">
    <el-form ref="form" :model="form" :rules="rules" size="medium" label-width="100px">
      <el-form-item label="分组名称" prop="dictionGroupName">
        <el-input v-model="form.dictionGroupName" placeholder="请输入分组名称" maxlength="255" show-word-limit clearable/>
      </el-form-item>
       <el-form-item label="设置可见范围">
        <el-radio-group v-model="deptRadio">
          <el-radio label="all">全部员工</el-radio>
          <el-radio label="part">部门可见</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="deptRadio == 'part'" label="可用部门" prop="deptId">
        <tree-select
          v-model="form.deptId"
          style="width: 460px"
          tree-checkable
          showSearch
          allowClear
          placeholder="请选择可用部门"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto', zIndex: 999999 }"
          :tree-data="departmentData"
          tree-default-expand-all
          :show-checked-strategy="SHOW_PARENT"
          :replace-fields="{ children:'children', title:'name', value: 'deptId' }"
        >
        </tree-select>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="handelConfirm">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { TreeSelect } from "ant-design-vue"
import {addDictionGroup} from "@/api/work/content"
const SHOW_PARENT = TreeSelect.SHOW_PARENT;
export default {
  inheritAttrs: false,
  components: {TreeSelect},
  props: ['departmentData'],
  data() {
    return {
      form: {
        deptId: null,
        dictionGroupName: null,
      },
      deptRadio: 'all',
      SHOW_PARENT,
      rules: {
        dictionGroupName: [{required: true,message: '请输入分组名称', trigger: 'blur',}],
        deptId: [ {required: true, message: '请输入分组名称',trigger: 'blur'}]
      },
    }
  },
  watch: {
    deptRadio(val, oldVal) {
      if(val == 'all') this.deptId = null
    }
  },
  methods: {
    onClose() {
      this.$refs['form'].resetFields()
      this.deptRadio = 'all'
      this.deptId = null
    },
    close() {
      this.$emit('update:visible', false)
    },
    handelConfirm() {
      this.$refs['form'].validate(async valid => {
        if(valid) {
          const type = this.form.dictionManageId != null ? '修改' : '新增'
          this.$confirm(`是否确认新增话术分组?`, "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            return addDictionGroup(this.form)
          }).then(() => {
            this.msgSuccess(`新增话术管理成功`);
            this.close()
            this.$emit('complete')
          })
        }
      })
    },
  }
}

</script>
<style>
</style>
