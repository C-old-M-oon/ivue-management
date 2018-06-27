<template>
  <Table border :columns="StatisticColumns" :data="dataArr" :loading="dataLoading" size="small"></Table>
</template>

<script>
  export default {
    props: {
      dataArr: {
        type: Array,
        default: []
      },
      dataLoading: {
        type: Boolean,
        default: false
      }
    },
    data() {
      const setTitleStyle = function(i) {
        return {
          style: {
            width: `${i*25}%`,
            display: 'inline-block',
            borderRight: '1px solid #ccc'
          }
        }
      }
      const getColHead = function (h, title) {
        return [
          h('p', title),
          h('span', setTitleStyle(2), '地州退款'),
          h('span', setTitleStyle(2), '太字节退款'),
          h('span', setTitleStyle(1), '笔数'),
          h('span', setTitleStyle(1), '金额'),
          h('span', setTitleStyle(1), '笔数'),
          h('span', setTitleStyle(1), '金额')
        ]
      }
      const loadData = function(data) {
        if (data == 0) {
          return ''
        } else {
          return data
        }
      }
      const wrapperStyle = {
        style: {
          display: 'flex'
        }
      }
      const spanStyle = {
        style: {
          flex: '1',
          borderRight: '1px solid #e9eaec',
          height: '-webkit-fill-available',
          justifyContent: 'center',
          display: 'flex',
          alignItems: 'center'
        }
      }
      return {
        datas: [],
        StatisticColumns: [
          {
            title: '日期',
            key: 'complainDate',
            align: 'center'
          },{
            title: '地市',
            key: 'area',
            align: 'center'
          },{
            title: '合计',
            align: 'center',
            width: 190,
            renderHeader: (h, column) => {
              return h('div', getColHead(h, '合计'))
            },
            render: (h, params) => {
              return h('div', wrapperStyle, [
                h('span', spanStyle, loadData(params.row.oneTotalCount)),
                h('span', spanStyle, loadData(params.row.oneTotalMoney)),
                h('span', spanStyle, loadData(params.row.internalTotalCount)),
                h('span', spanStyle, loadData(params.row.internalTotalMoney))
              ])
            }
          },{
            title: '低消',
            align: 'center',
            width: 190,
            renderHeader: (h, column) => {
              return h('div', getColHead(h, '低消'))
            },
            render: (h, params) => {
              return h('div', wrapperStyle, [
                h('span', spanStyle, loadData(params.row.oneLowTotalCount)),
                h('span', spanStyle, loadData(params.row.oneLowTotalMoney)),
                h('span', spanStyle, loadData(params.row.internalLowTotalCount)),
                h('span', spanStyle, loadData(params.row.internalLowTotalMoney))
              ])
            }
          },{
            title: '月包',
            align: 'center',
            width: 190,
            renderHeader: (h, column) => {
              return h('div', getColHead(h, '月包'))
            },
            render: (h, params) => {
              return h('div', wrapperStyle, [
                h('span', spanStyle, loadData(params.row.oneMonthTotalCount)),
                h('span', spanStyle, loadData(params.row.oneMonthTotalMoney)),
                h('span', spanStyle, loadData(params.row.internalMonthTotalCount)),
                h('span', spanStyle, loadData(params.row.internalMonthTotalMoney))
              ])
            }
          },{
            title: '内容包',
            align: 'center',
            width: 190,
            renderHeader: (h, column) => {
              return h('div', getColHead(h, '内容包'))
            },
            render: (h, params) => {
              return h('div', wrapperStyle, [
                h('span', spanStyle, loadData(params.row.oneContentTotalCount)),
                h('span', spanStyle, loadData(params.row.oneContentTotalMoney)),
                h('span', spanStyle, loadData(params.row.internalContentTotalCount)),
                h('span', spanStyle, loadData(params.row.internalContentTotalMoney))
              ])
            }
          },{
            title: '其他',
            align: 'center',
            width: 190,
            renderHeader: (h, column) => {
              return h('div', getColHead(h, '其他'))
            },
            render: (h, params) => {
              return h('div', wrapperStyle, [
                h('span', spanStyle, loadData(params.row.oneOtherTotalCount)),
                h('span', spanStyle, loadData(params.row.oneOtherTotalMoney)),
                h('span', spanStyle, loadData(params.row.internalOtherTotalCount)),
                h('span', spanStyle, loadData(params.row.internalOtherTotalMoney))
              ])
            }
          }
        ]
      }
    },
    methods: {
    },
    created() {
    }
  }
</script>