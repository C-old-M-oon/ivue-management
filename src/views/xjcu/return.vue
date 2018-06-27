<template>
  <div class="parameterConfig">
    <QuickFilter :taglist="tagList" @gettagIndex='gettagIndex'></QuickFilter>
    <Collapse v-model="collapseName" style="margin: 10px 0">
      <Panel name="1">
        <div style="display:inline-block;float: left;margin-right: 10px" @click.stop>
          <Button type="success" icon="plus" @click='addShow'>新增退款</Button>
          <Button type="error" icon="close" @click='deleteShow'>删除</Button>
          <Button type="info" icon="ios-cloud-download" @click='exportOut'>导出</Button>
          <Button type="primary" icon="arrow-shrink" @click='changeNos' v-show="batchOperation">批量{{batchOperationType}}</Button>
        </div>
        <div slot="content">
          <Select v-model="filter.businessType" :clearable="true" placeholder="业务类型" style="width: 100px;margin-right: 10px">
            <Option value="低消">低消</Option>
            <Option value="月包">月包</Option>
            <Option value="内容包">内容包</Option>
            <Option value="其他">其他</Option>
          </Select>
          <Select v-model="filter.refundSource" :clearable="true" placeholder="来源" style="width: 100px;margin-right: 10px">
            <Option value="沃助手">沃助手</Option>
            <Option value="营销平台">营销平台</Option>
            <Option value="太字节">太字节</Option>
          </Select>
          <Select v-model="filter.area" :clearable="true" filterable placeholder="地州" style="width: 100px;margin-right: 10px">
            <Option v-for="item in cityList" :value="item.key" v-text="item.value" key="item"></Option>
          </Select>
          <datePicker type="daterange" placement="bottom-start" placeholder="投诉日期" style="width: 200px;margin-right: 10px" @on-change="changeComplainTime"></datePicker>
          <datePicker type="daterange" placement="bottom-start" placeholder="订购日期" style="width: 200px" @on-change="changeOrderTime"></datePicker>
          <Button type="primary" icon="ios-search" @click='search(1)' style="float: right">查找</Button>
        </div>
        <div style="display:inline-block;float: right;margin-right: 10px;width: 150px" @click.stop>
          <Input icon="search" placeholder="电话号码" style="width: 90%" v-model='filter.mobileNumber' @on-click="search(1)"></Input>
        </div>
      </Panel>
    </Collapse>
    <Table :columns="columns" :data="datas" :loading="dataLoading" @on-selection-change='selectItem' size="small"></Table>
    <br>
    <br>
    <div class="page">
      <Page :total="TotalRecords" :current="filter.pageNo" @on-change='changePage' :page-size="filter.pageSize" show-elevator show-sizer placement="top" :page-size-opts="pageConfig" @on-page-size-change="changePageSize" style="display: inline-block;vertical-align: middle;"></Page>
      <div class="records" style="display: inline-block;height: 32px;line-height: 32px;margin-left: 5%;">
        当前共<span style="color: #f00;font-weight: bold;"> {{TotalRecords}} </span>条记录，已选定<span style="color: #f00;font-weight: bold;"> {{checkedDatas.length}} </span>条记录
      </div>
    </div>

    <!-- 添加退费 -->
    <Modal v-model="modalAdd" width="650" :mask-closable="false" class-name="vertical-center-modal modalAdd">
      <p slot="header" style="color:#f60;text-align:center;">
        <Icon type="information-circled"></Icon>
        <span>添加退费</span>
        <span class="customer" style="position: absolute; right: 8%;;color:#333">
          客服: {{formItem.customer}}
        </span>
      </p>
      <div>
        <Form ref="formValidate" :model="formItem" :rules="ruleValidate" :label-width="80" style="width: 100%;margin: 0 auto">
          <FormItem label="号码" prop="mobileNumber">
            <Input v-model="formItem.mobileNumber" placeholder="投诉号码"></Input>
          </FormItem>
          <FormItem label="地州" prop="area">
            <Select v-model="formItem.area" :clearable="true" filterable>
              <Option v-for="item in cityList" :value="item.key" v-text="item.value" key="item"></Option>
            </Select>
          </FormItem>
          <FormItem label="业务类型" prop="businessType">
            <Select v-model="formItem.businessType" :clearable="true">
              <Option value="低消">低消</Option>
              <Option value="月包">月包</Option>
              <Option value="内容包">内容包</Option>
              <Option value="其他">其他</Option>
            </Select>
          </FormItem>
          <FormItem label="投诉日期" prop="complainTime">
            <DatePicker type="date" placeholder="Select date" :value="formItem.complainTime" style="width: 100%" @on-change="selectComplainTime"></DatePicker>
          </FormItem>
          <FormItem label="订购日期" prop="orderTime">
            <DatePicker type="date" placeholder="Select date" :value="formItem.orderTime" style="width: 100%" @on-change="selectOrderTime"></DatePicker>
          </FormItem>
          <FormItem label="订单来源" prop="refundSource">
            <Select v-model="formItem.refundSource" :clearable="true">
              <Option value="沃助手">沃助手</Option>
              <Option value="营销平台">营销平台</Option>
              <Option value="太字节">太字节</Option>
            </Select>
          </FormItem>
          <FormItem label="产品" prop="orderProduct" style="width: 60%">
            <Input v-model="formItem.orderProduct" placeholder="订购产品"></Input>
          </FormItem>
          <FormItem>
            <Checkbox @on-change="checkRefund" style="line-height: 32px" :value="refundFollow">跟踪退订</Checkbox>
          </FormItem>
          <FormItem label="备注" style="width: 90%">
            <Input v-model="formItem.remarks" placeholder="请输入备注"></Input>
          </FormItem>
          <hr />
          <Row>
            <Col span="24" style="border: 1px solid #ccc;padding: 5px 15px;">
              <Col span="24">
                <RadioGroup v-model="radio" style="width: 100%" @on-change="changeRefundType">
                  <Radio label="outer" style="width: 49%;margin-right: 0">外部退款</Radio>
                  <Radio label="inner" style="width: 50%;margin-right: 0">内部退款</Radio>
                </RadioGroup>
              </Col>
              <Col span="12">
                <Row>
                  <Col span='8' style="margin-bottom: 10px">
                    <Checkbox :disabled="radio == 'inner'" @on-change="checkOneRefund" style="line-height: 32px" :value="oneRefundChecked">一次退费</Checkbox>
                  </Col>
                  <Col span='14' style="margin-bottom: 10px">
                    <span>金额 </span>
                    <InputNumber :min="1" v-model="formItem.oneRefundMoney"></InputNumber>
                  </Col>
                </Row>
                <Row>
                  <Col span='8'>
                    <Checkbox :disabled="radio == 'inner'" @on-change="checkTwoRefund" style="line-height: 32px" :value="twoRefundChecked">二次退费</Checkbox>
                  </Col>
                  <Col span='12'>
                    <Select placeholder="网别" :clearable="true" v-model="formItem.netType">
                        <Option value="CB">CB</Option>
                        <Option value="BSS">BSS</Option>
                    </Select>
                  </Col>
                </Row>
              </Col>
              <Col span="12">
                <span>金额 </span>
                <InputNumber :min="1" v-model="formItem.interRefundMoney"></InputNumber>
              </Col>
            </Col>
          </Row>
          <hr />
        </Form>
      </div>
      <div slot="footer" style="text-align: right">
        <Button type="success" :loading="modal_loading" @click="handleSubmit('formValidate')">提交</Button>
        <Button type="ghost" style="margin-left: 8px" @click="modalAdd = false">取消</Button>
      </div>
    </Modal>

    <!-- 状态切换 -->
    <Modal v-model="modalChangeStatus" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>确认操作</span>
      </p>
      <div style="text-align:center;overflow: hidden">
        <p v-if="changeType != '一次退款' && changeType != '二次退款'">确定要修改 <span style="font-weight: bold">{{changeTips}}</span> 状态吗？</p>
        <p v-if="changeType == '一次退款' || changeType == '二次退款'">对选定的{{checkedDatas.length}}条记录提交 <span style="font-weight: bold">{{batchOperationType}}</span> 并导出清单</p>
        <Input v-model="money" v-show="changeType == '二退金额'" style="margin-top: 10px">
          <span slot="prepend">二退金额</span>
        </Input>
        <Input v-model="oneRefundMoney" v-show="changeType == '一退金额'" style="margin-top: 10px">
          <span slot="prepend">一退金额</span>
        </Input>
        <Checkbox v-model="twoRefundMoneyStatusCheckd" v-show="changeType == '二退金额'" @on-change="changeTwoRefundMoneyStatus" style="float: left;margin-top: 10px">无需二退</Checkbox>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" long :loading="modal_loading" @click="changeStatus">确认</Button>
      </div>
    </Modal>

    <!-- 订单详情 -->
    <Modal v-model="modalDetail" width="650" :mask-closable="false" id="modalDetail" :styles="{top: '50px'}">
      <p slot="header" style="color:#000;text-align:center;font-weight: bold;font-size: 18px">
        <Icon type="information-circled"></Icon>
        <span>详单查询</span>
      </p>
      <div class="content">
        <div class="public" style="border: 1px solid #ccc;border-radius: 20px;padding: 15px;">
          <Row style="border-bottom: 1px dotted #4CAF50;padding: 5px 0;font-size: 14px">
            <Col span="8">
              <span>号&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;码</span> {{infoDetail.mobileNumber}}
            </Col>
            <Col span="8">
              <span>地&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;州</span> {{infoDetail.area}}
            </Col>
            <Col span="8">
              <span>业务类型</span> {{infoDetail.businessType}}
            </Col>
          </Row>
          <Row style="border-bottom: 1px dotted #4CAF50;padding: 5px 0;font-size: 14px">
            <Col span="8">
              <span>投诉日期</span> {{infoDetail.complainDate}}
            </Col>
            <Col span="8">
              <span>订购日期</span> {{infoDetail.orderData}}
            </Col>
            <Col span="8">
              <span>订单来源</span> {{infoDetail.refundSource}}
            </Col>
          </Row>
          <Row style="border-bottom: 1px dotted #4CAF50;padding: 5px 0;font-size: 14px">
            <Col span="8">
              <span>接单客服</span> {{infoDetail.customer}}
            </Col>
            <Col span="16">
              <span>产&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;品</span> {{infoDetail.orderProduct}}
            </Col>
          </Row>
          <Row style="padding: 5px 0;font-size: 14px">
            <Col span="24">
              <span>备&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;注</span> {{infoDetail.remarks}}
            </Col>
          </Row>
        </div>
        <div class="panelContents">
          <Tabs value="name1">
            <TabPane label="回单信息" name="name1">
              <fieldset>
                <legend>回单文本</legend>
                <Row>
                  <Col span="8">
                    <span>回邮状态</span> {{infoDetail.emailStatus}}
                  </Col>
                  <Col span="16">
                    <span>回邮地址</span> {{infoDetail.emailAddress}}
                  </Col>
                </Row>
                <Row>
                  <Col span="8">
                    <span>回邮经办</span> {{infoDetail.emailOperator}}
                  </Col>
                  <Col span="8">
                    <span>回邮日期</span> {{infoDetail.emailTime}}
                  </Col>
                  <Col span="8">
                    <Button v-if="infoDetail.annex" @click="downloadFile(infoDetail.annex)" size="small">附件</Button>
                  </Col>
                </Row>
              </fieldset>
              <fieldset>
                <legend>回邮详情</legend>
                <Row>
                  <Col span="24">
                    {{infoDetail.returnText}}
                  </Col>
                </Row>
              </fieldset>
            </TabPane>
            <TabPane label="屏蔽与退订详情" name="name2">
              <fieldset>
                <legend>屏蔽信息</legend>
                <Row>
                  <Col span="8">
                    <span>屏蔽状态</span> {{infoDetail.hieldStatus}}
                  </Col>
                  <Col span="8">
                    <span>屏蔽经办</span> {{infoDetail.hieldOperator}}
                  </Col>
                  <Col span="8">
                    <span>屏蔽日期</span> {{infoDetail.hieldTime}}
                  </Col>
                </Row>
              </fieldset>
              <fieldset>
                <legend>退订信息</legend>
                <Row>
                  <Col span="8">
                    <span>退订状态</span> {{infoDetail.refundBusinessStatus}}
                  </Col>
                  <Col span="8">
                    <span>退订经办</span> {{infoDetail.refundOperator}}
                  </Col>
                  <Col span="8">
                    <span>退订日期</span> {{infoDetail.refundTime}}
                  </Col>
                </Row>
              </fieldset>
            </TabPane>
            <TabPane label="退费详情" name="name3">
              <fieldset>
                <legend>业务退款</legend>
                <Row>
                  <Col span="8">
                    <span>现金退款</span> {{infoDetail.internalRefundStatus}}
                  </Col>
                  <Col span="8">
                    <Button v-if="infoDetail.refundScreenshot" @click="downloadFile(infoDetail.refundScreenshot)" size="small">截图</Button>
                  </Col>
                  <Col span="8">
                    <span>赠费退款</span> {{infoDetail.oneRefundStatus}}
                  </Col>
                </Row>
                <Row>
                  <Col span="8">
                    <span>金&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;额</span> {{infoDetail.oneRefundMoney}}
                  </Col>
                  <Col span="8">
                    <span>经&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;办</span> {{infoDetail.oneRefundOperator}}
                  </Col>
                  <Col span="8">
                    <span>退款日期</span> {{infoDetail.oneRefundTime}}
                  </Col>
                </Row>
              </fieldset>
              <fieldset>
                <legend>二次赠费</legend>
                <Row>
                  <Col span="16">
                    <span>状&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;态</span> {{infoDetail.twoRefundStatus}}
                  </Col>
                  <Col span="8">
                    <span>网&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;别</span> {{infoDetail.netType}}
                  </Col>
                </Row>
                <Row>
                  <Col span="8">
                    <span>金&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;额</span> {{infoDetail.twoRefundMoney}}
                  </Col>
                  <Col span="8">
                    <span>经&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;办</span> {{infoDetail.twoRefundOperator}}
                  </Col>
                  <Col span="8">
                    <span>退款日期</span> {{infoDetail.twoRefundTime}}
                  </Col>
                </Row>
              </fieldset>
            </TabPane>
            <TabPane label="短信提示" name="name4">
              <fieldset>
                <legend>退费提示</legend>
                <Row>
                  <Col span="12">
                    <span>发送状态</span> {{infoDetail.refundTipsStatus}}
                  </Col>
                  <Col span="12">
                    <span>发送日期</span> {{infoDetail.refundTipsTime}}
                  </Col>
                </Row>
                <Row>
                  <Col span="24">
                   <span>短&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;信</span> {{infoDetail.refundTipsSms}}
                  </Col>
                </Row>
              </fieldset>
              <fieldset style="padding: 10px;">
                <legend>月初提示</legend>
                <Row>
                  <Col span="12">
                    <span>发送状态</span> {{infoDetail.monthTipsStatus}}
                  </Col>
                  <Col span="12">
                    <span>发送日期</span> {{infoDetail.monthTipsTimes}}
                  </Col>
                </Row>
                <Row>
                  <Col span="24">
                   <span>短&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;信</span> {{infoDetail.monthTipsSms}}
                  </Col>
                </Row>
              </fieldset>
            </TabPane>
          </Tabs>
        </div>
        
      </div>
      <div slot="footer" style="display: none">
        <Button type="success" size="large" long @click='modalDetail = false'>确定</Button>
      </div>
    </Modal>

    <!-- 回单备注 -->
    <Modal v-model="modalRefundMarks" width="400" :mask-closable="false">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>编辑 回单备注</span>
      </p>
      <div style="text-align:center">
        <Input v-model="refundRmarks" type="textarea" :autosize="true" placeholder="请输入回单备注..."></Input>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" long :loading="modal_loading" @click="editReFundRmarks">确认</Button>
      </div>
    </Modal>

    <!-- 附件上传 -->
    <Modal v-model="modalAnnex" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>编辑 附件</span>
      </p>
      <div style="text-align:center">
        <p class="current" v-show="currentFile" style="margin-bottom: 10px">当前文件：{{currentFile}}</p>
        <Upload :action="uploadUrl" :on-success="uploadSuccess" :show-upload-list="true" accept=".doc,.docx" :default-file-list="defaultFileName" :before-upload="checkUploadName">
          <Button type="ghost" icon="ios-cloud-upload-outline" @click="fileType.fileType = '回单附件'">回单附件</Button>
        </Upload>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" long :loading="modal_loading" @click="editAnnex">确认</Button>
      </div>
    </Modal>

    <!-- 截图上传 -->
    <Modal v-model="modalScreenshoot" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>上传 截图</span>
      </p>
      <div style="text-align:center">
        <p class="current" v-show="currentFile" style="margin-bottom: 10px">当前文件：{{currentFile}}</p>
        <Upload :action="uploadUrl" :on-success="uploadSuccess" :show-upload-list="true" accept=".jpg,.png" :default-file-list="defaultFileName" :before-upload="checkUploadName">
          <Button type="ghost" icon="ios-cloud-upload-outline" @click="fileType.fileType = '退款截图'">退款截图</Button>
        </Upload>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" long :loading="modal_loading" @click="editRefundScreenshot">确认</Button>
      </div>
    </Modal>

    <!-- 订单备注 -->
    <Modal v-model="modalRearks" width="400">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>订单备注</span>
      </p>
      <div style="text-align:center">
        <Input v-model="remarks" type="textarea" :autosize="true" placeholder="请输入订单备注..."></Input>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" long :loading="modal_loading" @click="editRemarks">确认</Button>
      </div>
    </Modal>

    <!-- 删除 -->
    <Modal v-model="modalDelete" width="320">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>删除订单</span>
      </p>
      <div style="text-align:center">
        <Input v-model="passWord" type="password" :autosize="true" placeholder="请验证当前用户密码"></Input>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" long :loading="modal_loading" @click="deleteItem">确认</Button>
      </div>
    </Modal>
  </div>

