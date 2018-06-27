<template>
  <div class="model">
    <QuickFilter :taglist="tagList" @gettagIndex='gettagIndex'></QuickFilter>
    <Collapse v-model="collapseName" style="margin: 10px 0">
        <Panel name="1">
          <Row slot="content">
            <Col span="3">
              <Input icon="ios-person-outline" placeholder="电话号码" style="width: 90%"></Input>
            </Col>
            <Col span="7">
              <datePicker type="datetimerange" placement="bottom-start" placeholder="导入时间" style="width: 90%"></datePicker>
            </Col>
          </Row>
          <div style="display:inline-block;float: left;margin-right: 10px">
            <Button type="primary" icon="ios-search">查找</Button>
            <Button type="success" icon="ios-cloud-download">导出</Button>
          </div>
        </Panel>
    </Collapse>
    <Table :columns="columns1" :data="data1"></Table>
    <br>
    <Page :total="100" show-total></Page>
  </div>
</template>

<script>
  import QuickFilter from '@/views/main-components/quickFilter'
  export default {
    data() {
      return {
        tagList: ['筛选条件1', '筛选条件2', '筛选条件3'],
        collapseName: '1',
        columns1: [
          {
            title: 'Name',
            key: 'name'
          },
          {
            title: 'Age',
            key: 'age'
          },
          {
            title: 'Address',
            key: 'address'
          }
        ],
        data1: [
          {
            name: 'John Brown',
            age: 18,
            address: 'New York No. 1 Lake Park',
            date: '2016-10-03'
          },
          {
            name: 'Jim Green',
            age: 24,
            address: 'London No. 1 Lake Park',
            date: '2016-10-01'
          },
          {
            name: 'Joe Black',
            age: 30,
            address: 'Sydney No. 1 Lake Park',
            date: '2016-10-02'
          },
          {
            name: 'Jon Snow',
            age: 26,
            address: 'Ottawa No. 2 Lake Park',
            date: '2016-10-04'
          }
        ]
      }
    },
    methods: {
      gettagIndex(index) {
        console.log(index)
      }
    },
    components: {QuickFilter}
  }
</script>

<style lang="less" scoped>
  
</style>