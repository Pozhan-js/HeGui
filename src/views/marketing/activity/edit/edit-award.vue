<template>
  <el-dialog :visible.sync="visible" title="设置奖品" width="600px" @closed="reset">
    <el-form ref="formRef" :model="awardData" :rules="awardRules" label-position="left" label-width="100px" size="small">
      <el-form-item label="奖品名称" prop="awardName">
        <el-input v-model="awardData.awardName" :disabled="isStarted" style="width: 350px;" />
      </el-form-item>
      <el-form-item label="奖品图片" prop="awardImagePath">
        <ResourcePicker v-model="awardData.awardImagePath" :disabled="isStarted" size-hint="建议：110*110px, 最多上传1张" />
      </el-form-item>
      <el-form-item label="奖品类型" prop="awardType">
        <dict-select v-model="awardData.awardType" :disabled="isStarted" dict="lottery_award_type" @change="handleChangeAwardType" />
        <el-button v-show="awardData.awardType === 'coupon'" :disabled="isStarted" class="ml20 blue-btn" @click="openCoupon">选择卡券</el-button>
      </el-form-item>
      <el-form-item v-show="awardData.awardType === 'score'" label="积分数量" prop="awardInfo" :rules="{ required: awardData.awardType === 'score', message: '积分数量不能为空', trigger: 'blur' }">
        <el-input-number v-model="awardData.awardInfo" :disabled="isStarted" controls-position="right" :precision="0" :min="1" :max="99999" style="width: 194px;" />
      </el-form-item>
      <el-form-item v-if="awardData.awardType === 'coupon'" label="卡券信息">
        <el-input :value="awardData.remark" disabled style="padding: 0;width: 194px;" />
      </el-form-item>
      <el-form-item label="奖品等级" prop="awardLevel">
        <dict-select v-model="awardData.awardLevel" :disabled="isStarted" dict="lottery_award_level" />
      </el-form-item>
      <el-form-item label="奖品数量" prop="totalNum">
        <el-input-number v-model="awardData.totalNum" :disabled="isStarted" controls-position="right" :precision="0" :min="1" :max="9999999" style="width: 194px;" />
      </el-form-item>
      <el-form-item v-if="isStarted" label="增补数量" prop="addTotalNum">
        <el-input-number v-model="awardData.addTotalNum" controls-position="right" :precision="0" :min="1" :max="9999999" style="width: 194px;" />
        <span style="color: #f75656">（注：增补数量会在保存后并入总数量）</span>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button type="primary" :loading="showLoading" @click="confirmDialog">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </span>
    <select-coupon ref="selectCouponRef" :coupon-list-params="couponListParams" @confirm="handleSaveCoupon" />
  </el-dialog>
</template>

<script>
import DictSelect from '@/components/DictSelect.vue'
import ResourcePicker from '@/components/ResourcePicker'
import selectCoupon from './select-coupon.vue'

const getDefaultData = () => ({
  awardName: undefined,
  awardImagePath: undefined,
  awardType: undefined,
  awardInfo: undefined,
  awardLevel: undefined,
  totalNum: undefined,
  winRate: undefined
})

export default {
  components: {
    DictSelect,
    selectCoupon,
    ResourcePicker
  },
  props: {
    couponListParams: Object,
    isStarted: Boolean
  },
  data() {
    return {
      visible: false,
      isStarting: false,
      awardData: getDefaultData(),
      showLoading: false,
      awardRules: {
        awardName: [{ required: true, message: '奖品名称不能为空', trigger: 'blur' }, { max: 12, message: '请输入12个以内字符' }],
        awardImagePath: [{ required: true, message: '奖品图片不能为空', trigger: 'change' }],
        awardType: [{ required: true, message: '奖品类型不能为空', trigger: 'change' }],
        awardLevel: [{ required: true, message: '奖品等级不能为空', trigger: 'change' }],
        totalNum: [{ required: true, message: '奖品数量不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    reset() {
      this.$refs['formRef']?.resetFields()
    },
    openDialog(row, index) {
      this.$refs['formRef']?.resetFields()
      this.awardData = row ?? getDefaultData()
      this.editIndex = index
      this.visible = true
    },
    openCoupon() {
      this.$refs.selectCouponRef.openDialog()
    },
    handleSaveCoupon({ couponId, couponName }) {
      this.$set(this.awardData, 'awardInfo', couponId)
      this.$set(this.awardData, 'remark', couponName)
    },
    handleChangeAwardType() {
      this.$set(this.awardData, 'awardInfo', undefined)
      this.$set(this.awardData, 'remark', undefined)
    },
    confirmDialog() {
      if (this.awardData.awardInfo == null && this.awardData.awardType === 'coupon') {
        return this.$message.error('请选择卡券')
      }
      this.showLoading = true
      this.$refs['formRef'].validate((valid) => {
        if (valid) {
          this.$emit('confirm', { ...this.awardData }, this.editIndex)
          this.visible = false
        }
        this.showLoading = false
      })
    }
  }
}
</script>