</template>

<script>
  import QuickFilter from '@/views/main-components/quickFilter'
  import util from '@/libs/util';
  import Cookies from 'js-cookie';
  import {ERR_OK,pageSize} from '@/config/config'

  export default {
    computed: {
      changeTips() {
        switch (this.changeType) {
          case '内部退款': 
            return '内部退款'
            break
          case '一次退款': 
            return '一次退款'
            break
          case '一退金额': 
            return '一退金额'
            break
          case '业务退订': 
            return '业务退订'
            break
          case '二次退款': 
            return '二次退款'
            break
          case '二退金额': 
            return '二次退款金额'
            break
          case '屏蔽':
            return "屏蔽"
            break
          case '回邮':
            return "回邮"
            break
          default:
            return '修改操作'
        }
      },
      changeUrl() {
        switch (this.changeType) {
          case '内部退款': 
            return '/xjcu/refund/editInternalRefund.do'
            break
          case '一次退款': 
            return '/xjcu/refund/editOneRefund.do'
            break
          case '一退金额': 
            return '/xjcu/refund/editOneRefundMoney.do'
            break
          case '业务退订': 
            return '/xjcu/refund/editRefundBusiness.do'
            break
          case '二次退款': 
            return '/xjcu/refund/editTwoRefund.do'
            break
          case '二退金额': 
            return '/xjcu/refund/editTwoRefundMoney.do'
            break
          case '屏蔽': 
            return '/xjcu/refund/editHieldStatus.do'
            break
          case '回邮':
            return "/xjcu/refund/editEmailStatus.do"
            break
          default:
            return ''
        }
      }
    },
    data() {
      const borderStyle = {
        height: '40px',
        borderRight: '1px solid #2196f3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
      const baseWidth = 'auto'
      return {
        // 详情框
        modalDetail: false,
        infoDetail: {},
        initTime: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
        // 上传
        uploadUrl: util.baseUrl + '/xjcu/refund/uploadFile.do',
        fileType: {
          fileType: ''
        },
        ruleValidate: {
          mobileNumber: [
            { required: true, message: ' ', trigger: 'blur' }
          ],
          complainTime: [
            { required: true, message: ' ', trigger: 'blur' }
          ],
          orderTime: [
            { required: true, message: ' ', trigger: 'blur' }
          ],
          orderProduct: [
            { required: true, message: ' ', trigger: 'blur' }
          ],
          area: [
            { required: true, message: ' ', trigger: 'blur' }
          ],
          businessType: [
            { required: true, message: ' ', trigger: 'blur' }
          ],
          refundSource: [
            { required: true, message: ' ', trigger: 'blur' }
          ]
        },
        oneRefundChecked: true,
        twoRefundChecked: false,
        refundFollow: false,
        cityList: [],
        modalDelete: false,
        passWord: '',
        // 操作类型
        tagIndex: -1,
        changeType: '',
        changeStatusScreenshoot: '',
        modalChangeStatus: false,
        orderNos: '',
        oneRefundMoney: '',
        money: '',
        twoRefundMoneyStatus: 0,
        // 筛选条件相关
        tagList: ['投诉查询', '回单跟进', '号码屏蔽', '退订跟进', '内部退款' ,'一次退款', '二次退款'],
        collapseName: '',
        batchOperation: false,
        batchOperationType: '',
        // 添加退款相关
        modalAdd: false,
        modal_loading: false,
        radio: 'outer', // 退款类型
        formItem: {},
        // 完善订单信息
        editOrderNo: '',
        modalRefundMarks: false,
        refundRmarks: '',
        uploadName: '',
        defaultFileName: [],
        currentFile: '',
        modalAnnex: false,
        annex: '',
        modalScreenshoot: false,
        refundScreenshot: '',
        twoRefundMoneyStatusCheckd: false,
        modalRearks: false,
        remarks: '',
        // 退款列表相关
        dataLoading: false,
        filter: {
          pageNo: 1,
          pageSize: pageSize,
          // 快速搜索
          email: '',
          refundBusinessStatus: '',
          internalRefundStatus: '',
          oneRefundStatus: '',
          twoRefundStatus: '',
          // 详情搜索
          complainStartTime: '',
          complainEndTime: '',
          orderStartTime: '',
          orderEndTime: '',
          endTime: '',
          mobileNumber: '',
          area: '',
          businessType: '',
          refundSource: ''
        },
        TotalRecords: 0,
        columns: [
          {
            type: 'selection',
            width: baseWidth,
            align: 'center'
          },{
            title: '号码',
            width: 100,
            align: 'center',
            render: (h, params) => {
              return h('a', {
                on: {
                  dblclick: () => {
                    this.modalDetail = true
                    this.infoDetail = params.row
                  }
                }
              }, params.row.mobileNumber)
            }
          },{
            title: '产品',
            width: baseWidth,
            key: 'orderProduct',
            align: 'center',
            render: (h, params) => {
              return h('Tooltip', {
                props: {
                  content: params.row.orderProduct,
                  placement: 'top-start'
                },
                style: {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'left',
                  width: '60px'
                }
              }, params.row.orderProduct)
            }
          },{
            title: '投诉日期',
            width: 70,
            key: 'complainTime',
            align: 'center',
            render: (h, params) => {
              return h('span', params.row.complainDate.split(' ')[0])
            }
          },{
            title: '订购日期',
            width: 70,
            align: 'center',
            key: 'orderTime',
            render: (h, params) => {
              return h('span', params.row.orderData.split(' ')[0])
            }
          },{
            title: '地州',
            width: baseWidth,
            align: 'center',
            key: 'area'
          },{
            title: '业务',
            width: baseWidth,
            align: 'center',
            key: 'businessType'
          },{
            title: '来源',
            width: 60,
            align: 'center',
            key: 'refundSource',
            render: (h, params) => {
              return h('div', {
                style: borderStyle
              }, params.row.refundSource)
            }
          },{
            title: '回单',
            width: baseWidth,
            align: 'center',
            key: 'returnText',
            render: (h, params) => {
              return h('Poptip', {
                props: {
                  trigger: "hover",
                  width: '400',
                  content: params.row.returnText ? params.row.returnText : '点击添加'
                }
              }, [
                h('Button', {
                  props: {
                    icon: 'edit',
                    size: 'small',
                    type: params.row.returnText ? 'ghost' : 'warning'
                  },
                  on: {
                    click: () => {
                      this.modalRefundMarks = true
                      this.editOrderNo = params.row.orderNo
                      this.refundRmarks = params.row.returnText ? params.row.returnText : `【${params.row.mobileNumber}】于【${params.row.orderData}】订购【${params.row.orderProduct}】业务。用户表示非本人订购，要求退费。与用户协商结果如下:\r\rXXXXXXX\r\r,用户表示满意。以下是该用户的所有订购截图，（如没有截图请联系4000126559）`
                    }
                  }
                })
              ])
            }
          },{
            title: '附件',
            width: baseWidth,
            key: 'annex',
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Tooltip', {
                  props: {
                    content: params.row.annex ? params.row.annex : '待上传'
                  }
                } , [
                  h('Button', {
                    props: {
                      type: params.row.annex ? 'ghost' : 'warning',
                      size: 'small'
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.modalAnnex = true
                        this.editOrderNo = params.row.orderNo
                        this.uploadName = params.row.mobileNumber
                        this.annex = params.row.annex ? params.row.annex : ''
                        this.currentFile = params.row.annex ? params.row.annex : ''
                        this.defaultFileName = []
                      }
                    }
                  }, '附')
                ])
              ])
            }
          },{
            title: '回邮',
            width: baseWidth,
            align: 'center',
            key: 'emailStatus',
            render: (h, params) => {
              return h('div', {
                style: borderStyle
              }, [
                h('Button', {
                  props: {
                    type: params.row.emailStatus == '待发送' ? 'primary' : 'ghost',
                    size: 'small'
                  },
                  style: {
                    borderRight: '1px solid #ccc'
                  },
                  on: {
                    click: () =>{
                      if(params.row.emailStatus == '待发送') {
                        this.changeType = '回邮'
                        this.modalChangeStatus = true
                        this.orderNos = params.row.orderNo
                      }else {
                        return
                      }
                    }
                  }
                }, params.row.emailStatus == '无' ? ' ' : '邮')
              ])
              return 
            }
          },{
            title: '屏蔽',
            width: baseWidth,
            align: 'center',
            key: 'hieldStatus',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: params.row.hieldStatus == '待屏蔽' ? 'primary' : 'ghost',
                  size: 'small'
                },
                on: {
                  click: () =>{
                    if(params.row.hieldStatus == '待屏蔽') {
                      this.changeType = '屏蔽'
                      this.modalChangeStatus = true
                      this.orderNos = params.row.orderNo
                    }else {
                      return
                    }
                  }
                }
              }, '闭')
            }
          },{
            title: '退订',
            width: baseWidth,
            align: 'center',
            key: 'refundBusinessStatus',
            render: (h, params) => {
              return h('div', {
                style: borderStyle
              }, [
                 h('Button', {
                  props: {
                    type: params.row.refundBusinessStatus == '待退订' ? 'primary' : 'ghost',
                    size: 'small'
                  },
                  on: {
                    click: () =>{
                      if(params.row.refundBusinessStatus == '待退订') {
                        this.changeType = '业务退订'
                        this.modalChangeStatus = true
                        this.orderNos = params.row.orderNo
                      }else {
                        return
                      }
                    }
                  }
                }, params.row.refundBusinessStatus === '无' ? ' ' : '订')
              ])
              return 
            }
          },{
            title: '退款',
            width: baseWidth,
            align: 'center',
            key: 'internalRefundStatus',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: params.row.internalRefundStatus == '待退款' ? 'primary' : 'ghost',
                  size: 'small'
                },
                on: {
                  click: () =>{
                    if(params.row.internalRefundStatus == '待退款') {
                      this.changeType = '内部退款'
                      this.modalChangeStatus = true
                      this.orderNos = params.row.orderNo
                    }else {
                      return
                    }
                  }
                }
              }, params.row.internalRefundStatus === '无' ? ' ' : '退')
            }
          },{
            title: '截图',
            width: baseWidth,
            align: 'center',
            key: 'screenShot',
            render: (h, params) => {
              return h('div', {
                style: borderStyle
              }, [
                h('Button', {
                  props: {
                    type: params.row.refundScreenshot || params.row.oneRefundStatus != '无' ? 'ghost' : 'warning',
                    size: 'small'
                  },
                  on: {
                    click: () =>{
                      if(params.row.internalRefundStatus == '无') {
                        return
                      }
                      this.modalScreenshoot = true
                      this.editOrderNo = params.row.orderNo
                      this.uploadName = params.row.mobileNumber
                      this.refundScreenshot = params.row.refundScreenshot ? params.row.refundScreenshot : ''
                        this.currentFile = params.row.refundScreenshot ? params.row.refundScreenshot : ''
                      this.defaultFileName = []
                    }
                  }
                }, params.row.internalRefundStatus == '无' ? '' : '图')
              ])
            }
          },{
            title: '一退',
            width: baseWidth,
            align: 'center',
            key: 'oneRefundStatus',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: params.row.oneRefundStatus == '待提交' ? 'primary' : 'ghost',
                  size: 'small'
                },
                on: {
                  click: () =>{
                    if(params.row.oneRefundStatus == '待提交') {
                      // this.changeType = '一次退款'
                      // this.modalChangeStatus = true
                      // this.orderNos = params.row.orderNo
                    }else {
                      return
                    }
                  }
                }
              }, params.row.oneRefundStatus === '无' ? ' ' : '1')
            }
          },{
            title: '金额1',
            width: baseWidth,
            align: 'center',
            key: 'oneRefundMoney',
            render: (h, params) => {
              if(params.row.oneRefundStatus == '待提交' || params.row.internalRefundStatus == '待退款') {
                return h('Button', {
                  props: {
                    type: params.row.oneRefundStatus == '待提交' && params.row.oneRefundMoney == 0 ? 'warning' : 'text',
                    size: 'small'
                  },
                  on: {
                    click: () =>{
                      this.changeType = '一退金额'
                      this.modalChangeStatus = true
                      this.orderNos = params.row.orderNo
                      this.oneRefundMoney = params.row.oneRefundMoney
                    }
                  }
                }, params.row.oneRefundMoney == 0 ? '金' : params.row.oneRefundMoney ) 
              }else {
                return h('span', params.row.oneRefundMoney)
              }
              // return h('div', {
              //   style: borderStyle
              // }, params.row.oneRefundMoney)
            }
          },{
            title: '二退',
            width: baseWidth,
            align: 'center',
            key: 'twoRefundStatus',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: params.row.twoRefundStatus == '待提交' ? 'primary' : 'ghost',
                  size: 'small'
                },
                on: {
                  click: () =>{
                    if(params.row.twoRefundStatus == '待提交') {
                      // this.changeType = '二次退款'
                      // this.modalChangeStatus = true
                      // this.orderNos = params.row.orderNo
                    }else {
                      return
                    }
                  }
                }
              }, params.row.twoRefundStatus === '无' ? ' ' : '2')
            }
          },{
            title: '网别',
            key: 'netType',
            width: baseWidth,
            align: 'center'
          },{
            title: '金额2',
            width: baseWidth,
            align: 'center',
            key: 'twoRefundMoney',
            render: (h, params) => {
              if(params.row.twoRefundStatus == '待提交') {
                return h('Button', {
                  props: {
                    type: params.row.twoRefundStatus == '待提交' && params.row.twoRefundMoney == 0 ? 'warning' : 'text',
                    size: 'small'
                  },
                  on: {
                    click: () =>{
                      this.changeType = '二退金额'
                      this.modalChangeStatus = true
                      this.twoRefundMoneyStatusCheckd = false
                      this.orderNos = params.row.orderNo
                      this.money = params.row.twoRefundMoney
                    }
                  }
                }, params.row.twoRefundMoney == 0 ? '金' : params.row.twoRefundMoney ) 
              }else {
                return h('span', params.row.twoRefundMoney)
              }
            }
          },{
            title: '备注',
            align: 'center',
            key: 'remarks',
            render: (h, params) => {
              return h('Poptip', {
                props: {
                  trigger: "hover",
                  width: '200',
                  placement: 'left-start',
                  content: params.row.remarks ? params.row.remarks : '待添加'
                }
              }, [
                h('Button', {
                  props: {
                    icon: params.row.remarks ? 'edit' : 'return',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.modalRearks = true
                      this.editOrderNo = params.row.orderNo
                      this.remarks = params.row.remarks ? params.row.remarks : ``
                    }
                  }
                }, ' ')
              ])
            }
          }
        ],
        datas: [],
        checkedDatas: [],
        pageConfig: [8, 10, 15, 18, 20, 300]
      }
    },
    methods: {
      getCity() {
        var _that = this;
        util.ajax.get(util.baseUrl + '/xjcu/tool/getArea')
        .then(function(res){
          if(res.data.status == ERR_OK) {
             res.data.data.map(item => {
              _that.cityList.push({
                key: item,
                value: item
              })
            })
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err);
        });
      },
      gettagIndex(index) {
        this.tagIndex = index
        if(index === 1 || index === 5 || index === 6) {
          this.batchOperation = true
          index === 1 ? this.batchOperationType = '回邮' : index === 5 ? this.batchOperationType = '一次退款' : this.batchOperationType = '二次退款'
          index === 1 ? this.changeType = '回邮' : index === 5 ? this.changeType = '一次退款' : this.changeType = '二次退款'
        }else {
          this.batchOperation = false
        }
        var _filter = {
          pageNo: 1,
          pageSize: this.filter.pageSize,
          // 快速搜索
          emailStatus: '',
          refundBusinessStatus: '',
          internalRefundStatus: '',
          oneRefundStatus: '',
          twoRefundStatus: '',
          // 详情搜索
          startTime: '',
          endTime: '',
          mobileNumber: '',
          area: '',
          businessType: '',
          refundSource: ''
        }
        switch (index) {
          case -1: 
            this.filter = _filter
            break
          case 0: 
            // 投诉查询
            this.filter = _filter
            break
          case 1: 
            // 回单跟进
            this.filter = Object.assign(_filter, {
              emailStatus: '待发送'
            })
            break
          case 2: 
            // 号码屏蔽
            this.filter = Object.assign(_filter, {
              hieldStatus: '待屏蔽'
            })
            break
          case 3: 
            // 退订跟进
            this.filter = Object.assign(_filter, {
              refundBusinessStatus: '待退订'
            })
            break
          case 4: 
            // 内部退款
            this.filter = Object.assign(_filter, {
              internalRefundStatus: '待退款'
            })
            break
          case 5: 
            // 一次退款
            this.filter = Object.assign(_filter, {
              oneRefundStatus: '待提交'
            })
            break
          case 6: 
            // 二次退款
            this.filter = Object.assign(_filter, {
              twoRefundStatus: '待提交'
            })
            break
        }
        this.search(1)
      },
      changeComplainTime(time) {
        this.filter.complainStartTime = time[0] ? `${time[0]} 00:00:00` : ''
        this.filter.complainEndTime = time[1] ? `${time[1]} 23:59:59` : ''
      },
      changeOrderTime(time) {
        this.filter.orderStartTime = time[0] ? `${time[0]} 00:00:00` : ''
        this.filter.orderEndTime = time[1] ? `${time[1]} 23:59:59` : ''
      },
      search(no) {
        var _that = this;
        this.filter.pageNo = no
        this.dataLoading = true
        this.orderNos = ''
        this.checkedDatas = []
        util.ajax.get(util.baseUrl + '/xjcu/refund/list', {
          params: this.filter
        })
        .then(function(res){
          _that.dataLoading = false
          if(res.data.status == ERR_OK) {
            _that.datas = res.data.data.list
            _that.TotalRecords = res.data.data.total
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      changePageSize(pageSize) {
        this.filter.pageSize = pageSize
        this.search(1)
      },
      changePage(no) {
        this.search(no)
      },
      selectItem(arr) {
        this.checkedDatas = arr;
        var _arr = []
        if(arr.length) {
          arr.map(item => {
            _arr.push(item.orderNo)
          })
          this.orderNos = _arr.join(',')
        } else {
          this.orderNos = ''
        }
      },
      changeTwoRefundMoneyStatus(flag) {
        if(flag) {
          this.twoRefundMoneyStatus = 1
          this.twoRefundMoneyStatusCheckd = true
        } else {
          this.twoRefundMoneyStatus = 0
          this.twoRefundMoneyStatusCheckd = false
        }
      },
      // 批量改变状态
      changeNos() {
        if(!this.filter.area && this.changeType != '回单跟进') {
          this.$Message.warning('请选择批量操作的地州！')
          return
        }
        this.modalChangeStatus = true
        if(this.tagIndex == 5) {
          this.changeType = '一次退款'
        } else if (this.tagIndex == 6) {
          this.changeType = '二次退款'
        }
        this.changeStatusScreenshoot = ''
      },
      // 改变状态
      changeStatus() {
        var _that = this;
        var _changeData = {
          orderNos: _that.orderNos,
          refundScreenshot: _that.changeStatusScreenshoot,
          money: _that.changeType == '二退金额' ? _that.money : _that.changeType == '一退金额' ? _that.oneRefundMoney : '',
          twoRefundMoneyStatus: _that.changeType == '二退金额' ? _that.twoRefundMoneyStatus : ''
        }
        if(this.changeType == '一次退款' || this.changeType == '二次退款') {
          let _url = `${util.baseUrl}${this.changeUrl}?i=1${util.parseParam(_changeData)}`
          window.location.href = _url
          _that.$Message.success('操作成功！')
          _that.modalChangeStatus = false
          _that.search(_that.filter.pageNo)
        }else {
          this.modal_loading = true
          util.ajax.get(util.baseUrl + this.changeUrl, {
            params: _changeData
          })
          .then(function(res){
            _that.modal_loading = false
            if(res.data.status != 400) {
              if(_that.changeType == '回邮' && _that.batchOperation) {
                _that.$Message.success(res.data.msg)
              } else {
                _that.$Message.success('操作成功！')
              }
              _that.modalChangeStatus = false
              _that.search(_that.filter.pageNo)
            }else {
              _that.$Message.error(res.data.msg)
            }
          })
          .catch(function(err){
            console.log(err)
          });
        }
      },
      // 完善订单信息
      editReFundRmarks() {
        var _that = this
        this.modal_loading = true
        util.ajax.get(util.baseUrl + '/xjcu/refund/editReturnText.do', {
          params: {
            orderNo: _that.editOrderNo,
            returnText: _that.refundRmarks
          }
        })
        .then(function(res){
          _that.modal_loading = false
          if(res.data.status == ERR_OK) {
            _that.$Message.success('操作成功！')
            _that.modalRefundMarks = false
            _that.search(_that.filter.pageNo)
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
      },
      checkUploadName(file) {
        if(file.name.split('.')[0] != this.uploadName && this.fileType.fileType == '回单附件'){
          this.$Message.warning('选择的文件名与当前订单不匹配！');
          return false
        } else {
          return true
        }
      },
      editAnnex() {
        var _that = this
        this.modal_loading = true
        util.ajax.get(util.baseUrl + '/xjcu/refund/editReturnAnnex.do', {
          params: {
            orderNo: _that.editOrderNo,
            annex: _that.annex
          }
        })
        .then(function(res){
          _that.modal_loading = false
          if(res.data.status == ERR_OK) {
            _that.$Message.success('操作成功！')
            _that.modalAnnex = false
            _that.search(_that.filter.pageNo)
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
      },
      editRefundScreenshot() {
        var _that = this
        this.modal_loading = true
        util.ajax.get(util.baseUrl + '/xjcu/refund/editRefundScreenshot.do', {
          params: {
            orderNo: _that.editOrderNo,
            refundScreenshot  : _that.refundScreenshot
          }
        })
        .then(function(res){
          _that.modal_loading = false
          if(res.data.status == ERR_OK) {
            _that.$Message.success('操作成功！')
            _that.modalScreenshoot = false
            _that.search(_that.filter.pageNo)
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
      },
      editRemarks() {
        var _that = this
        this.modal_loading = true
        util.ajax.get(util.baseUrl + '/xjcu/refund/editOrderRemarks.do', {
          params: {
            orderNo: _that.editOrderNo,
            remarks: _that.remarks
          }
        })
        .then(function(res){
          _that.modal_loading = false
          if(res.data.status == ERR_OK) {
            _that.$Message.success('操作成功！')
            _that.modalRearks = false
            _that.search(_that.filter.pageNo)
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
      },
      deleteShow() {
        if(!this.checkedDatas.length) {
          this.$Message.warning('请选择需要删除的订单！');
          return
        }
        if(this.checkedDatas.length > 1) {
          this.$Message.warning('一次只能删除一条订单！');
          return
        }
        this.passWord = ''
        this.modalDelete = true
      },
      deleteItem() {
        var _that = this
        if(!this.passWord) {
          this.$Message.warning('请验证当前账户密码！')
          return
        }
        this.modal_loading = true
        util.ajax.get(util.baseUrl + '/xjcu/refund/delete', {
          params: {
            orderNo: _that.checkedDatas[0].orderNo,
            userName: Cookies.get('user'),
            passWord: _that.passWord
          }
        })
        .then(function(res){
          _that.modal_loading = false
          if(res.data.status == ERR_OK) {
            _that.$Message.success('删除成功！')
            _that.modalDelete = false
            _that.search(_that.filter.pageNo)
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      exportOut() {
        let _url = `${util.baseUrl}/xjcu/refund/exportExcel?token=${Cookies.get('token')}${util.parseParam(this.filter)}`
        window.location.href = _url
      },
      addShow() {
        this.modalAdd = true
        this.refundFollow = false
        this.oneRefundChecked = true
        this.twoRefundChecked = false
        this.radio = 'outer'
        this.formItem = {
          customer: Cookies.get('user'), //客服
          mobileNumber: '', //电话号
          area: '乌鲁木齐', // 地州
          businessType: '低消', // 业务类型
          complainTime: this.initTime,  //投诉时间
          orderTime: '', // 订购时间
          refundSource: '沃助手', // 退费来源
          orderProduct: '', // 订购产品
          refundBusinessStatus: '无', // 退订状态
          remarks: '', // 备注
          internalRefundStatus: '无', // 内部退款状态
          interRefundMoney: 0, // 内部退款金额
          oneRefundStatus: '无', // 一次退款状态
          oneRefundMoney: 1, // 一次退款金额
          twoRefundStatus: '无', // 二次退款状态
          netType: '', // 二次退订网别
          // 默认参数
          emailStatus: '待发送',
          refundTipsStatus: '未发送',
          monthTipsStatus: '未发送',
          hieldStatus: '待屏蔽'
        }
      },
      selectComplainTime(time) {
        this.formItem.complainTime = time
      },
      selectOrderTime(time) {
        this.formItem.orderTime = time
      },
      // 选择一次/二次退款
      checkOneRefund(flag) {
        if(flag) {
          this.formItem.oneRefundStatus = '待提交'
          this.oneRefundChecked = true
        }else {
          this.formItem.oneRefundStatus = '无'
          this.oneRefundChecked = false
        }
      },
      checkTwoRefund(flag) {
        if(flag) {
          this.twoRefundChecked = true
          this.formItem.twoRefundStatus = '待提交'
        }else {
          this.formItem.twoRefundStatus = '无'
          this.twoRefundChecked = false
        }
      },
      checkRefund(flag) {
        if(flag) {
          this.formItem.refundBusinessStatus = '待退订'
          this.refundFollow = true
        }else {
          this.formItem.refundBusinessStatus = '无'
          this.refundFollow = false
        }
      },
      changeRefundType(radio) {
        if(radio == 'outer') {
          this.formItem.interRefundMoney = 0
        }else {
          this.oneRefundChecked = false
          this.twoRefundChecked = false
          this.formItem = Object.assign(this.formItem, {
            oneRefundMoney: 0,
            oneRefundStatus: '无',
            twoRefundStatus: '无',
            netType: ''
          })
        }
      },
      checkEmailRefund(flag) {
        if(flag) {
          this.formItem.emailOperator = '待发送'
        }else {
          this.formItem.emailOperator = '无'
        }
      },
      // 文件上传成功回调
      uploadSuccess(response, file, fileList) {
        if(response.status == ERR_OK) {
          this.$Message.success('上传成功')
          if(this.fileType.fileType == '回单文本') {
            this.formItem.returnText = response.data
          } else if (this.fileType.fileType == '回单附件') {
            this.annex = response.data
          } else if (this.fileType.fileType == '退款截图') {
            this.refundScreenshot = response.data
          } else {
            this.changeStatusScreenshoot = response.data
          }
        }else {
          this.$Message.error(response.msg || '上传失败')
        }
      },
      checkRefundType() {
        // 未知原因导致新增第二次提交时oneRefundStatus变为false状态
        if(this.formItem.oneRefundStatus == false) {
          this.formItem.oneRefundStatus = '待提交'
        }
        if(this.radio == 'inner'){
          this.formItem.internalRefundStatus = '待退款'
          this.formItem = Object.assign(this.formItem, {
            oneRefundMoney: 0,
            oneRefundStatus: '无',
            twoRefundStatus: '无',
            netType: ''
          })
          if(this.formItem.interRefundMoney === '') {
            this.$Message.warning('请填写内部退款金额!')
            return false
          }
          return true
        } else {
          this.formItem.internalRefundStatus = '无'
          this.formItem.interRefundMoney = 0
          if(!this.formItem.oneRefundStatus && !this.formItem.twoRefundStatus) {
            this.$Message.warning('请填写外部退款详情!')
            return false
          }
          if(this.formItem.oneRefundStatus == '待提交' && this.formItem.oneRefundMoney === "" || this.formItem.oneRefundMoney === 0) {
            this.$Message.warning('请填写一次退款金额!')
            return false
          } else if (this.formItem.twoRefundStatus == '待提交' && !this.formItem.netType) {
            this.$Message.warning('请选择二次退款网别!')
            return false
          }
          return true
        }
      },
      handleSubmit (name) {
        var _that = this
        if(!this.checkRefundType()) {
          return
        }
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.modal_loading = true
            if(this.formItem.oneRefundStatus == false) {
              this.formItem.oneRefundStatus = '待提交'
            }
            util.ajax.get(util.baseUrl + '/xjcu/refund/add', {
              params: _that.formItem
            })
            .then(function(res){
              _that.modal_loading = false
              if(res.data.status == ERR_OK) {
                _that.$Message.success('添加成功！')
                _that.modalAdd = false
                _that.search(1)
              }else {
                _that.$Message.error(res.data.msg)
              }
            })
            .catch(function(err){
              console.log(err)
            });
          } else {
            this.$Message.error('请填写完整退款信息!');
          }
        })
      },
      edit() {
        var _that = this
        var _url = this.if_add ? '/xjcu/email/add' : '/xjcu/email/edit'
        this.modal_loading = true
        util.ajax.get(util.baseUrl + _url, {
          params: _that.editInfo
        })
        .then(function(res){
          _that.modal_loading = false
          if(res.data.status == ERR_OK) {
            _that.$Message.success('操作成功！')
            _that.modalEdit = false
            _that.search(1)
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      downloadFile(fileName) {
        window.location.href = `${util.baseUrl}/xjcu/refund/downFile.do?fileName=${fileName}`
      }
    },
    components: {QuickFilter},
    created() {
      this.search(1)
      this.getCity()
    }
  }
</script>

<style>
  .parameterConfig .vertical-center-modal {
    display: flex;
    align-items: center;
    justify-content: center;
    .ivu-modal{
      top: 0;
    }
  }
  .parameterConfig .ivu-modal-body{
    overflow: hidden;
  }
  .parameterConfig .ivu-poptip-inner{
    white-space: normal;
    font-size: 14px;
  }
  .parameterConfig .ivu-checkbox-inner{
    border: 1px solid #2196F3;
  }
  .parameterConfig .ivu-table th{
    overflow: visible;
  }
  .parameterConfig .ivu-table .ivu-btn-ghost{
    background-color: #E0E0E0;
  }
  .parameterConfig .page{
    background: #fff;
    position: fixed;
    width: 100%;
    bottom: 0;
    z-index: 999999;
  }
  .parameterConfig .ivu-table{
    color: #000;
  }
  .parameterConfig .ivu-table .ivu-table-cell .ivu-btn{
    min-width: 28px;
    min-height: 24px;
  }
  .modalAdd .ivu-form .ivu-form-item-label, .modalAdd .ivu-radio-wrapper,.modalAdd .ivu-checkbox-wrapper, .modalAdd span{
    font-size: 14px;
  }
  .parameterConfig .ivu-table-cell{
    padding: 0;
  }
  .modalAdd .ivu-input-number-handler-wrap{
    display: none;
  }
  #modalDetail .ivu-modal-content{
    background: #C5E1A5;
  }
  #modalDetail .public{
    background: #fff;
  }
  #modalDetail .public .ivu-row{
    margin-left: 30px;
  }
  #modalDetail .public .ivu-row span{
    color: #4CAF50;
    margin-right: 5px;
  }
  #modalDetail .panelContents {
    padding: 15px;
    border-radius: 20px;
    background: #fff;
    margin-top: 10px;
    padding-top: 0;
  }
  #modalDetail fieldset{
    margin-bottom: 10px;
    padding-top: 10px;
    border: none;
    border-top: 1px dotted #8BC34A;
  }
  #modalDetail fieldset .ivu-row {
    margin-bottom: 10px;
    font-size: 14px;
    margin-left: 30px;
  }
  #modalDetail fieldset .ivu-row span{
    color: #4CAF50;
    margin-right: 5px;
  }
  #modalDetail fieldset legend{
    margin-left: 20px;
    padding: 0 10px;
    color: #000;
    font-size: 14px;
  }
  #modalDetail .ivu-tabs-nav .ivu-tabs-tab{
    background: #E0E0E0;
    border-radius: 8px;
    font-weight: bold;
  }
  #modalDetail .ivu-tabs-nav .ivu-tabs-tab-active{
    color: #fff;
    background: #2196F3;
    border-radius: 8px;
  }
  #modalDetail .ivu-tabs-ink-bar {
    background-color: #2196F3;
  }
</style>
<style lang="less" scoped>
  .ivu-form-item {
    display: inline-block;
    width: 30%;
    margin-bottom: 10px;
  }
  hr{
    margin: 10px 0;
    border-top: 1px solid #2196F3; 
  }
</style>