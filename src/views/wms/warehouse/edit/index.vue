<template>
  <div v-loading="loading" style="padding: 20px">
    <el-form ref="form" :model="form" :rules="rules" label-width="150px">
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="form.orgId"
          :options="orgOptions"
          change-on-select
          expand-trigger="hover"
          placeholder="组织"
          :disabled="disabled"
          style="width: 30%"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @change="(value) => handleShop(value)"
        />
      </el-form-item>
      <el-form-item label="仓库名称" prop="warehouseName">
        <el-input v-model="form.warehouseName" clearable placeholder="请输入仓库名称" style="width: 30%" />
      </el-form-item>
      <el-form-item label="辐射范围" prop="shopIds">
        <el-select v-model="form.shopIds" filterable clearable multiple placeholder="请选择辐射范围" style="width: 30%">
          <el-option
            v-for="item in shopOptions"
            :key="item.shopId"
            :label="item.shopName"
            :value="item.shopId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="仓管员" prop="managerBy">
        <el-select v-model="form.managerBy" filterable clearable placeholder="请选择仓管员" style="width: 30%">
          <el-option
            v-for="item in managerOptions"
            :key="item.userId"
            :label="item.nickName"
            :value="item.userId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="仓库地址" prop="area">
        <Cascader
          v-model="form.area"
          :options="areaOptions"
          expand-trigger="hover"
          style="width: 30%"
          placeholder="仓库地址"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @change="onArea"
        />
      </el-form-item>
      <el-form-item label="仓库地址详情" prop="address">
        <el-input
          v-model="form.address"
          type="textarea"
          :rows="2"
          style="width: 30%"
          placeholder="请输入仓库地址详情"
        />
      </el-form-item>
      <!-- <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio label="enable">启用</el-radio>
          <el-radio label="disable">禁用</el-radio>
        </el-radio-group>
      </el-form-item> -->
      <el-form-item label="定位地址">
        <div style="height: 500px;">
          <div
            id="mapFencecontainer"
            class="mapBox"
            style="width: 100%; height: 100%; position: absolute"
          />
        </div>
      </el-form-item>
      <el-form-item prop="locationPoint">
        <el-row>
          <el-col :span="2">
            定位经纬度：
          </el-col>
          <el-col :span="8">
            <el-input v-model="form.locationPoint" class="disabled-input" placeholder="请输入内容" disabled />
          </el-col>
          <el-col :span="2" style="margin-left: 20px;">
            定位逆解析地址：
          </el-col>
          <el-col :span="8"><el-input v-model="form.poi" class="disabled-input" placeholder="请输入内容" disabled /></el-col>
        </el-row>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="this.$store.state.isLoading" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">返 回</el-button>
    </div>
  </div>
</template>

