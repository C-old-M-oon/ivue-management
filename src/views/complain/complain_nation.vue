<template>
  <div class="complain_nation">
    <Collapse v-model="collapseName" style="margin: 10px 0">
      <Panel name="1">
        <div style="display:inline-block;float: left;margin-right: 10px" @click.stop>
          <Button type="success" icon="plus" @click='addShow'>新增退款</Button>
          <Button type="error" icon="close" @click='deleteShow'>删除</Button>
          <Button type="info" icon="ios-cloud-download" @click='exportOut'>导出</Button>
        </div>
        <div slot="content">
          <Select v-model="filter.businessType" :clearable="true" placeholder="业务类型" style="width: 100px;margin-right: 10px">
            <Option value="低消">低消</Option>
            <Option value="月包">月包</Option>
            <Option value="内容包">内容包</Option>
            <Option value="其他">其他</Option>
          </Select>
          <Select v-model="filter.refundSource" :clearable="true" placeholder="来源" style="width: 100px;margin-right: 10px">
            <Option value="短信">短信</Option>
            <Option value="视窗">视窗</Option>
            <Option value="其他">其他</Option>
          </Select>
          <Select v-model="filter.province" :clearable="true" filterable placeholder="省份" style="width: 100px;margin-right: 10px">
            <Option v-for="item in cityList" :value="item.key" v-text="item.value" key="item"></Option>
          </Select>
          <datePicker type="daterange" placement="bottom-start" placeholder="投诉日期" style="width: 200px;margin-right: 10px" @on-change="changeComplainTime"></datePicker>
          <datePicker type="daterange" placement="bottom-start" placeholder="订购日期" style="width: 200px" @on-change="changeOrderTime"></datePicker>
          <Button type="primary" icon="ios-search" @click='search(1)' style="float: right">查找</Button>
        </div>
        <div style="display:inline-block;float: right;margin-right: 10px;width: 150px" @click.stop>
          <Input icon="search" placeholder="电话号码" style="width: 90%" v-model='filter.mobileNumber' @on-click="search(1)" :clearable="true"></Input>
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
    <Modal v-model="modalAdd" width="660" :mask-closable="false" class-name="vertical-center-modal modalAdd">
      <p slot="header" style="color:#f60;text-align:center;">
        <Icon type="information-circled"></Icon>
        <span>{{if_add ? '添加' : '编辑'}}退费</span>
        <span class="customer" style="position: absolute; right: 8%;;color:#333">
          客服: {{formItem.customer}}
        </span>
      </p>
      <div>
        <Form ref="formValidate" :model="formItem" :rules="ruleValidate" :label-width="80" style="width: 100%;margin: 0 auto">
          <FormItem label="号码" prop="mobileNumber">
            <Input v-model="formItem.mobileNumber" placeholder="投诉号码"></Input>
          </FormItem>
          <FormItem label="省份" prop="province">
            <Select v-model="formItem.province" :clearable="true" filterable>
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
              <Option value="短信">短信</Option>
              <Option value="视窗">视窗</Option>
              <Option value="其他">其他</Option>
            </Select>
          </FormItem>
          <FormItem label="产品" prop="orderProduct" style="width: 60%">
            <Input v-model="formItem.orderProduct" placeholder="订购产品"></Input>
          </FormItem>
          <FormItem label="投诉内容" style="width: 90%">
            <Input v-model="formItem.returnText" placeholder="请输入回单文本"></Input>
          </FormItem>
          <FormItem label="备注" style="width: 90%">
            <Input v-model="formItem.remarks" placeholder="请输入备注"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: right">
        <Button type="success" :loading="modal_loading" @click="handleSubmit('formValidate')">提交</Button>
        <Button type="ghost" style="margin-left: 8px" @click="modalAdd = false">取消</Button>
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
  import util from '@/libs/util';
  import Cookies from 'js-cookie';
  import {ERR_OK,pageSize} from '@/config/config'

  export default {
    data() {
      return {
        if_add: true,
        collapseName: '1',
        // 详情框
        initTime: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
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
          province: [
            { required: true, message: ' ', trigger: 'blur' }
          ],
          businessType: [
            { required: true, message: ' ', trigger: 'blur' }
          ],
          refundSource: [
            { required: true, message: ' ', trigger: 'blur' }
          ]
        },
        cityList: [],
        modalDelete: false,
        passWord: '',
        // 添加退款相关
        modalAdd: false,
        modal_loading: false,
        formItem: {},
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
          province: '',
          businessType: '',
          refundSource: ''
        },
        TotalRecords: 0,
        columns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: '号码',
            align: 'center',
            key: 'mobileNumber'
          },
          {
            title: '省份',
            align: 'center',
            key: 'province'
          },
          {
            title: '投诉日期',
            align: 'center',
            key: 'complainDate'
          },{
            title: '订购产品',
            align: 'center',
            width: 100,
            key: 'orderProduct',
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
            title: '业务类型',
            align: 'center',
            key: 'businessType'
          },{
            title: '订单来源',
            align: 'center',
            key: 'refundSource'
          },{
            title: '订购日期',
            align: 'center',
            key: 'orderData'
          },{
            title: '投诉内容',
            align: 'center',
            key: 'returnText'
          },{
            title: '备注',
            align: 'center',
            key: 'remarks'
          },{
            title: '客服',
            align: 'center',
            key: 'customer'
          },{
            title: '操作',
            align: 'center',
            render: (h, params) => {
              return h('Button', {
                props: {
                  icon: 'edit',
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.modalAdd = true
                    this.formItem = params.row
                    this.formItem = {
                      orderNo: params.row.orderNo, // 订单号
                      customer: params.row.customer, //客服
                      mobileNumber: params.row.mobileNumber, //电话号
                      province: params.row.province, // 省份
                      businessType: params.row.businessType, // 业务类型
                      complainTime: params.row.complainDate,  //投诉时间
                      orderTime: params.row.orderData, // 订购时间
                      refundSource: params.row.refundSource, // 退费来源
                      orderProduct: params.row.orderProduct, // 订购产品
                      returnText: params.row.returnText, // 回单文本
                      remarks: params.row.remarks, // 备注
                    }
                    this.if_add = false
                  }
                }
              }, '编辑')
            }
          }
        ],
        datas: [],
        orderNos: '',
        checkedDatas: [],
        pageConfig: [8, 10, 15, 18, 20, 300]
      }
    },
    methods: {
      getCity() {
        var _that = this;
        util.ajax.get(util.baseUrl + '/qgcu/tool/getProvince')
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
        util.ajax.get(util.baseUrl + '/qgcu/refund/list', {
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
      changePageSize(pageSize) {
        this.filter.pageSize = pageSize
        this.search(1)
      },
      changePage(no) {
        this.search(no)
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
        util.ajax.get(util.baseUrl + '/qgcu/refund/delete', {
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
        let _url = `${util.baseUrl}/qgcu/refund/exportExcel?token=${Cookies.get('token')}${util.parseParam(this.filter)}`
        window.location.href = _url
      },
      addShow() {
        this.modalAdd = true
        this.if_add = true
        this.formItem = {
          customer: Cookies.get('user'), //客服
          mobileNumber: '', //电话号
          province: '', // 省份
          businessType: '月包', // 业务类型
          complainTime: this.initTime,  //投诉时间
          orderTime: '', // 订购时间
          refundSource: '视窗', // 退费来源
          orderProduct: '', // 订购产品
          returnText: '用户否认订购行为。', // 回单文本
          remarks: '', // 备注
        }
      },
      selectComplainTime(time) {
        this.formItem.complainTime = time
      },
      selectOrderTime(time) {
        this.formItem.orderTime = time
      },
      handleSubmit (name) {
        var _that = this
        var _url = this.if_add ? '/qgcu/refund/add' : '/qgcu/refund/edit'
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.modal_loading = true
            util.ajax.get(util.baseUrl + _url, {
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
      downloadFile(fileName) {
        window.location.href = `${util.baseUrl}/xjcu/refund/downFile.do?fileName=${fileName}`
      }
    },
    created() {
      this.search(1)
      this.getCity()
    }
  }
</script>
  <style type="text/css">
    .complain_nation .ivu-table-cell{
      padding: 0;
    }
    .complain_nation .page{
      background: #fff;
      position: fixed;
      width: 100%;
      bottom: 0;
      z-index: 999999;
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