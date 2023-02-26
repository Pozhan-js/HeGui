<template>
  <div style="padding: 20px">
    <el-form ref="form" :model="form" :rules="rules" label-width="150px">
      <el-form-item label="店铺名称" prop="shopName">
        <el-input
          v-model="form.shopName"
          style="width: 30%"
          :disabled="disabled"
          placeholder="请输入店铺名称"
        />
      </el-form-item>
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="form.orgId"
          :options="orgOptions"
          style="width: 30%"
          placeholder="组织"
          :disabled="disabled"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
        />
      </el-form-item>
      <el-form-item label="店铺类型" prop="shopType">
        <el-select
          v-model="form.shopType"
          style="width: 30%"
          :disabled="disabled"
          placeholder="请选择店铺类型"
        >
          <el-option
            v-for="dict in shopTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="客服电话" prop="customTel">
        <el-input
          v-model="form.customTel"
          style="width: 30%"
          :disabled="disabled"
          placeholder="请输入客服电话"
        />
      </el-form-item>
      <el-form-item label="营业时间">
        <el-col :span="3">
          <el-time-picker
            v-model="form.openTime"
            :disabled="disabled"
            style="width: 100%"
            format="HH:mm"
            @input="refreshForm"
          />
        </el-col>
        <el-col class="line" style="text-align: center" :span="1">-</el-col>
        <el-col :span="3">
          <el-time-picker
            v-model="form.closeTime"
            :disabled="disabled"
            style="width: 100%"
            format="HH:mm"
            @input="refreshForm"
          />
        </el-col>
      </el-form-item>
      <!-- <el-form-item label="链接地址" prop="linkUrl">
        <el-input style="width: 30%" :disabled="disabled" v-model="form.linkUrl" placeholder="请输入链接地址" />
      </el-form-item> -->
      <el-form-item label="无响应时长" prop="noResponseTime">
        <el-col :span="4">
          <el-input-number
            v-model="form.noResponseTime"
            :disabled="disabled"
            :min="0"
          />
        </el-col>
        <el-col :span="11">
          分钟
          <el-tooltip
            class="item"
            effect="dark"
            content="订单支付成功后，自然订单无人抢单或派单时未开始配送的情况预警阈值"
            placement="right-start"
          >
            <i
              class="el-icon-warning-outline"
              style="font-size: 16px; vertical-align: middle; margin-left: 5px"
            />
          </el-tooltip>
        </el-col>
      </el-form-item>
      <el-form-item label="超时时间" prop="longTime">
        <el-col :span="4">
          <el-input-number
            v-model="form.longTime"
            :disabled="disabled"
            :min="0"
          />
        </el-col>
        <el-col :span="11">
          分钟
          <el-tooltip
            class="item"
            effect="dark"
            content="订单支付成功后，未配送完成的超时时长预警阈值"
            placement="right-start"
          >
            <i
              class="el-icon-warning-outline"
              style="font-size: 16px; vertical-align: middle; margin-left: 5px"
            />
          </el-tooltip>
        </el-col>
      </el-form-item>
      <el-form-item label="提前几分钟提醒" prop="tipTime">
        <el-col :span="4">
          <el-input-number
            v-model="form.tipTime"
            :disabled="disabled"
            :min="0"
          />
        </el-col>
        <el-col :span="11">
          分钟
          <el-tooltip
            class="item"
            effect="dark"
            content="订单支付成功后，即将触及配送超时时长的预警阈值"
            placement="right-start"
          >
            <i
              class="el-icon-warning-outline"
              style="font-size: 16px; vertical-align: middle; margin-left: 5px"
            />
          </el-tooltip>
        </el-col>
      </el-form-item>
      <el-form-item label="消费者最大等待时间" prop="customerWaitTime">
        <el-col :span="4">
          <el-input-number
            v-model="form.config.customerWaitTime"
            :disabled="disabled"
            :min="0"
          />
        </el-col>
        <el-col :span="11">
          分钟
          <el-tooltip
            class="item"
            effect="dark"
            content="小电子围栏内下单，附近有配送员但是库存不满足时，消费者可以选择继续下单，但是需要提示等待时间"
            placement="right-start"
          >
            <i
              class="el-icon-warning-outline"
              style="font-size: 16px; vertical-align: middle; margin-left: 5px"
            />
          </el-tooltip>
        </el-col>
      </el-form-item>
      <el-form-item label="配送员待送达订单数量" prop="distributionOrderNumMax">
        <el-col :span="4">
          <el-input-number
            v-model="form.config.distributionOrderNumMax"
            :disabled="disabled"
            :min="0"
          />
        </el-col>
        <el-col :span="11">
          单
          <el-tooltip
            class="item"
            effect="dark"
            content="配送员待送达订单数量大于或等于此数值时，不会再推送订单给该配送员直到待送达数量小于此数值"
            placement="right-start"
          >
            <i
              class="el-icon-warning-outline"
              style="font-size: 16px; vertical-align: middle; margin-left: 5px"
            />
          </el-tooltip>
        </el-col>
      </el-form-item>
      <el-form-item label="抢单和派单距离模板">
        <el-tabs v-model="cardName" type="border-card" style="width: 40%">
          <el-tab-pane label="方圆" name="round" disabled>方圆</el-tab-pane>
          <el-tab-pane label="自定义" name="customize">
            <el-form-item label="骑行距离" prop="distance">
              <el-col :span="13">
                <el-input-number
                  v-model="form.distance"
                  :disabled="disabled"
                  :min="0"
                  @change="
                    (value) =>
                      (form.needTime = Math.floor(
                        (value / 1000 / form.avgVelocity) * 60
                      ))
                  "
                />
              </el-col>
              <el-col :span="11"> m </el-col>
            </el-form-item>
            <el-form-item
              style="margin-top: 10px"
              label="骑行平均速度"
              prop="avgVelocity"
            >
              <el-col :span="13">
                <el-input-number
                  v-model="form.avgVelocity"
                  :disabled="disabled"
                  :min="15"
                  :max="40"
                  @change="
                    (value) =>
                      (form.needTime = Math.floor(
                        (form.distance / 1000 / value) * 60
                      ))
                  "
                />
              </el-col>
              <el-col :span="10"> km/h </el-col>
            </el-form-item>
            <el-form-item
              style="margin-top: 10px"
              label="骑行时间"
              prop="needTime"
            >
              <el-col :span="13">
                <el-input-number v-model="form.needTime" disabled :min="0" />
              </el-col>
              <el-col :span="10"> min </el-col>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form-item>
      <el-form-item label="集中区域省" prop="area">
        <Cascader
          v-model="form.area"
          :options="areaOptions"
          change-on-select
          expand-trigger="hover"
          style="width: 35%"
          placeholder="所属区域"
          :disabled="disabled"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @blur="onArea"
        />
      </el-form-item>
      <el-form-item label="扫二维码距离范围" prop="distanceScope">
        <el-col :span="4">
          <el-input-number
            v-model="form.distanceScope"
            :disabled="disabled"
            :min="0"
          />
        </el-col>
        <el-col :span="11"> m 内 </el-col>
      </el-form-item>
      <el-form-item label="围栏边界">
        <Fence
          v-if="fenceData.length > 0"
          ref="fenceRef"
          :show-sub="!disabled"
          :data="fenceData"
          :redundant-fence="redundantFence"
          :positioning="positioning"
        />
      </el-form-item>
    </el-form>
    <div v-if="!disabled" slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        :loading="this.$store.state.isLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="cancel">返 回</el-button>
    </div>
  </div>
