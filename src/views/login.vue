<style lang="less">
    @import './login.less';
</style>

<template>
    <div class="login" @keydown.enter="handleSubmit">
        <div class="login-con">
            <Card :bordered="false">
                <p slot="title">
                    <Icon type="log-in"></Icon>
                    欢迎登录
                </p>
                <div class="form-con">
                    <Form ref="loginForm" :model="form" :rules="rules">
                        <FormItem prop="userName">
                            <Input v-model="form.userName" placeholder="请输入用户名">
                                <span slot="prepend">
                                    <Icon :size="16" type="person"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem prop="password">
                            <Input type="password" v-model="form.password" placeholder="请输入密码">
                                <span slot="prepend">
                                    <Icon :size="14" type="locked"></Icon>
                                </span>
                            </Input>
                        </FormItem>

                        </FormItem>
<!--                           <FormItem prop="code">
                            <Col span="14">
                              <Input v-model="form.code" placeholder="请输入验证码">
                                <span slot="prepend">
                                  <Icon :size="14" type="code"></Icon>
                                </span>
                              </Input>
                            </Col>
                            <Col span="8" offset="1">
                              <img :src="codeSrc" alt="验证码" @click='getCodeSrc'>
                            </Col>
                            
                        </FormItem> -->
                        <FormItem>
                            <Button @click="handleSubmit" type="primary" long :loading='loginLoading'>登录</Button>
                        </FormItem>
                    </Form>
                </div>
            </Card>
        </div>
    </div>
</template>

<script>
import Cookies from 'js-cookie';
import util from '@/libs/util';
import {ERR_OK,pageSize} from '@/config/config'

export default {
    data () {
        return {
            loginLoading: false,
            codeSrc: '',
            form: {
                userName: '',
                password: ''
                // code: ''
            },
            rules: {
                userName: [
                    { required: true, message: '账号不能为空', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '密码不能为空', trigger: 'blur' }
                ]
                // code: [
                //     { required: true, message: ' ', trigger: 'blur' }
                // ]
            }
        };
    },
    methods: {
        getCodeSrc () {
          this.codeSrc = util.baseUrl + '/system/verify/code?timetemprature='+new Date()
        },
        handleSubmit () {
            let one_hour = 3/24;
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    this.loginLoading = true

                    let jsonData = new URLSearchParams();
                    jsonData.append('username', this.form.userName);
                    jsonData.append('password', this.form.password);
                    // jsonData.append('code', this.form.code);
                    util.ajax.post('/system/logon/login',jsonData).then((response)=>{
                      this.loginLoading = false
                      if(response.data.status == ERR_OK){
                        Cookies.set('user', this.form.userName, {expires: one_hour});
                        Cookies.set('token', response.data.data, {expires: one_hour});
                        this.$store.commit('setAvator', 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3448484253,3685836170&fm=27&gp=0.jpg');
                        if (this.form.userName === 'admin') {
                            Cookies.set('access', 0);
                        } else {
                            Cookies.set('access', 1);
                        }
                        this.$router.push({
                            name: 'home_index'
                        });
                        // window.location.reload();
                      }else {
                        this.$Message.error(response.data.msg);
                        this.getCodeSrc();
                      }
                    })
                }
            });
        }
    },
    created() {
        this.getCodeSrc()
        this.username = ''
        this.password = ''
    }
};
</script>

<style>

</style>
