<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="500px"
      append-to-body
      @closed="closed"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="标签类型" prop="labelTypeName">
          <el-input v-model="form.labelTypeName" placeholder="请输入标签类型" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :loading="this.$store.state.isLoading"
          @click="submitLabelForm"
        >确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <el-collapse value="1" accordion style="width: 200px">
      <el-collapse-item name="1" style="border-bottom: none">
        <div slot="title" class="label-type-label">
          <div class="label-name">全部标签类型</div>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click.stop="addType"
          >新增类型</el-button>
        </div>
        <div
          v-for="item in labelType"
          :key="item.labelTypeId"
          class="label-type-item"
          :class="{ active: item.labelTypeId === value }"
        >
          <div class="type-name" @click="$emit('input', item.labelTypeId === value ? undefined : item.labelTypeId)">
            {{ item.labelTypeName }}
          </div>
          <div>
            <el-button
              size="mini"
              type="text"
              @click="updateType(item)"
            >修改</el-button>
            <el-button
              size="mini"
              type="text"
              @click="removeType(item)"
            >删除</el-button>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import {
  removeLabelType,
  createLabelType,
  updateLabelType
} from '@/api/customer/label'

export default {
  name: 'LabelType',
  props: {
    labelType: Array,
    value: Number
  },
  data() {
    return {
      open: false,
      type: '',
      form: {},
      rules: {
        labelTypeName: [
          { required: true, message: '标签类型名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    title() {
      return this.type === 'create' ? '新增标签类型' : '修改标签类型'
    }
  },
  created() {
    this.getListLabelType()
  },
  methods: {
    getListLabelType() {
      this.$emit('getLabelType')
    },
    submitLabelForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$confirm(`是否确定${this.title}？`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() =>
              this.type === 'create'
                ? createLabelType(this.form)
                : updateLabelType(this.form)
            )
            .then(() => {
              this.getListLabelType()
              this.msgSuccess(`${this.title}成功~`)
              this.open = false
            })
        }
      })
    },
    cancel() {
      this.open = false
    },
    closed() {
      this.form = {}
    },
    addType() {
      this.form = {}
      this.type = 'create'
      this.open = true
    },
    updateType(item) {
      this.form = {
        labelTypeName: item.labelTypeName,
        labelTypeId: item.labelTypeId
      }
      this.type = 'update'
      this.open = true
    },
    removeType(item) {
      this.$confirm('确认要删除此标签类型吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then((res) => removeLabelType(item.labelTypeId))
        .then((res) => {
          this.getListLabelType()
          this.msgSuccess(`标签类型删除成功~`)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/styles/variables.scss";
.label-type-label {
  display: flex;
  align-items: center;
  width: 100%;
  padding-right: 10px;
  .label-name {
    flex: 1;
  }
}
.label-type-item {
  display: flex;
  align-items: center;
  padding: 0 10px;
  margin: 4px;
  cursor: pointer;
  &:hover {
    background: #fafafa;
    border-radius: 4px;
  }
  &.active {
    background: rgba($primary, .5);
    border-radius: 4px;
    color: #fff;
  }
  .type-name {
    flex: 1;
    font-size: 14px;
  }
}
</style>