</template>

<script>
import {
  addShop,
  getShop,
  updateShop,
  getShopFence,
  getShopTime
} from '@/api/merchant/shop'
import { getAreaTree, getOrgTree, getAreasJson } from '@/api/utils'
import moment from 'moment'
import Fence from '@/views/components/fence'
import { Cascader } from 'ant-design-vue'
import { flatten, searchSuperior } from '@/utils/array'
import douglasPeucker from '@/utils/douglas'

export default {
  components: {
    Fence,
    Cascader
  },
  data() {
    return {
      // 店铺类型(自营，加盟)字典
      shopTypeOptions: [],
      // 店铺状态(营业，停业，草稿)字典
      shopStatusOptions: [],
      // 区域数据
      areaOptions: [],
      // 组织数据
      orgOptions: [],
      // 查看禁用
      disabled: this.$route.query.type === 'check',
      // 小时数组
      hourArr: new Array(12),
      // 分钟数组
      minuteArr: new Array(60),
      // 方圆跟自定义切换
      cardName: 'customize',
      citylocation: null,
      positioning: [],
      // 围栏数据
      fenceData: [],
      // 其他店铺围栏数据
      redundantFence: [],
      // 表单参数
      form: {
        config: {}
      },
      // 表单校验
      rules: {
        shopName: [
          { required: true, message: '店铺名称不能为空', trigger: 'blur' },
          { max: 11, message: '店铺名称不能超过11个字符', trigger: 'blur' },
          { min: 4, message: '店铺名称不能少于4个字符', trigger: 'blur' }
        ],
        orgId: [
          {
            required: true,
            message: '组织id,所属战区不能为空',
            trigger: 'blur'
          }
        ],
        shopType: [
          {
            required: true,
            message: '店铺类型不能为空',
            trigger: 'change'
          }
        ],
        shopStatus: [
          {
            required: true,
            message: '店铺状态不能为空',
            trigger: 'blur'
          }
        ],
        createBy: [
          { required: true, message: '创建人不能为空', trigger: 'blur' }
        ],
        createTime: [
          { required: true, message: '创建时间不能为空', trigger: 'blur' }
        ],
        updateBy: [
          { required: true, message: '最后修改人不能为空', trigger: 'blur' }
        ],
        updateTime: [
          { required: true, message: '最后修改时间不能为空', trigger: 'blur' }
        ],
        delFlag: [
          { required: true, message: '逻辑删除不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.citylocation = new qq.maps.CityService()
    // 请求成功回调函数
    this.citylocation.setComplete((result) => {
      this.positioning = [result.detail.latLng.lat, result.detail.latLng.lng]
    })
    this.citylocation.searchLocalCity()

    this.getDicts('merchant_shop_type').then((response) => {
      this.shopTypeOptions = response.data
    })
    this.getDicts('merchant_shop_status').then((response) => {
      this.shopStatusOptions = response.data
    })
    this.getDicts('merchant_shop_status').then((response) => {
      this.shopStatusOptions = response.data
    })
    getShopTime().then((response) => {
      const data = JSON.parse(response.msg)
      if (!data) return
      this.form.openTime = new Date(
        2000,
        1,
        1,
        parseInt(data.openTimeHour),
        parseInt(data.openTimeMinute)
      )
      this.form.closeTime = new Date(
        2000,
        1,
        1,
        parseInt(data.closeTimeHour),
        parseInt(data.closeTimeMinute)
      )
    })
    // 查询地区
    getAreaTree().then((res) => {
      this.areaOptions = res.data
    })
    // 查询组织
    getOrgTree().then((res) => {
      this.orgOptions = res.data
      if (this.$route.query.type !== 'add') {
        this.handleUpdate(this.$route.query.shopId)
      }
    })
  },
  methods: {
    /**
     * 刷新Form数据对象
     */
    refreshForm() {
      this.form = { ...this.form }
    },
    onArea() {
      const value = this.form.area
      if (value && value.length > 0) {
        getAreasJson(value.slice(-1)[0]).then((res) => {
          if (!res) {
            this.fenceData = []
          }
          this.positioning = [
            res.features[0].properties.centroid[1],
            res.features[0].properties.centroid[0]
          ]
          let fenceData = res.features[0].geometry.coordinates[0][0].map(
            (item) => {
              return { lng: item[0], lat: item[1] }
            }
          )
          const finallyData = fenceData.pop()
          fenceData = douglasPeucker(fenceData, 1000)
          this.fenceData = fenceData.concat([finallyData])
        })
        getShopFence({
          city: value.length > 2 ? value[1] : null,
          shopStatus: 1
        }).then((res) => {
          const redundantFence = []
          res.data.map((item) => {
            redundantFence.push(JSON.parse(item.hasShelves).concat([JSON.parse(item.hasShelves)[0]]))
          })
          this.redundantFence = redundantFence
        })
      }
    },
    onUpdateArea() {
      const value = this.form.area
      getShopFence({
        city: value.length > 2 ? value[1] : null,
        shopStatus: 1
      }).then((res) => {
        const redundantFence = []
        res.data.filter(item => item.shopId !== this.form.shopId).map((item) => {
          redundantFence.push(JSON.parse(item.hasShelves).concat([JSON.parse(item.hasShelves)[0]]))
        })
        this.redundantFence = redundantFence
      })
    },
    // 表单重置
    reset() {
      this.form = {
        shopId: null,
        shopName: null,
        orgId: null,
        shopType: null,
        customTel: null,
        openTime: null,
        closeTime: null,
        linkUrl: null,
        noResponseTime: null,
        longTime: null,
        tipTime: null,
        config: {},
        needTime: null,
        distance: null,
        province: null,
        avgVelocity: null,
        city: null,
        area: null,
        distanceScope: null,
        hasShelves: null,
        shopStatus: 0
      }
      this.resetForm('form')
    },
    /** 修改按钮操作 */
    handleUpdate(shopId) {
      this.reset()
      getShop(shopId).then((response) => {
        const area = []
        if (response.data.province) {
          area[0] = response.data.province
        }
        if (response.data.city) {
          area[1] = response.data.city
        }
        if (response.data.area) {
          area[2] = response.data.area
        }
        const orgArr = flatten(this.orgOptions, 'children')
        this.form = {
          ...response.data,
          orgId: searchSuperior(response.data.orgId, 'id', orgArr, 'parentId'),
          area,
          openTime: new Date(
            2000,
            1,
            1,
            parseInt(response.data.openTimeHour),
            parseInt(response.data.openTimeMinute)
          ),
          closeTime: new Date(
            2000,
            1,
            1,
            parseInt(response.data.closeTimeHour),
            parseInt(response.data.closeTimeMinute)
          ),
          avgVelocity: response.data.avgVelocity / 1000,
          config: {
            distributionOrderNumMax: response.data.config
              ? response.data.config.distributionOrderNumMax
              : undefined,
            customerWaitTime: response.data.config
              ? response.data.config.customerWaitTime
              : undefined
          }
        }
        this.fenceData = JSON.parse(response.data.hasShelves)
        this.onUpdateArea()
        // getAreasJson(area.slice(-1)[0]).then((res) => {
        //   if (!res) return;
        //   this.positioning = [
        //     res.features[0].properties.center[1],
        //     res.features[0].properties.center[0],
        //   ];
        //   this.fenceData = JSON.parse(response.data.hasShelves);
        // });
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const hasShelves = this.$refs['fenceRef']?.sendLngLat()
          const openTime = this.form.openTime
            ? moment(this.form.openTime).format('HH:mm').split(':')
            : null
          const closeTime = this.form.closeTime
            ? moment(this.form.closeTime).format('HH:mm').split(':')
            : null
          const params = {
            ...this.form,
            hasShelves: JSON.stringify(hasShelves),
            province: this.form.area?.length > 0 ? this.form.area[0] : null,
            city: this.form.area?.length > 0 ? this.form.area[1] : null,
            area: this.form.area?.length > 0 ? this.form.area[2] : null,
            openTimeHour: openTime ? openTime[0] : null,
            openTimeMinute: openTime ? openTime[1] : null,
            closeTimeHour: closeTime ? closeTime[0] : null,
            closeTimeMinute: closeTime ? closeTime[1] : null,
            avgVelocity: this.form.avgVelocity * 1000,
            orgId: this.form.orgId
              ? this.form.orgId.length > 0
                ? this.form.orgId.slice(-1)[0]
                : this.form.orgId
              : null
          }
          delete params.cityName
          delete params.areaName
          delete params.orgName
          delete params.provinceName
          delete params.closeTime
          delete params.openTime
          console.log(params)
          this.$confirm(
            `是否确认${
              this.$route.query.type === 'update' ? '修改' : '新增'
            }店铺信息?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              return this.form.shopId ? updateShop(params) : addShop(params)
            })
            .then(() => {
              this.msgSuccess(
                `${
                  this.$route.query.type === 'update' ? '修改' : '新增'
                }店铺成功~`
              )
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
