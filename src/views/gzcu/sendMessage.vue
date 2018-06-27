<template>
  <div class="sendMessage">
    <Row>
      <i-col span="10">
        <i-input v-model="message.phones" type="textarea" :rows="8" placeholder="请输入需要发送的号码(用,分隔)"></i-input>
      </i-col>
      <i-col span="2" push="1">
        <br>
        <br>
        <i-button type="error" icon="ios-arrow-left" @click="reset(0)" long size="large">重置号码</i-button>
        <br>
        <br>
        <br>
        <i-button type="warning" icon="ios-arrow-right" @click="reset(1)" long size="large">重置内容</i-button>
      </i-col>
      <i-col span="10" push="2">
        <i-input v-model="message.content" type="textarea" :rows="8" placeholder="请输入短信内容"></i-input>
      </i-col>
    </Row>
    <br>
    <Row>
      <i-col span="12" push="6">
        <i-button type="primary" icon="email" @click="send" long size="large" :disabled='disabled' :loading="loading">发送</i-button>
      </i-col>
    </Row>
    <br>

    <Modal v-model="modalConfirm" width="360">
        <p slot="header" style="color:#f60;text-align:center">
            <Icon type="information-circled"></Icon>
            <span>确认发送</span>
        </p>
        <div style="text-align:center">
            <p>总共 {{message.phones.split(',').length}} 个号码</p>
            <p>确认发送吗？</p>
        </div>
        <div slot="footer">
            <Button type="primary" size="large" long @click="comfirmSend">确认发送</Button>
        </div>
    </Modal>
  </div>
</template>

<script>
  import util from '@/libs/util';
  import {ERR_OK,pageSize} from '@/config/config'
  export default {
    computed: {
      disabled() {
        if(this.message.phones.length && this.message.content.length) {
          return false
        }else {
          return true
        }
      }
    },
    data () {
      return {
        modalConfirm: false,
        loading: false,
        message: {
          phones: '',
          content: ''
        }
      }
    },
    methods: {
      send() {
        if(!this.message.phones.length) {
          this.$Message.warning('请输入需要发送的号码!');
          return;
        }
        if(!this.message.content.length) {
          this.$Message.warning('请输入需要发送的内容!');
          return;
        }
        this.modalConfirm = true
      },
      comfirmSend() {
        var _that = this
        this.modalConfirm = false
        this.loading = true
        util.ajax.get(util.baseUrl + '/gzcu/sms/sendTxt', {
          params: this.message
        })
        .then(function(res){
          _that.loading = false
          if(res.data.status == ERR_OK) {
            _that.$Notice.success({
                title: '成功',
                desc: '短信发送成功！'
            });
          }else {
            _that.$Message.error(res.msg)
          }
        })
        .catch(function(err){
          console.log(err);
        });
      },
      reset(status) {
        if(status) {
          this.message.content = '';
        }else {
          this.message.phones = '';
        }
      }
    }
  }
</script>

<style lang="less">
  
</style>