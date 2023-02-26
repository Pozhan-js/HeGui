<template>
  <div v-loading="loading" style="padding: 20px">
    <el-form ref="form" :model="form" :rules="rules" label-width="150px">
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="form.orgId"
          :options="orgOptions"
          style="width: 30%"
          placeholder="组织"
          :disabled="disabled"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @change="(value) => getFence(value)"
        />
      </el-form-item>
      <el-form-item label="店铺名称" prop="shopName">
        <el-input v-model="form.shopName" disabled placeholder="请输入围栏名称" style="width: 30%" />
      </el-form-item>
      <el-form-item label="围栏名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入围栏名称" style="width: 30%" />
      </el-form-item>
      <el-form-item label="围栏边界">
        <Fence v-if="positioning.length > 0" ref="fenceRef" :data="fenceData" :redundant-fence="redundantFence" :dash-fence="dashFence" :positioning="positioning" :height="600" :expansion="expansion" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="this.$store.state.isLoading" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">返 回</el-button>
    </div>
  </div>
</template>

<script>
import { getGeofenceFence, getGeofence, addGeofence, updateGeofence } from '@/api/merchant/geofence'
import { getOrgTree } from '@/api/utils'
import Fence from '@/views/components/fence'
import { Cascader } from 'ant-design-vue'
import { flatten, searchSuperior } from '@/utils/array'

export default {
  components: {
    Fence,
    Cascader
  },
  data() {
    return {
      loading: false,
      // 组织数据
      orgOptions: [],
      // 查看禁用
      disabled: this.$route.query.type === 'update',
      expansion: this.$route.query.type === 'update',
      // 当前位置
      positioning: [],
      // 围栏数据
      fenceData: [],
      // 其他店铺围栏数据
      redundantFence: [],
      // 店铺内电子围栏
      dashFence: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: '围栏名称不能为空', trigger: 'blur' }
        ],
        orgId: [
          {
            required: true,
            message: '组织不能为空',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  mounted() {
    this.citylocation = new qq.maps.CityService()
    // 请求成功回调函数
    this.citylocation.setComplete((result) => {
      console.log(result.detail.latLng.lat, result.detail.latLng.lng)
      // this.positioning = [result.detail.latLng.lat, result.detail.latLng.lng]
    })
    // this.citylocation.searchLocalCity();

    // 查询组织
    getOrgTree().then((res) => {
      this.orgOptions = res.data
      if (this.$route.query.type !== 'add') {
        this.handleUpdate(this.$route.query.geofenceId)
      }
    })
    // this.getFence()
  },
  methods: {
    getFence(orgId) {
      if (!orgId || orgId.length === 0) return this.positioning = []
      getGeofenceFence({ orgId: orgId[orgId.length - 1] }).then(res => {
        const data = [JSON.parse(res.shopGeofence).concat(JSON.parse(res.shopGeofence)[0])]
        this.form.shopName = res.shopName
        this.redundantFence = data
        this.positioning = [data[0][0].lat, data[0][0].lng]
        this.dashFence = res.geofenceList.filter(item => item.geofenceId !== this.form.geofenceId).map(item => {
          return JSON.parse(item.polygon).concat(JSON.parse(item.polygon)[0])
        })
      })
    },
    // 表单重置
    reset() {
      this.form = {
        geofenceId: null,
        orgId: null,
        name: null
      }
      this.resetForm('form')
    },
    /** 修改按钮操作 */
    handleUpdate(geofenceId) {
      this.loading = true
      getGeofence(geofenceId).then(res => {
        this.loading = false
        const orgArr = flatten(this.orgOptions, 'children')
        this.form = {
          geofenceId: res.data.geofenceId,
          shopName: res.data.shopName,
          orgId: searchSuperior(res.data.orgId, 'id', orgArr, 'parentId'),
          name: res.data.name,
          shopId: res.data.shopId
        }
        this.fenceData = JSON.parse(res.data.polygon)
        this.getFence(searchSuperior(res.data.orgId, 'id', orgArr, 'parentId'))
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (this.$refs['fenceRef']?.sendLngLat().length === 0) {
          return this.msgInfo('未绘制电子围栏范围~')
        }
        if (valid) {
          this.$confirm(
            `是否确认${this.$route.query.type === 'update' ? '修改' : '新增'}电子围栏信息?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            const params = {
              ...this.form,
              orgId: this.form.orgId[this.form.orgId.length - 1],
              polygon: JSON.stringify(this.$refs['fenceRef']?.sendLngLat())
            }
            return this.$route.query.type === 'update' ? updateGeofence(params) : addGeofence(params)
          }).then(() => {
            this.msgSuccess(`${this.$route.query.type === 'update' ? '修改' : '新增'}电子围栏成功~`)
            this.cancel()
          })
        }
      })
    },
    /**
     * 返回界面
     */
    cancel() {
      this.$router.go(-1)
    }
  }
}
</script>
<style scoped lang="scss">
.dialog-footer {
  padding-bottom: 40px;
  text-align: center;
}
</style>
