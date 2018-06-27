<template>
  <div class="return">
    <Row>
      <i-col span="3">
        <i-input icon="ios-person-outline" placeholder="录入人" style="width: 90%" v-model="filter.inputPerson"></i-input>
      </i-col>
      <i-col span="3">
        <i-input icon="ios-telephone-outline" placeholder="电话号码" style="width: 90%" v-model="filter.mobileNumber"></i-input>
      </i-col>
      <i-col span="3">
        <i-select style="width: 90%" placeholder="地州" v-model='filter.area'>
          <i-option value="">全部</i-option>
          <i-option v-for="item in cityList" :value="item.key" v-text="item.value" key="item"></i-option>
        </i-select>
      </i-col>
      <i-col span="3">
        <i-input icon="ios-paper" placeholder="订购产品" style="width: 90%" v-model="filter.orderProduct"></i-input>
      </i-col>
      <i-col span="7">
        <date-picker :value="initTime" type="datetimerange" placement="bottom-start" placeholder="导入时间" style="width: 90%" @on-change="changeTime"></date-picker>
      </i-col>
    </Row>
    <br/>
    <Row>
      <i-col span="8" push="16">
        <i-button type="primary" icon="ios-search" @click="search(1)">查找</i-button>
        <i-button type="success" icon="plus" @click="modalAdd = !modalAdd">添加</i-button>
        <Upload :action="uploadUrl" :show-upload-list='false' accept=".csv" :on-success='uploadSuccess' :on-error="uploadError">
            <i-button type="warning" icon="ios-cloud-upload-outline">批量导入</i-button>
        </Upload>
        <!-- <i-button type="warning" icon="ios-upload-outline"></i-button> -->
        <i-button type="error" icon="ios-download-outline" @click='excelOut'>导出</i-button>
        <a :href="modelUrl" title="">模板下载</a>
      </i-col>
    </Row>
    <br>

    <i-table :columns="columns" :data="datas" :loading="dataLoading"></i-table>
    <br>
    <Page :total="totalRecords" :current="filter.pageNo" @on-change='changePage' :page-size="filter.pageSize"></Page>
    <br>

    <Modal v-model="modalAdd" width="600" id="modalAdd">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>添加退款</span>
      </p>
      <div style="text-align:center">
        <Row>
          <i-col span="12">
            <i-input clearable v-model="editInfo.mobileNumber">
              <span slot="prepend">号码</span>
            </i-input>
          </i-col>
          <i-col span="12">
            <i-select style="width: 85%" placeholder="地州" v-model='editInfo.area'>
              <i-option value="">全部</i-option>
              <i-option v-for="item in cityList" :value="item.key" v-text="item.value" key="item"></i-option>
            </i-select>
          </i-col>
        </Row>
        <Row>
          <i-col span="12">
            <i-input clearable v-model="editInfo.refundPrice">
              <span slot="prepend">退款金额</span>
            </i-input>
          </i-col>
          <i-col span="12">
            <i-input clearable v-model="editInfo.unsubscribeState">
              <span slot="prepend">退订状态</span>
            </i-input>
          </i-col>
        </Row>
        <i-col span="12">
          <i-input clearable v-model="editInfo.refundState">
            <span slot="prepend">退款状态</span>
          </i-input>
        </i-col>
        <i-col span="12">
          <i-input clearable v-model="editInfo.orderTime">
            <span slot="prepend">订单时间</span>
          </i-input>
        </i-col>
        <i-col span="12">
          <i-input clearable v-model="editInfo.orderProduct">
            <span slot="prepend">订购产品</span>
          </i-input>
        </i-col>
        <i-col span="12">
          <i-input clearable v-model="editInfo.agentName">
            <span slot="prepend">代理商</span>
          </i-input>
        </i-col>
        <i-col span="12">
          <i-input clearable v-model="editInfo.complainTime">
            <span slot="prepend">投诉时间</span>
          </i-input>
        </i-col>
        <i-col span="12">
          <i-input clearable v-model="editInfo.submitPerson">
            <span slot="prepend">提交人</span>
          </i-input>
        </i-col>
        <i-col span="24">
          <i-input clearable v-model="editInfo.refundCause">
            <span slot="prepend">原因</span>
          </i-input>
        </i-col>
        
      </div>
      <div slot="footer">
        <i-button type="success" size="large" long :loading="modal_loading" @click="add">添加</i-button>
      </div>
    </Modal>
  </div>

</template>