<script>
import { getAreaTree, getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import {
  addWarehouse,
  getWarehouse,
  updateWarehouse,
  getDistrictchi,
  getLocation
} from '@/api/wms/warehouse'
import { getDropDown } from '@/api/selectUtils'
import { flatten, searchSuperior } from '@/utils/array'

export default {
  components: {
    Cascader
  },
  data() {
    return {
      loading: false,
      // 组织数据
      orgOptions: [],
      // 地址数据
      areaOptions: [],
      // 店铺信息
      shopOptions: [],
      // 仓库管理员
      managerOptions: [],
      // 查看禁用
      disabled: this.$route.query.type === 'update',
      // 表单参数
      form: {
        status: 'enable'
      },
      // 表单校验
      rules: {
        warehouseName: [
          { required: true, message: '仓库名不能为空', trigger: 'blur' }
        ],
        managerBy: [
          { required: true, message: '仓库管理员不能为空', trigger: 'blur' }
        ],
        shopIds: [
          { required: true, message: '辐射范围不能为空', trigger: 'blur' }
        ],
        locationPoint: [
          {
            required: true,
            message: '仓库经纬度信息不能为空',
            trigger: 'blur'
          }
        ],
        poi: [
          { required: true, message: '地图地址名称不能为空', trigger: 'blur' }
        ],
        area: [{ required: true, message: '仓库地址不能为空', trigger: 'blur' }],
        address: [
          { required: true, message: '详细地址不能为空', trigger: 'blur' }
        ],
        orgId: [{ required: true, message: '组织id不能为空', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    // 查询组织
    getOrgTree().then((res) => {
      this.orgOptions = res.data
      if (this.$route.query.type !== 'add') {
        this.handleUpdate(this.$route.query.warehouseId)
      }
    })
    getAreaTree().then((res) => {
      this.areaOptions = res.data
    })
  },
  methods: {
    // 查询辐射范围
    handleShop(orgId) {
      this.managerOptions = []
      this.shopOptions = []
      this.form = {
        ...this.form,
        shopIds: null,
        managerBy: null
      }
      if (!orgId || !orgId.length) return
      Promise.all([getDropDown('shopList', { orgId: orgId[orgId.length - 1] }), getDropDown('managers', { orgId: orgId[orgId.length - 1] })]).then(res => {
        this.shopOptions = res[0].data.map(item => {
          return {
            shopId: item.shopId,
            shopName: item.shopName
          }
        })
        this.managerOptions = res[1].data.map(item => {
          return {
            userId: item.userId,
            nickName: item.nickName
          }
        })
      })
    },
    // 地址选取
    onArea(value) {
      if (!value || !value.length) return
      getDistrictchi({ districtId: value[value.length - 1] }).then(res => {
        this.init(res.data.result[0][0].location)
      })
    },
    init(location) {
      this.map = new qq.maps.Map(document.getElementById('mapFencecontainer'), {
        center: new qq.maps.LatLng(location.lat, location.lng), // 暂时默认
        draggableCursor: 'crosshair',
        zoom: 14
      })
      qq.maps.event.addListener(this.map, 'click', (event) => {
        getLocation(event.latLng).then(res => {
          const result = res.data.result
          this.form = {
            ...this.form,
            locationPoint: `${event.latLng.lat},${event.latLng.lng}`,
            poi: `${result.address_component.province}${result.address_component.city}${result.formatted_addresses.recommend}`
          }
        })
      })
    },
    /** 修改按钮操作 */
    handleUpdate(warehouseId) {
      this.loading = true
      getWarehouse(warehouseId).then((response) => {
        const orgArr = flatten(this.orgOptions, 'children')
        Promise.all([getDropDown('shopList', { orgId: response.data.orgId }), getDropDown('managers', { orgId: response.data.orgId })]).then(res => {
          this.loading = false
          this.shopOptions = res[0].data.map(item => {
            return {
              shopId: item.shopId,
              shopName: item.shopName
            }
          })
          this.managerOptions = res[1].data.map(item => {
            return {
              userId: item.userId,
              nickName: item.nickName
            }
          })
          this.form = {
            warehouseId: response.data.warehouseId,
            orgId: searchSuperior(response.data.orgId, 'id', orgArr, 'parentId'),
            warehouseName: response.data.warehouseName,
            status: response.data.status,
            managerBy: response.data.managerBy,
            shopIds: response.data.shopInfos.map(item => { return item.shopId }),
            area: [response.data.province, response.data.city, response.data.area],
            address: response.data.address,
            locationPoint: `${response.data.locationPoint.lat},${response.data.locationPoint.lng}`,
            poi: response.data.poi
          }
          this.init(response.data.locationPoint)
        })
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const type = this.form.warehouseId != null ? '修改' : '新增'
          this.$confirm(`是否确认${type}仓库?`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              const params = {
                ...this.form,
                orgId: this.form.orgId[this.form.orgId.length - 1],
                warehouseName: this.form.warehouseName,
                status: this.form.status,
                managerBy: this.form.managerBy,
                shopIds: this.form.shopIds,
                province: this.form.area[0],
                city: this.form.area[1],
                area: this.form.area[2],
                address: this.form.address,
                locationPoint: {
                  lat: this.form.locationPoint.split(',')[0],
                  lng: this.form.locationPoint.split(',')[1]
                },
                poi: this.form.poi
              }
              return this.form.warehouseId != null ? updateWarehouse(params) : addWarehouse(params)
            })
            .then(() => {
              this.msgSuccess(`${type}仓库成功`)
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
/deep/ .disabled-input .el-input__inner {
  color: #333;
  background: #fff;
}
</style>
