<template>
  <div v-if="data" v-loading="loading" class="app-container">
    <el-row style="text-align: center;">
      <el-col :span="4">订单编号：{{ data.orderNo }}</el-col>
      <el-col :span="4">业务凭证号：{{ data.outTradeNo }}</el-col>
      <el-col :span="4">物流方式：即时物流</el-col>
      <el-col :span="4">订单类型：{{ orderTypeFormat(data.orderType) }}</el-col>
      <el-col :span="4">派单日志: <el-button type="text" style="padding: 0;" @click="handleOrderzs('dispatch')">派单日志</el-button></el-col>
      <el-col v-if="data.orderAfterSalesList && data.orderAfterSalesList.length > 0" :span="4">
        维权状态：{{ data.orderAfterSalesList.map(item => afterSalesFormat(item.status)).toString() }}
        <el-button v-hasPermi="['order:afterSales:update']" style="margin: 0 10px;" type="text" @click="handleModel(data.orderAfterSalesList[data.orderAfterSalesList.length - 1].orderAfterSalesId)">维权详情</el-button>
      </el-col>
      <el-col :span="4">
        流转历史：<el-button type="text" style="padding: 0;" @click="handleOrderzs('order')">流转详情</el-button>
      </el-col>
    </el-row>
    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-steps :active="orderType" align-center>
          <el-step v-for="(item,index) in data.orderStatusList" :key="index" :title="item.orderStatusDesc" :description="item.orderTime" />
        </el-steps>
      </el-col>
    </el-row>
    <el-row style="padding: 20px;">
      <div class="orderTable">
        <div style="width: 15%">商品</div>
        <div style="width: 10%">单价（元）</div>
        <div style="width: 10%">数量</div>
        <div style="width: 9%">商品小计（元）</div>
        <div style="width: 9%">配送费（元）</div>
        <div style="width: 9%">应付（元）</div>
        <div style="width: 9%">优惠/赠品</div>
        <div style="width: 9%">实付（元）</div>
        <div style="width: 9%">已退款（元）</div>
        <div style="width: 9%">状态</div>
      </div>
      <div style="display: flex;font-size: 14px;">
        <div style="width: 35%">
          <div v-for="goods in data.orderGoodsList" :key="goods.goodsId" class="goods_info">
            <div style="width: 44%;display: flex;">
              <img v-if="goods.thumbnail" class="img" :src="prefix + goods.thumbnail">
                <img v-else class="img" src="~@/assets/images/coupon.png">
              <div class="goodsName">{{ goods.goodsName }}</div>
            </div>
            <div style="width: 28%;margin: auto;text-align: center;">
              {{ goods.price && toDecimal2(goods.price / 100) }}元
            </div>
            <div style="width: 28%;margin: auto 0;text-align: center;">
              {{ goods.goodsNum }}包
            </div>
          </div>
        </div>
        <div class="table_text" style="width: 9%;">
          {{ data.goodsSubtotal ? toDecimal2(data.goodsSubtotal / 100) : 0 }}
        </div>
        <div class="table_text" style="width: 9%;">
          {{ data.customerDistributionFee ? toDecimal2(data.customerDistributionFee / 100) : 0 }}
        </div>
        <div class="table_text" style="width: 9%;">
          {{ data.totalAmount && toDecimal2(data.totalAmount / 100) }}
        </div>
        <div class="table_text" style="width: 9%;">
          {{ data.totalDiscountAmount ? toDecimal2(data.totalDiscountAmount / 100) : 0 }}
        </div>
        <div class="table_text" style="width: 9%;">
          <div v-if="data.actualPayAmount !== '0'">{{ data.totalScore && data.totalScore !== '0' ? '金额：' : '' }}{{ data.actualPayAmount && toDecimal2(data.actualPayAmount / 100) }}</div>
          <div v-if="data.totalScore && data.totalScore !== '0'">积分：{{ data.totalScore }}</div>
        </div>
        <div class="table_text" style="width: 9%;">
          {{ data.orderRefund && data.orderRefund.refundAmount ? toDecimal2(data.orderRefund.refundAmount / 100) : 0 }}
        </div>
        <div class="table_text" style="width: 9%;">
          {{ statusFormat(data.status) }}
        </div>
      </div>
    </el-row>
    <el-row style="padding: 20px;margin-top: 20px;">
      <el-col :span="12">
        <div style="width: 600px;margin: 15px 0;">
          <div>商品优惠信息：</div>
          <div class="borderColor" style="border: 1px solid;">
            <div class="borderColor" style="display: flex;border-bottom: 1px solid;">
              <div class="black borderColor" style="border-right: 1px solid;">优惠类型</div>
              <div class="black borderColor">优惠金额（元）</div>
              <div class="black borderColor" style="border-left: 1px solid;">商品小计（元）</div>
            </div>
            <div style="display: flex;">
              <div>
                <div class="borderColor" style="display: flex;">
                  <div class="black borderColor" style="width: 199px;border-right: 1px solid;">优惠券</div>
                  <div class="black borderColor" style="width: 201px;border-right: 1px solid;">
                    {{
                      data.orderDiscountList.filter(item => item.discountType === 'coupon' && item.discountAmountType === 'goods_fee')[0]
                        ? toDecimal2(data.orderDiscountList.filter(item => item.discountType === 'coupon' && item.discountAmountType === 'goods_fee')[0].discountAmount / 100)
                        : 0
                    }}
                  </div>
                </div>
                <div class="borderColor" style="display: flex;border-top: 1px solid;">
                  <div class="black borderColor" style="width: 199px;border-right: 1px solid;">会员折扣</div>
                  <div class="black borderColor" style="width: 201px;border-right: 1px solid;">
                    {{
                      data.orderDiscountList.filter(item => item.discountType === 'customer' && item.discountAmountType === 'goods_fee')[0]
                        ? toDecimal2(data.orderDiscountList.filter(item => item.discountType === 'customer' && item.discountAmountType === 'goods_fee')[0].discountAmount / 100)
                        : 0
                    }}
                  </div>
                </div>
                <div class="borderColor" style="display: flex;border-top: 1px solid;">
                  <div class="black borderColor" style="width: 199px;border-right: 1px solid;">助力砍价</div>
                  <div class="black borderColor" style="width: 201px;border-right: 1px solid;">
                    {{
                      data.orderDiscountList.filter(item => item.discountType === 'bargain' && item.discountAmountType === 'goods_fee')[0]
                        ? toDecimal2(data.orderDiscountList.filter(item => item.discountType === 'bargain' && item.discountAmountType === 'goods_fee')[0].discountAmount / 100)
                        : 0
                    }}
                  </div>
                </div>
              </div>
              <div class="black borderColor" style="margin: auto 0;">{{ data.goodsSubtotal && toDecimal2(data.goodsSubtotal / 100) }}</div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div style="width: 600px;margin: 15px 0;">
          <div>配送费优惠信息：</div>
          <div class="borderColor" style="border: 1px solid;">
            <div class="borderColor" style="display: flex;border-bottom: 1px solid;">
              <div class="black borderColor" style="border-right: 1px solid;">优惠类型</div>
              <div class="black borderColor">优惠金额（元）</div>
              <div class="black borderColor" style="border-left: 1px solid;">配送费小计（元）</div>
            </div>
            <div style="display: flex;">
              <div>
                <div class="borderColor" style="display: flex;">
                  <div class="black borderColor" style="width: 199px;border-right: 1px solid;">会员折扣</div>
                  <div class="black borderColor" style="width: 201px;border-right: 1px solid;">
                    {{
                      data.orderDiscountList.filter(item => item.discountType === 'customer' && item.discountAmountType === 'deliver_fee')[0]
                        ? toDecimal2(data.orderDiscountList.filter(item => item.discountType === 'customer' && item.discountAmountType === 'deliver_fee')[0].discountAmount / 100)
                        : 0
                    }}
                  </div>
                </div>
                <div class="borderColor" style="display: flex;border-top: 1px solid;">
                  <div class="black borderColor" style="width: 199px;border-right: 1px solid;">满减</div>
                  <div class="black borderColor" style="width: 201px;border-right: 1px solid;">
                    {{
                      data.orderDiscountList.filter(item => item.discountType === 'system' && item.discountAmountType === 'deliver_fee')[0]
                        ? toDecimal2(data.orderDiscountList.filter(item => item.discountType === 'system' && item.discountAmountType === 'deliver_fee')[0].discountAmount / 100)
                        : 0
                    }}
                  </div>
                </div>
              </div>
              <div class="black borderColor" style="margin: auto 0;">{{ data.customerDistributionFee && toDecimal2(data.customerDistributionFee / 100) }}</div>
            </div>
          </div>
        </div>
      </el-col>
      <!-- <div style="width: 100%;margin: 15px 0;">
          <div>优惠信息：</div>
          <div class="borderColor" style="border: 1px solid;">
            <div style="display: flex;">
              <div class="black borderColor" style="border-right: 1px solid;">优惠种类</div>
              <div class="black borderColor" style="border-right: 1px solid;">优惠费用类型</div>
              <div class="black borderColor" style="border-right: 1px solid;">优惠名称</div>
              <div class="black borderColor" style="border-right: 1px solid;">优惠方式</div>
              <div class="black borderColor" style="border-right: 1px solid;">原始金额（元）</div>
              <div class="black borderColor">优惠金额（元）</div>
            </div>
            <div class="borderColor" v-for="(item, index) in data.orderDiscountList" :key="index" style="display: flex;border-top: 1px solid;">
              <div class="black borderColor" style="border-right: 1px solid;">{{ discountTypeFormat(item.discountType) }}</div>
              <div class="black borderColor" style="border-right: 1px solid;">{{ amountTypeFormat(item.discountAmountType) }}</div>
              <div class="black borderColor" style="border-right: 1px solid;">{{ item.resourcesName }}</div>
              <div class="black borderColor" style="border-right: 1px solid;">{{ ruleTypeFormat(item.discountRuleType) }}</div>
              <div class="black borderColor" style="border-right: 1px solid;">{{ toDecimal2(item.originalAmount / 100) }}</div>
              <div class="black">{{ toDecimal2(item.discountAmount / 100) }}</div>
            </div>
          </div>
        </div> -->
      <div style="width: 600px;margin-top: 20px">
        付款信息： （支付凭证号：{{ data.outTradeNo }}）
        <div class="borderColor" style="border: 1px solid;">
          <div style="display: flex;">
            <div class="black borderColor" style="border-right: 1px solid;">微信支付（元）</div>
            <div class="black borderColor" style="border-right: 1px solid;">余额支付（元）</div>
            <div class="black borderColor">积分抵扣（个）</div>
          </div>
          <div class="borderColor" style="display: flex;border-top: 1px solid;">
            <div class="black borderColor" style="border-right: 1px solid;">{{ data.wechatPayAmount ? toDecimal2(data.wechatPayAmount / 100) : 0 }}</div>
            <div class="black borderColor" style="border-right: 1px solid;">{{ data.walletPayAmount ? toDecimal2(data.walletPayAmount / 100) : 0 }}</div>
            <div class="black">{{ data.totalScore }}</div>
          </div>
        </div>
      </div>
      <div style="width: 1000px;margin-top: 20px">
        佣金信息：
        <div class="borderColor" style="border: 1px solid;">
          <div style="display: flex;">
            <div class="black borderColor" style="border-right: 1px solid;">配送费</div>
            <div class="black borderColor" style="border-right: 1px solid;">推广奖励</div>
            <div class="black borderColor" style="border-right: 1px solid;">组长</div>
            <div class="black borderColor" style="border-right: 1px solid;">消费者提成</div>
            <div class="black borderColor">分销推广提成</div>
          </div>
          <div class="borderColor" style="display: flex;border-top: 1px solid;">
            <div class="black borderColor" style="border-right: 1px solid;">
              {{ data.distributionOrder && data.distributionOrder.distributionFee ? toDecimal2((parseInt(data.distributionOrder.distributionFee) + parseInt(data.distributionOrder.promotionRevenue)) / 100) : 0 }}
            </div>
            <div class="black borderColor" style="border-right: 1px solid;">
              0
              <!-- {{ data.distributionOrder && data.distributionOrder.promotionRevenue ? toDecimal2(data.distributionOrder.promotionRevenue / 100) : 0 }} -->
            </div>
            <div class="black borderColor" style="border-right: 1px solid;">{{ data.distributionOrder && data.distributionOrder.groupLeaderRevenue ? toDecimal2(data.distributionOrder.groupLeaderRevenue / 100) : 0 }}</div>
            <div class="black borderColor" style="border-right: 1px solid;">-</div>
            <div class="black">{{ data.orderPromoteDTO && data.orderPromoteDTO.promoteIncome ? toDecimal2(data.orderPromoteDTO.promoteIncome / 100) : 0 }}</div>
          </div>
        </div>
      </div>
      <div style="width: 1000px;margin-top: 20px">
        客户信息：
        <div class="borderColor" style="border: 1px solid;">
          <div style="display: flex;">
            <div class="black borderColor" style="border-right: 1px solid;">收货人姓名</div>
            <div class="black borderColor" style="border-right: 1px solid;">收货人电话</div>
            <div class="black borderColor" style="border-right: 1px solid;">收货人区域</div>
            <div class="black borderColor" style="border-right: 1px solid;">地址（反解析）</div>
            <div class="black">详细地址</div>
          </div>
          <div class="borderColor" style="display: flex;border-top: 1px solid;">
            <div class="black borderColor" style="border-right: 1px solid;">{{ data.orderCustomer.receiver }}</div>
            <div class="black borderColor" style="border-right: 1px solid;">{{ data.orderCustomer.telephone }}</div>
            <div class="black borderColor" style="border-right: 1px solid;line-height: 21px;padding: 5px;">{{ data.orgName }}</div>
            <div class="black borderColor" style="border-right: 1px solid;">{{ data.orderCustomer.poiAddress }}</div>
            <div class="black borderColor">{{ data.orderCustomer.addressDetail }}</div>
          </div>
        </div>
      </div>
      <div style="width: 600px;margin-top: 20px">
        操作人信息：
        <div class="borderColor" style="border: 1px solid;">
          <div style="display: flex;">
            <div class="black borderColor" style="border-right: 1px solid;">操作人姓名</div>
            <div class="black borderColor" style="border-right: 1px solid;">操作人手机号</div>
            <div class="black borderColor">操作人账号</div>
          </div>
          <div class="borderColor" style="display: flex;border-top: 1px solid;">
            <div class="black borderColor" style="border-right: 1px solid;">{{ data.refundOperator ? data.refundOperator : '—' }}</div>
            <div class="black borderColor" style="border-right: 1px solid;">{{ data.refundOperatorPhone }}</div>
            <div class="black borderColor" style="line-height: 21px;padding: 5px;">{{ data.refundOperatorAccount }}</div>
          </div>
        </div>
      </div>
    </el-row>
    <el-dialog :title="{'order': '订单流转', 'dispatch': '派单日志'}[activeName]" :visible.sync="orderOpen" width="800px" append-to-body>
      <el-tabs v-model="activeName">
        <el-tab-pane label="订单流转" name="order">
          <el-table height="400" style="width: 100%" :data="data.transferHistoryList">
            <el-table-column align="center" prop="distributionName" label="姓名" />
            <el-table-column align="center" prop="distributionTelephone" label="手机号码" />
            <el-table-column align="center" prop="responseTime" label="接单时间" />
            <el-table-column align="center" prop="status" :formatter="flowStatusOptionsFormat" label="状态" />
            <el-table-column align="center" prop="awardAmount" label="奖励金额" :formatter="row => toDecimal2(row.awardAmount / 100)" />
            <el-table-column align="center" prop="punishmentAmount" label="处罚金额" :formatter="row => toDecimal2(row.punishmentAmount / 100)" />
            <el-table-column align="center" prop="reason" label="理由" :formatter="transferReasonFormat" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="派单日志" name="dispatch">
          <div v-if="data.distributionPushLogGroupDTOList && data.distributionPushLogGroupDTOList.length">
            <div class="table-dispatch">
              <div style="width: 10%;">姓名</div>
              <div style="width: 10%;">类型</div>
              <div style="width: 15%;">手机号</div>
              <div style="width: 15%;">时间</div>
              <div style="width: 10%;">距离</div>
              <div style="width: 20%;">商品库存</div>
              <div style="width: 10%;">库存价值</div>
              <div style="width: 10%;">备注</div>
            </div>
            <div v-for="item in data.distributionPushLogGroupDTOList" :key="item.distributionPushLogGroupId">
              <div class="type-lable">{{ pushTypeFormat({type: item.distributionType}) }}</div>
              <div v-if="!item.distributionPushLogList || item.distributionPushLogList.length === 0" class="type-lable">
                附近无配送员
              </div>
              <div v-for="dataItem in item.distributionPushLogList" v-else :key="dataItem.distributionPushLogId" class="table">
                <div style="width: 10%;">{{ dataItem.distributionName }}</div>
                <div style="width: 10%;">{{ pushTypeFormat({type: dataItem.type}) }}</div>
                <div style="width: 15%;">{{ dataItem.distributionTelephone }}</div>
                <div style="width: 15%;">{{ dataItem.createTime }}</div>
                <div style="width: 10%;">{{ dataItem.distance }}</div>
                <div style="width: 20%;">
                  <div class="goods">
                    <div
                      v-for="goods in (dataItem.goodsStockInfo ? JSON.parse(dataItem.goodsStockInfo) : [])"
                      :key="goods.goodsId"
                      style="padding: 5px; display: flex"
                    >
                      <div
                        class="goodsName"
                        style="width: 100px;overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;"
                      >{{ goods.goodsName }}</div>
                      <div class="price" style="width: 50px;">{{ goods.stock }}包</div>
                    </div>
                  </div>
                </div>
                <div style="width: 10%;">{{ toDecimal2(dataItem.goodsAmount / 100) }}</div>
                <div style="width: 10%;">{{ pushLogRemarkFormat({ remark: dataItem.remark }) }}</div>
              </div>
            </div>
          </div>
          <el-table v-else height="400" :data="data.distributionPushLogList" style="width: 100%">
            <el-table-column align="center" prop="distributionName" label="姓名" />
            <el-table-column align="center" prop="type" label="类型" :formatter="pushTypeFormat" />
            <el-table-column align="center" prop="distributionTelephone" label="手机号" />
            <el-table-column align="center" prop="createTime" label="时间" />
            <el-table-column align="center" prop="distance" label="距离" />
            <el-table-column prop="goodsStockInfo" width="150" align="center" label="商品库存">
              <template slot-scope="scope">
                <div class="goods">
                  <div
                    v-for="goods in (scope.row.goodsStockInfo ? JSON.parse(scope.row.goodsStockInfo) : [])"
                    :key="goods.goodsId"
                    style="padding: 5px; display: flex"
                  >
                    <div
                      class="goodsName"
                      style="width: 100px;overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;"
                    >{{ goods.goodsName }}</div>
                    <div class="price" style="width: 50px;">{{ goods.stock }}包</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="goodsAmount" label="库存价值" :formatter="row => toDecimal2(row.goodsAmount / 100)" />
            <el-table-column align="center" prop="remark" :formatter="pushLogRemarkFormat" label="备注" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <!-- <el-row >
      <el-col :push="18" :span="4" style="line-height: 30px;font-size: 14px;">
        <div style="display: flex;">
          <div class="title" style="width: 120px">商品小计：</div>
          <div>￥{{ data.goodsSubtotal && toDecimal2(data.goodsSubtotal / 100) }}</div>
        </div>
        <div style="display: flex;">
          <div class="title" style="width: 120px">配送费：</div>
          <div>￥{{ data.customerDistributionFee && toDecimal2(data.customerDistributionFee / 100) }}</div>
        </div>
        <div style="display: flex;">
          <div class="title" style="width: 120px">优惠总金额：</div>
          <div>￥{{ data.totalDiscountAmount ? toDecimal2(data.totalDiscountAmount / 100) : 0 }}</div>
        </div>
        <div style="display: flex;">
          <div class="title" style="width: 120px">实付金额：</div>
          <div>￥{{ data.actualPayAmount && toDecimal2(data.actualPayAmount / 100) }}</div>
        </div>
      </el-col>
    </el-row> -->
    <el-dialog title="审核" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="申请理由" prop="applyReason">
          <div>{{ form.applyReason }}</div>
          <!-- <el-input class="input_dis" v-model="form.applyReason" disabled/> -->
        </el-form-item>
        <el-form-item label="申请说明" prop="applyRemark">
          <div>{{ form.applyRemark }}</div>
          <!-- <el-input class="input_dis" v-model="form.applyRemark" disabled /> -->
        </el-form-item>
        <el-form-item label="图片" prop="applyImage">
          <el-row v-if="form.applyImage">
            <el-col v-for="(item, index) in form.applyImage.split(',')" :key="index" :span="4">
              <el-image
                style="width: 50px;height: 50px;padding: 0 5px;"
                :z-index="3000"
                :src="prefix + item"
                :preview-src-list="form.applyImage.split(',').map(item => prefix + item)"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item v-if="form.applyType === 'returnGoodsAndRefund'" label="申请原因">
          <el-col :span="14">{{ reasonTypeFormat(form.reasonType) }}</el-col>
        </el-form-item>
        <el-form-item label="申请处理结果">
          <el-col v-if="form.applyType === 'refund'" :span="14">已退{{ form.refundAmount && toDecimal2(form.refundAmount / 100) }}元；</el-col>
          <el-col v-if="form.applyType === 'exchange'" :span="14">已换货</el-col>
          <el-col v-if="form.applyType === 'returnGoodsAndRefund'" :span="14">已退款退货</el-col>
        </el-form-item>
        <!-- <el-form-item label="备注" prop="remark">
          <el-input
            disabled
            type="textarea"
            placeholder="请输入卖家备注"
            v-model="form.remark"
            :autosize="{ minRows: 3, maxRows: 5}"
            maxlength="20"
            show-word-limit
          />
        </el-form-item> -->
        <el-form-item label="审核状态">
          <div :style="{ color: {agree: 'green', refuse: 'red'}[form.status]}">{{ {agree: '同意', refuse: '拒绝'}[form.status] }}</div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
  <div v-else />
