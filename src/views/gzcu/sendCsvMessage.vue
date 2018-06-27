<template>
  <div class="sendCsvMessage">
    <input type="file" name="csvfile" @change='csv' id="file"/>
    <Button type="success" icon="email" @click='send' :disabled='canSend' :loading="sending">发送短信</Button>
    <Button type="primary" icon="ios-cloud-upload-outline" @click='checkFile'>选择文件</Button>
    <Tag>{{pathName}}</Tag>
    <Tag color="green">发送成功条数：{{sendSuccess}}</Tag>
    <Tag color="red">发送失败条数：{{sendFail}}</Tag>
    <br/>
    <br/>
    <Table :columns="columns" :data="data"></Table>

    <Modal v-model="modalConfirm" width="360">
        <p slot="header" style="color:#f60;text-align:center">
            <Icon type="information-circled"></Icon>
            <span>确认发送</span>
        </p>
        <div style="text-align:center">
            <p>总共 {{data.length}} 条信息</p>
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
  import {ERR_OK} from '@/config/config'
  export default {
    data() {
      return {
        canSend: true,
        sending: false,
        columns: [
          {
            title: '目标号码',
            key: 'phone'
          },
          {
            title: '短信内容',
            key: 'content'
          }
        ],
        data: [],
        pathName: '',
        sendSuccess: 0,
        sendFail: 0,
        modalConfirm: false
      }
    },
    methods: {
      checkFile() {
        document.getElementById("file").click();
      },
      csv() {
        this.data = []
        this.pathName = ''
        var _that = this
        var file = document.getElementById("file").files[0];  
        var reader = new FileReader();  
        //将文件以文本形式读入页面  
        reader.readAsText(file, 'gbk');
        reader.onload=function(f){  
          var _arr = [...this.result.split('\n')]
          _arr.pop();
          _arr.map(item => {
            _that.data.push({
              phone: item.split(',')[0],
              content: item.split(',')[1]
            })
          })
          _that.pathName = document.getElementById('file').value
          _that.canSend = false
        }
      },
      send() {
        if(!this.data.length) {
          this.$Message.warning('暂无需要发送的短信！')
          return
        }
        this.modalConfirm = true
      },
      comfirmSend() {
        var _that = this;
        this.modalConfirm = false
        this.sending = true;
        this.sendSuccess = 0;
        this.sendFail = 0;
        const len = this.data.length
        this.data.map((item, index) => {
          util.ajax.get(util.baseUrl + '/gzcu/sms/sendCsv', {
            params: {
              phone: item.phone,
              content: item.content
            }
          })
          .then(function(res){
            if(res.data.status == ERR_OK) {
              var _index = _that.data.findIndex(obj => {
                return item.phone === obj.phone
              })
              _that.data.splice(_index, 1)
              _that.sendSuccess++
              if(_that.sendSuccess + _that.sendFail === len) {
                _that.sending = false
              }
            }else {
              _that.$Message.error(res.msg)
              _that.sendFail++
            }
          })
          .catch(function(err){
            _that.sendFail++
            if(_that.sendSuccess + _that.sendFail === len) {
              _that.sending = false
            }
            console.log(err);
          });
        })
      }
    }
  }
</script>

<style lang="less">
  #file{
    display: none;
  }
</style>