<script>
  import Cookies from 'js-cookie';
  import util from '@/libs/util';
  import {ERR_OK,pageSize} from '@/config/config'
  export default {
    data () {
      return {
        cityList: [],
        initTime: [`${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()} 00:00:00`, `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()} 23:59:59`],
        filter: {
          inputPerson: '',
          mobileNumber: '',
          area: '',
          orderProduct: '',
          startTime: '',
          endTime: '',
          pageNo:1,
          pageSize: pageSize
        },
        modelUrl: util.baseUrl + '/xjcu/refund/template/export',
        totalRecords: 0,
        dataLoading: false,
        modal_loading: false,
        modalAdd: false,
        editInfo: {},
        columns: [
          {
            title: '号码',
            key: 'mobileNumber'
          },
          {
            title: '地州',
            key: 'area'
          },
          {
            title: '退款金额',
            key: 'refundPrice'
          },
          {
            title: '退订状态',
            key: 'unsubscribeState'
          },
          {
            title: '退款状态',
            key: 'refundState'
          },
          {
            title: '订单时间',
            key: 'orderTime'
          },
          {
            title: '订购产品',
            key: 'orderProduct'
          },
          {
            title: '原因',
            key: 'refundCause',
            width: 150,
            render: (h, params) => {
              return h('Tooltip', {
                props: {
                  content: params.row.refundCause,
                  placement: 'top-start'
                },
                style: {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '130px'
                }
              }, params.row.refundCause)
            }
          },
          {
            title: '代理商',
            key: 'agentName'
          },
          {
            title: '投诉时间',
            key: 'complainTime'
          },
          {
            title: '提交人',
            key: 'submitPerson'
          },
          {
            title: '录入时间',
            key: 'inputTime'
          },
          {
            title: '录入人',
            key: 'inputPerson'
          }
        ],
        datas: [],
        editInfo: {
          mobileNumber: '',
          area: '',
          refundPrice: '',
          unsubscribeState: '',
          refundState: '',
          orderTime: '',
          orderProduct: '',
          refundCause: '',
          agentName: '太字节',
          complainTime: '',
          submitPerson: ''
        },
        uploadUrl: util.baseUrl + '/xjcu/refund/importCsv?token='+Cookies.get('token')
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
      changeTime(time) {
        if(time.length) {
          this.filter.startTime = time[0]
          this.filter.endTime = time[1]
        }else {
          this.filter.startTime = ''
          this.filter.endTime = ''
        }
      },
      search(no) {
        var _that = this;
        this.filter.pageNo = no
        this.dataLoading = true
        util.ajax.get(util.baseUrl + '/xjcu/refund/list', {
          params: this.filter
        })
        .then(function(res){
          if(res.data.status == ERR_OK) {
            _that.datas = res.data.data.list
            _that.totalRecords = res.data.data.total
            _that.dataLoading = false
          }else {
            _that.$Message.error(res.data.msg)
            _that.dataLoading = false
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      changePage(no) {
        this.search(no)
      },
      add () {
        var _that = this;
        this.modal_loading = true
        util.ajax.get(util.baseUrl + '/xjcu/refund/add', {
          params: this.editInfo
        })
        .then(function(res){
          if(res.data.status == ERR_OK) {
            _that.$Message.success('添加成功！')
            _that.search(1)
            _that.modal_loading = false
            _that.modalAdd = false
          }else {
            _that.$Message.error(res.data.msg)
            _that.modal_loading = false
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      excelOut() {
        window.location.href = util.baseUrl + '/xjcu/refund/export?token='+Cookies.get('token') + util.parseParam(this.filter)
      },
      uploadSuccess(res, file, fileList) {
        console.log(res)
        if(res.status == ERR_OK) {
          this.$Message.success('上传成功！')
          this.search(1)
        }else {
          this.$Message.error(res.msg)
        }
      },
      uploadError(res, file, fileList) {
        console.log('失败：' + res)
        this.$Message.error('上传失败！')
      }
    },
    mounted: function () {
      this.$nextTick(function () {
        this.getCity()
        this.filter.startTime = this.initTime[0]
        this.filter.endTime = this.initTime[1]
      })
    }
  }
</script>

<style lang='less'>
  .ivu-upload{
    display: inline;
  }
  #modalAdd{
    .ivu-modal-body{
      overflow: hidden;
      .ivu-col-span-12{
        margin-bottom: 10px;
        text-align: left;
        .ivu-input-group{
          width: 85%;
        }
      }
      .ivu-col-span-24{
        margin-bottom: 30px;
      }
    }
  }
</style>