</template>

<script>
import { getOrderDetails } from '@/api/order/orderInfo'
import { getProtectionDetails } from '@/api/order/afterSales'

export default {
  name: 'Details',
  components: {},
  data() {
    return {
      // 遮罩层
      loading: true,
      data: null,
      // 图片前缀
      prefix: sessionStorage.getItem('prefix'),
      // 步骤条
      orderType: 0,
      // 列表展示
      activeName: 'order',
      // 派单类型
      pushTypeOptions: [],
      // 订单类型
      orderStatusOptions: [],
      // 售后维权
      afterSalesOptions: [],
      // 售后维权状态
      salesTypeOptions: [],
      // 订单流转状态
      orderFlowStatusOptions: [],
      // 理由
      transferReasonOptions: [],
      // 原因
      reasonTypeOptions: [],
      // 订单类型
      orderTypeOptions: [],
      // 优惠类型
      orderDiscountTypeOptions: [],
      // 优惠金额类型
      amountTypeOptions: [],
      // 优惠方式
      ruleTypeOptions: [],
      pushLogRemark: [],
      orderOpen: false,
      open: false,
      form: {},
      // 规则
      rules: {
        refundAmount: [{ required: true, message: '想退金额不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getOrder()
    this.getDicts('distribution_push_type').then((response) => {
      this.pushTypeOptions = response.data
    })
    this.getDicts('order_type').then((response) => {
      this.orderTypeOptions = response.data
    })
    this.getDicts('order_status').then((response) => {
      this.orderStatusOptions = response.data
    })
    this.getDicts('order_after_sales').then((response) => {
      this.afterSalesOptions = response.data
    })
    this.getDicts('after_sales_type').then((response) => {
      this.salesTypeOptions = response.data
    })
    this.getDicts('delivery_order_flow_status').then((response) => {
      this.orderFlowStatusOptions = response.data
    })
    this.getDicts('order_transfer_reason').then((response) => {
      this.transferReasonOptions = response.data
    })
    this.getDicts('after_sales_reason_type').then((response) => {
      this.reasonTypeOptions = response.data
    })
    this.getDicts('order_discount_type').then((response) => {
      this.orderDiscountTypeOptions = response.data
    })
    this.getDicts('discount_amount_type').then((response) => {
      this.amountTypeOptions = response.data
    })
    this.getDicts('discount_rule_type').then((response) => {
      this.ruleTypeOptions = response.data
    })
    this.getDicts('push_log_remark').then((response) => {
      this.pushLogRemark = response.data
    })
  },
  methods: {
    /** 查询订单详情 */
    getOrder() {
      this.loading = true
      getOrderDetails(this.$route.query.orderId).then(res => {
        this.loading = false
        this.data = res.data
        res.data.orderStatusList.map((item, index) => {
          if (!item.orderTime && this.orderType === 0) {
            this.orderType = index
          }
          if (index === res.data.orderStatusList.length - 1 && item.orderTime) {
            this.orderType = index + 1
          }
        })
      })
    },
    // 派单类型字典翻译
    pushTypeFormat(row, column) {
      return this.selectDictLabel(this.pushTypeOptions, row.type)
    },
    orderTypeFormat(row, column) {
      return this.selectDictLabel(this.orderTypeOptions, row)
    },
    flowStatusOptionsFormat(row, column) {
      return this.selectDictLabel(this.orderFlowStatusOptions, row.status)
    },
    // 理由
    transferReasonFormat(row, column) {
      return this.selectDictLabel(this.transferReasonOptions, row.reason)
    },
    // 订单状态
    statusFormat(status) {
      return this.selectDictLabel(this.orderStatusOptions, status)
    },
    // 售后维权
    afterSalesFormat(status) {
      return this.selectDictLabel(this.afterSalesOptions, status)
    },
    // 售后维权状态
    salesTypeFormat(status) {
      console.log(this.selectDictLabel(this.salesTypeOptions, status))
      return this.selectDictLabel(this.salesTypeOptions, status)
    },
    // 原因状态
    reasonTypeFormat(status) {
      return this.selectDictLabel(this.reasonTypeOptions, status)
    },
    // 优惠类型
    discountTypeFormat(status) {
      return this.selectDictLabel(this.orderDiscountTypeOptions, status)
    },
    amountTypeFormat(status) {
      return this.selectDictLabel(this.amountTypeOptions, status)
    },
    ruleTypeFormat(status) {
      return this.selectDictLabel(this.ruleTypeOptions, status)
    },
    pushLogRemarkFormat(row) {
      return this.selectDictLabel(this.pushLogRemark, row.remark)
    },

    /** 打开model框 */
    handleModel(orderAfterSalesId) {
      getProtectionDetails(orderAfterSalesId).then(res => {
        this.form = {
          orderAfterSalesId: res.orderAfterSalesId,
          applyReason: res.data.applyReason,
          applyRemark: res.data.applyRemark,
          applyImage: res.data.applyImage,
          payAmount: res.data.payAmount,
          refundAmount: res.data.refundAmount,
          reasonType: res.data.reasonType,
          applyType: res.data.applyType,
          remark: res.data.remark,
          status: res.data.status
        }
        this.open = true
      })
    },
    handleOrderzs(type) {
      this.orderOpen = true
      this.activeName = type
    }
  }
}
</script>
<style scoped lang="scss">
.borderColor{
  border-color: #e2e2e2 !important;
}
.minTabtitle{
  width: 100%;
  padding: 5px;
  font-size: 14px;
  text-align: center;
  border: 1px solid;
  border-bottom-style: none;
}
.title{
  width: 80px;
  text-align: end;
}
.black {
  width: 200px;
  line-height: 35px;
  text-align: center;
}
.table_bleck{
  padding: 5px 0;
  border-right: 1px solid;
}
.table_info {
  overflow: auto;
  max-height: 250px;
}
.table_info::-webkit-scrollbar {
  /*滚动条整体样式*/
  width : 6px;  /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
  }
  .table_info::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  box-shadow   : inset 0 0 5px rgba(0, 0, 0, 0.2);
  background   : #535353;
  }
  .table_info::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  box-shadow   : inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  background   : #ededed;
  }
  .orderTable{
    display: flex;
    text-align: center;
    background-color: #f8f8f9;
    color: #515a6e;
    font-size: 14px;
    font-weight: 600;
    padding: 15px 10px;
  }
  .goods_info{
    margin-top: 10px;
    display: flex;
    .img {
      width: 40px;
      height: 40px;
      vertical-align: middle;
    }
    .goodsName {
      width: 45%;
      margin: auto;
      text-align: center;
    }
  }
  .table_text{
    margin: auto 0;
    text-align: center;
  }
  .table-dispatch{
    display: flex;
    text-align: center;
    // background-color: #f8f8f9;
    // color: #515a6e;
    background-color: #e3e3e3;
    color: #333;
    font-size: 14px;
    font-weight: 600;
    padding: 15px 10px;
    border-bottom: 1px solid #e2e2e2;
  }
  .type-lable {
    text-align: center;
    padding: 10px 0;
    font-size: 14px;
    color: #333;
    font-weight: bold;
  }
  .table {
    display: flex;
    flex-wrap: nowrap;
    align-content: center;
    flex-direction: row;
    padding: 10px;
    font-size: 14px;
    text-align: center;
    border-bottom: 1px solid #e2e2e2;
  }
</style>
