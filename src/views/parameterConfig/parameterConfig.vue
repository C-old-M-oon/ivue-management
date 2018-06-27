<template>
  <div class="parameterConfig">
    <Tabs @on-click="changePanel">
      <TabPane label="退费邮件" icon="ios-email-outline">
        <Row type="flex" justify="end">
          <Button type="success" icon="plus" @click='addEmailShow'>新增邮件</Button>
        </Row>
        <Table :columns="columnsEmail" :data="dataEmail" :loading="dataLoading"></Table>
        <br>
        <Page :total="EmailTotalRecords" :current="Emailfilter.pageNo" @on-change='changeEmailPage' :page-size="Emailfilter.pageSize"></Page>
      </TabPane>
      <TabPane label="Linux" icon="social-tux">标签三的内容</TabPane>
    </Tabs>

    <Modal v-model="modalEditEmail" width="350">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>{{msgTitle}}</span>
      </p>
      <div style="text-align:center">
        <Input v-model="editEmailInfo.emailName">
          <span slot="prepend">名称:</span>
        </Input>
        <br>
        <Input v-model="editEmailInfo.emailTheme">
          <span slot="prepend">主题:</span>
        </Input>
        <br>
        <Input v-model="editEmailInfo.emailRecipient">
          <span slot="prepend">接收人:</span>
        </Input>
        <br>
        <Input v-model="editEmailInfo.emailReader">
          <span slot="prepend">抄送人:</span>
        </Input>
        <br>
        <Input v-model="editEmailInfo.remarks">
          <span slot="prepend">备注:</span>
        </Input>
      </div>
      <div slot="footer">
        <Button :type="editType" size="large" long :loading="modal_loading" @click="editEmail">{{msgEdit}}</Button>
      </div>
    </Modal>

    <Modal v-model="modalDeleteEmail" width="360">
        <p slot="header" style="color:#f60;text-align:center">
            <Icon type="information-circled"></Icon>
            <span>删除邮件</span>
        </p>
        <div style="text-align:center">
            <p>邮件配置删除后无法恢复</p>
            <p>确定要删除它吗？</p>
        </div>
        <div slot="footer">
            <Button type="error" size="large" long :loading="modal_loading" @click="delEmail">删除</Button>
        </div>
    </Modal>
  </div>
</template>

<script>
  import util from '@/libs/util';
  import Cookies from 'js-cookie';
  import {ERR_OK,pageSize} from '@/config/config'
  import {editMixin} from '@/base/mixin'

  export default {
    mixins: [editMixin],
    data() {
      return {
        dataLoading: false,
        Emailfilter: {
          pageNo: 1,
          pageSize: pageSize
        },
        EmailTotalRecords: 0,
        columnsEmail: [
          {
            title: '名称',
            key: 'emailName'
          },{
            title: '主题',
            key: 'emailTheme'
          },{
            title: '接收人',
            key: 'emailRecipient'
          },{
            title: '抄送人',
            key: 'emailReader'
          },{
            title: '备注',
            key: 'remarks'
          },{
            title: '创建时间',
            key: 'createTime'
          },{
            title: '操作',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    icon: 'edit',
                    size: 'small'
                  },
                  style: {
                    marginRight: '10px'
                  },
                  on: {
                    click: () => {
                      this.if_add = false
                      this.modalEditEmail = true
                      this.editEmailInfo = util.deepCopy(params.row)
                      delete this.editEmailInfo.createTime
                    }
                  }
                }, '编辑'),
                h('Button', {
                  props: {
                    type: 'error',
                    icon: 'android-close',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.modalDeleteEmail = true
                      this.deleteEmailId = params.row.id
                    }
                  }
                }, '删除'),
              ])
            }
          }
        ],
        dataEmail: [],
        modalEditEmail: false,
        modalDeleteEmail: false,
        editEmailInfo: {},
        deleteEmailId: ''
      }
    },
    methods: {
      changePanel(panelName) {
        if(panelName === 0) {
          this.searchEmail(1)
        }
      },
      searchEmail(no) {
        var _that = this;
        this.Emailfilter.pageNo = no
        this.dataLoading = true
        util.ajax.get(util.baseUrl + '/xjcu/email/list', {
          params: this.Emailfilter
        })
        .then(function(res){
          if(res.data.status == ERR_OK) {
            _that.dataEmail = res.data.data.list
            _that.EmailTotalRecords = res.data.data.total
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
      changeEmailPage(no) {
        this.searchEmail(no)
      },
      addEmailShow() {
        this.modalEditEmail = true
        this.if_add = true
        this.editEmailInfo = {
          
        }
      },
      editEmail() {
        var _that = this
        var _url = this.if_add ? '/xjcu/email/add' : '/xjcu/email/edit'
        this.modal_loading = true
        util.ajax.get(util.baseUrl + _url, {
          params: _that.editEmailInfo
        })
        .then(function(res){
          _that.modal_loading = false
          if(res.data.status == ERR_OK) {
            _that.$Message.success('操作成功！')
            _that.modalEditEmail = false
            _that.searchEmail(1)
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      delEmail() {
        var _that = this;
        this.modal_loading = true
        util.ajax.get(util.baseUrl + '/xjcu/email/delete', {
          params: {
            id: _that.deleteEmailId
          }
        })
        .then(function(res){
          _that.modal_loading = false
          if(res.data.status == ERR_OK) {
            _that.$Message.success('操作成功！')
            _that.modalDeleteEmail = false
            _that.searchEmail(1)
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      }
    },
    created() {
      this.searchEmail(1)
    }
  }
</script>

<style lang="less" scoped>
  .ivu-form-item {
    display: inline-block;
    width: 45%;
  }
  .ivu-tabs-bar{
    margin-bottom: 0;
  }
</style>