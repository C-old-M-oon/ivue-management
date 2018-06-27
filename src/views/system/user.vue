<template>
  <div class="user">
    <Row type="flex" justify="end">
      <Button type="success" icon="plus" @click='addShow'>新增用户</Button>
    </Row>

    <br>

    <Table border :columns="columns" :data="data" :loading="dataLoading"></Table>
    <br>

    <Modal v-model="modalAdd" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>添加用户</span>
      </p>
      <div style="text-align:center">
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
          <FormItem label="用户名" prop="userName">
            <Input v-model="formValidate.userName" placeholder="请输入用户名"></Input>
          </FormItem>
          <FormItem label="密码" prop="passWord">
            <Input v-model="formValidate.passWord" placeholder="请输入密码" type="password"></Input>
          </FormItem>
          <FormItem label="角色" prop="roleId">
          <Select v-model="formValidate.roleId">
            <Option v-for="item in roleList" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
          </FormItem>
          <FormItem label="电话" prop="phone">
            <Input v-model="formValidate.phone" placeholder="用户联系号码"></Input>
          </FormItem>
          <FormItem label="E-mail" prop="email">
            <Input v-model="formValidate.email" placeholder="用户email"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
      <Button type="success" size="large" long :loading="modal_loading" @click="handleSubmit('formValidate')">确认添加</Button>
      </div>
    </Modal>

    <Modal v-model="modalChangePwd" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>重置用户密码:{{editUser.userName}}</span>
      </p>
      <div style="text-align:center">
        <Form ref="editUser" :model="editUser" :label-width="80">
          <FormItem label="重置密码" prop="newPassword">
            <Input v-model="editUser.newPassword" placeholder="请输入新密码"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
      <Button type="warning" size="large" long :loading="modal_loading" @click="resetPwd">重置</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import util from '@/libs/util'
  import {ERR_OK, pageSize} from '@/config/config'
  export default {
    data () {
      return {
        roleList: [],
        dataLoading: false,
        modal_loading: false,
        modalAdd: false,
        modalChangePwd: false,
        columns: [
          {
            title: '上级管理账户',
            key: 'parentUserName'
          },
          {
            title: '用户名',
            key: 'userName'
          },
          {
            title: '操作',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'primary',
                  icon: 'edit'
                },
                on: {
                  click: () => {
                    this.modalChangePwd = true
                    this.editUser.userName = params.row.userName
                    this.editUser.newPassword = ''
                  }
                }
              }, '修改密码')
            }
          }
        ],
        data: [],
        formValidate: {
          userName: '',
          passWord: '',
          roleId: '',
          phone: '',
          email: ''
        },
        ruleValidate: {
          userName: [
            { required: true, message: '用户名不能为空', trigger: 'blur' }
          ],
          passWord: [
            { required: true, message: '密码不能为空', trigger: 'blur' }
          ],
          email: [
            { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
          ]
        },
        editUser: {
          userName: '',
          newPassword: ''
        }
      }
    },
    methods: {
      getRoles() {
        var _that = this
        util.ajax.get(util.baseUrl + '/system/role/list')
        .then(function(res){
          if(res.data.status == ERR_OK) {
            _that.roleList = res.data.data
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      getDatas() {
        var _that = this
        this.dataLoading = true
        util.ajax.get(util.baseUrl + '/system/user/list')
        .then(function(res){
          _that.dataLoading = false
          if(res.data.status == ERR_OK) {
            _that.data = res.data.data.list
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      addShow() {
        this.modalAdd = true
        this.getRoles()
      },
      handleSubmit (name) {
        var _that = this
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.modal_loading = true
            util.ajax.get(util.baseUrl + '/system/user/add', {
              params: _that.formValidate
            })
            .then(function(res){
              _that.modal_loading = false
              if(res.data.status == ERR_OK) {
                _that.$Message.success('用户添加成功！');
                _that.modalAdd = false
                _that.getDatas()
              }else {
                _that.$Message.error(res.data.msg)
              }
            })
            .catch(function(err){
              console.log(err)
            });
          } else {
            this.$Message.error('信息填写不正确!');
          }
        })
      },
      resetPwd() {
        if(!this.editUser.newPassword) {
          this.$Message.error('请输入新密码！')
          return
        }
        var _that = this
        this.modal_loading = true
        util.ajax.get(util.baseUrl + '/system/user/editUser', {
          params: _that.editUser
        })
        .then(function(res){
          _that.modal_loading = false
          if(res.data.status == ERR_OK) {
            _that.$Message.success('密码重置成功！');
            _that.modalChangePwd = false
            _that.getDatas()
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
      this.getDatas()
    }
  }
</script>

<style lang="less">
  
</style>