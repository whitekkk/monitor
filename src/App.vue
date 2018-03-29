<template>
  <div id="app">
    <div class="col-md-8 box">
      <div class="panel panel-primary">
        <div class="panel-heading">All Ports</div>
        <div class="panel-body box1">
          <div v-if="!datas" class="loader"></div>
          <div v-else style="width: 720px;">
            <div v-for="data in datas" style="float:left; height:100px; width: 60px;">
              <div v-if="data.status === 1">
                <div v-on:mouseover="mouseOver(data.index)">
                  <button @click="setInterface(data.index, data.plug)"  class="green">
                  </button>
                </div>
              </div>
                <div v-else >
                  <div v-on:mouseover="mouseOver(data.index)">
                    <button @click="setInterface(data.index, data.plug)"  class="red">
                    </button>
                  </div>
                </div>
              <p class="inter small"> <br> &nbsp {{shortWords(data.interface, data.index)}} &nbsp </p>
              <p v-if="data.plug === 1" class="inter small">(In plug)</p>
            </div>
          </div>
        </div>
      </div>
  </div>
  <div class="col-md-4 box">
    <div class="panel panel-primary">
      <div class="panel-heading">Port Status</div>
      <div class="panel-body box20 small2">
        <span v-html="showStats"> </span>
        <!-- <p>Interface: {{showStats.interface}}</p><br>
        <p>MTU: {{showStats.mtu}}</p><br>
        <p v-if="showStats.plug === 1">Plug: In plug</p>
        <p v-else>Plug: Not plug</p><br>
        <p v-if="showStats.status === 1">Port: Up</p>
        <p v-else>Port: Down</p><br><br> -->
      </div>
    </div>
</div>
<div class="col-md-4 box">
  <div class="panel panel-primary">
    <div class="panel-heading">Trap</div>
    <div class="panel-body box21" id="data">
      <span v-html="traps"> </span>
       <!-- {{traps}} -->
    </div>
  </div>
</div>
  <div class="col-md-8 box">
    <div class="panel panel-primary">
      <div class="panel-heading">CPU & MEMORY</div>
      <div class="panel-body box11">
        <div style="float:left;" v-if="datacollectioncpu">
            <h3 class="headline mb-0">CPU</h3>
            <line-chart :chart-data="datacollectioncpu"
            :options="options2"
            :height="260"
            ></line-chart>
        </div>
        <div style="float:left;" v-if="datacollectionram">
            <h3 class="headline mb-0">Memory</h3>
            <line-chart :chart-data="datacollectionram"
            :options="options3"
            :height="260"
            ></line-chart>
        </div>
      </div>
    </div>
</div>
  <div class="col-md-12 box">
    <div class="panel panel-primary">
      <div class="panel-heading">Chart</div>
      <div class="panel-body box2">
        <div v-if="!datas" class="loader"></div>
        <div v-else>
          <div style="float:left;" v-if="datacollectionudp">
              <h3 class="headline mb-0">UdpIn / UdpOut</h3>
              <line-chart :chart-data="datacollectionudp"
              :options="options"
              :height="260"
              ></line-chart>
          </div>
          <div style="float:left;" v-if="datacollectiontcp">
              <h3 class="headline mb-0">TcpIn / TcpOut</h3>
              <line-chart :chart-data="datacollectiontcp"
              :options="options"
              :height="260"
              ></line-chart>
          </div>
          <div style="float:left;" v-if="datacollectionicmp">
              <h3 class="headline mb-0">IcmpIn / IcmpOut</h3>
              <line-chart :chart-data="datacollectionicmp"
              :options="options"
              :height="260"
              ></line-chart>
          </div>
        </div>
      </div>
    </div>
</div>
  </div>
</template>

<script>

import LineChart from './lineChart.js'
import swal from 'sweetalert';
export default {
  components: {
    LineChart
  },
  name: 'app',
  data () {
    return {
      detail: '',
      tcp: {
        in: '',
        out: ''
      },
      udp: {
        in: '',
        out: ''
      },
      icmp: {
        in: '',
        out: ''
      },
      tcpIn: [],
      tcpOut: [],
      udpIn: [],
      udpOut: [],
      icmpIn: [],
      icmpOut: [],
      cpu: [],
      ram: [],
      label: [],
      datacollectionudp: null,
      datacollectiontcp: null,
      datacollectionicmp: null,
      datacollectioncpu: null,
      datacollectionram: null,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          point: {
            radius: 1
          }
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Packet'
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Second'
            }
          }]
        }
      },
      options2: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          point: {
            radius: 1
          }
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Percent'
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Second'
            }
          }]
        }
      },
      options3: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          point: {
            radius: 1
          }
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Megabyte'
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Second'
            }
          }]
        }
      },
      traps: '',
      traps2: '',
      showStats: '',
      datas: false,
      uptime: '',
      uptimeWifi: '',
      sysName: '',
      speed: '',
      wifis: false,
      mac: '',
      update: '',
      check: true,
      upload: false,
      download: false,
      hosts: 'http://localhost:3001'
    }
  },
  mounted () {
    var vm = this
    //vm.sett()
    vm.getSysName()
    vm.getDetail()
    vm.getIndex()
    vm.getUptime()
    vm.update = setInterval(function(){
      if (vm.datas) {
        vm.gettraps()
        vm.getCPU()
        vm.getFreeRAM()
        vm.getIsDescr()
        vm.getMtu()
        // vm.getSpeed()
        // vm.getMac()
        vm.getStat()
        vm.getPlug()
        // vm.getLastChange()
        //
        vm.getInOctets()
        vm.getOutOctets()
        vm.getTcpIn()
        vm.getTcpOut()
        vm.getUdpIn()
        vm.getUdpOut()
        vm.getIcmpIn()
        vm.getIcmpOut()
        vm.fillDataudp()
        vm.fillDatatcp()
        vm.fillDataicmp()
        vm.fillDatacpu()
        vm.fillDataram()
      }
      if (!vm.datas) {
        clearInterval(vm.update)
      }
    }, 5000)
  },
  methods: {
    fillDataudp () {
      this.datacollectionudp = {
        labels: this.label,
        datasets: [
          {
            label: 'udpIn',
            backgroundColor: 'rgba(196, 93, 105, 0.3)',
            data: this.udpIn
          }, {
            label: 'udpOut',
            backgroundColor: 'rgba(32, 162, 219, 0.3)',
            data: this.udpOut
          }
        ]
      }
    },
    fillDatatcp () {
      this.datacollectiontcp = {
        labels: this.label,
        datasets: [
          {
            label: 'tcpIn',
            backgroundColor: 'rgba(196, 93, 105, 0.3)',
            data: this.tcpIn
          }, {
            label: 'tcpOut',
            backgroundColor: 'rgba(32, 162, 219, 0.3)',
            data: this.tcpOut
          }
        ]
      }
    },
    fillDataicmp () {
      this.datacollectionicmp = {
        labels: this.label,
        datasets: [
          {
            label: 'icmpIn',
            backgroundColor: 'rgba(196, 93, 105, 0.3)',
            data: this.icmpIn
          }, {
            label: 'icmpOut',
            backgroundColor: 'rgba(32, 162, 219, 0.3)',
            data: this.icmpOut
          }
        ]
      }
    },
    fillDatacpu () {
      this.datacollectioncpu = {
        labels: this.label,
        datasets: [
          {
            label: 'cpu',
            backgroundColor: 'rgba(196, 93, 105, 0.3)',
            data: this.cpu
          }
        ]
      }
    },
    fillDataram () {
      this.datacollectionram = {
        labels: this.label,
        datasets: [
          {
            label: 'Memory',
            backgroundColor: 'rgba(196, 93, 105, 0.3)',
            data: this.ram
          }
        ]
      }
    },
    mouseOver (index) {
      var vm = this
      var temp = {
        interface : '',
        mtu : '',
        plug : '',
        status : ''
      }
      // temp.interface = vm.datas[index - 1].interface
      // temp.mtu = vm.datas[index - 1].mtu
      // temp.plug = vm.datas[index - 1].plug
      // temp.status = vm.datas[index - 1].status
      // this.showStats = temp
      this.showStats = 'Interface: '+ this.datas[index - 1].interface + '<br>MTU: ' + this.datas[index - 1].mtu + '<br>'
      if (this.datas[index - 1].plug === 1) {
        this.showStats += 'Plug: In plug<br>'
      } else {
        this.showStats += 'Plug: Not plug<br>'
      }

      if (this.datas[index - 1].status === 1) {
        this.showStats += 'Port: Up<br>'
      } else {
        this.showStats += 'Port: Down<br>'
      }
      // this.showStats += this.datas[index - 1].lastChange
      this.showStats += '<br>In Octets: ' + this.datas[index - 1].inOctets + ' Mb<br>Out Octets: ' + this.datas[index - 1].outOctets + ' Mb'
    },
    mouseOut () {
      var vm = this
      this.ShowStat.interface = ''
    },
    setInterface (index, plug) {
      var vm = this
      var x
      if (plug === 1) {
        swal({
          title: 'Are you sure?',
          text: 'This port is plugged in.',
          icon: 'warning',
          buttons: true,
          dangerMode: true,
        })
        .then((willDelete) => {
          if (willDelete) {
            swal('success', {
              icon: 'success',
            });
            if (vm.datas[index - 1].status === 1) {
              x = 2
            } else {
              x = 1
            }
            vm.$http.post(vm.hosts + '/setPort', {index: index, upDown: x}).then((res) => {
              console.log(res)
            })
          } else {
            swal('That a good idea!')
          }
        })
      } else {
        if (vm.datas[index - 1].status === 1) {
          x = 2
        } else {
          x = 1
        }
        vm.$http.post(vm.hosts + '/setPort', {index: index, upDown: x}).then((res) => {
          console.log(res)
        })
      }
    },
    pause () {
      clearInterval(this.updateWifi)
      this.check = false
    },
    getIndex () {
      var vm = this
      vm.$http.get(vm.hosts + '/index').then((res) => {
        // console.log(res.data)
        vm.datas = res.data
      })
    },
    getIsDescr () {
      var vm = this
      // console.log('IsDescr');
      vm.$http.get(vm.hosts + '/isDescr').then((res) => {
        var i = ''
        res.data.map((item) => {
          i = vm.datas.find(items => items.index === item.index)
          i.interface = item.interface
        })
      })
    },
    getMtu () {
      var vm = this
      // console.log('MTU');
      vm.$http.get(vm.hosts + '/mtu').then((res) => {
        var i = ''
        res.data.map((item) => {
          i = vm.datas.find(items => items.index === item.index)
          i.mtu = item.mtu
        })
      })
    },
    getPlug () {
      var vm = this
      // console.log('MTU');
      vm.$http.get(vm.hosts + '/plug').then((res) => {
        var i = ''
        res.data.map((item) => {
          i = vm.datas.find(items => items.index === item.index)
          i.plug = item.plug
        })
      })
    },
    getSpeed () {
      var vm = this
      vm.$http.get(vm.hosts + '/speed').then((res) => {
        var i = ''
        res.data.map((item) => {
          i = vm.datas.findIndex(items => items.index === item.index)
          vm.datas[i].speed = item.speed
        })
      })
    },
    getMac () {
      var vm = this
      vm.$http.get(vm.hosts + '/mac').then((res) => {
        var i = ''
        res.data.map((item) => {
          i = vm.datas.findIndex(items => items.index === item.index)
          vm.datas[i].mac = item.mac
        })
      })
    },
    getStat () {
      var vm = this
      vm.$http.get(vm.hosts + '/stat').then((res) => {
        var i = ''
        res.data.map((item) => {
          i = vm.datas.find(items => items.index === item.index)
          i.status = item.status
        })
      })
    },
    getLastChange () {
      var vm = this
      vm.$http.get(vm.hosts + '/lastChange').then((res) => {
        var i = ''
        res.data.map((item) => {
          i = vm.datas.find(items => items.index === item.index)
          var d = new Date(item.lastChange)
          i.lastChange = d.getDate()+'/'+ (d.getMonth()+1) + '/'+ d.getFullYear() + '  ' + d.getHours() + ':'+d.getMinutes()+':'+d.getSeconds()+' '
          // console.log(item.lastChange)
        })
      })
    },
    getInOctets () {
      var vm = this
      vm.$http.get(vm.hosts + '/inOctets').then((res) => {
        var i = ''
        res.data.map((item) => {
          i = vm.datas.find(items => items.index === item.index)
          i.inOctets = item.inOctets
        })
      })
    },
    getOutOctets () {
      var vm = this
      vm.$http.get(vm.hosts + '/outOctets').then((res) => {
        var i = ''
        res.data.map((item) => {
          i = vm.datas.find(items => items.index === item.index)
          i.outOctets = item.outOctets
        })
      })
    },
    getDetail () {
      var vm = this
      vm.$http.get(vm.hosts + '/detail').then((res) => {
        vm.detail = res.data
        // console.log('detail' + vm.detail)
      })
    },
    getUptime () {
      var vm = this
      vm.$http.get(vm.hosts + '/uptime').then((res) => {
        // console.log(res.data)
        vm.uptime = res.data
      })
    },
    getSysName () {
      var vm = this
      vm.$http.get(vm.hosts + '/sysname').then((res) => {
        // console.log(vm.uptime)
        vm.sysName = res.data
      })
    },
    getTcpIn () {
      var vm = this
      vm.$http.get(vm.hosts + '/tcpin').then((res) => {
        // console.log(vm.uptim
        vm.tcpIn.push(res.data)
        vm.tcp.in = res.data
      })
      if (vm.tcpIn.length >= 31) {
        vm.tcpIn = vm.tcpIn.slice(1, vm.tcpIn.length - 1)
      }
    },
    getTcpOut () {
      var vm = this
      vm.$http.get(vm.hosts + '/tcpout').then((res) => {
        // console.log(vm.uptime)
        vm.tcpOut.push(vm.tcp.out)
        vm.tcp.out = res.data
      })
      if (vm.tcpOut.length >= 31) {
        vm.tcpOut = vm.tcpOut.slice(1, vm.tcpOut.length - 1)
      }
    },
    getUdpIn () {
      var vm = this
      vm.$http.get(vm.hosts + '/udpin').then((res) => {
        // console.log(vm.uptime)
        vm.udpIn.push(res.data)
        vm.udp.in = res.data
      })
      var d = new Date();
      if (vm.label.length < 31) {
        vm.label.push(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds())
      } else {
        vm.label = vm.label.slice(1, vm.label.length - 1)
        vm.label.push(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds())
      }

      if (vm.udpIn.length >= 31) {
        vm.udpIn = vm.udpIn.slice(1, vm.udpIn.length - 1)
      }
    },
    getUdpOut () {
      var vm = this
      vm.$http.get(vm.hosts + '/udpout').then((res) => {
        // console.log(vm.uptime)
        vm.udpOut.push(res.data)
        vm.udp.out = res.data
      })
      if (vm.udpOut.length >= 31) {
        vm.udpOut = vm.udpOut.slice(1, vm.udpOut.length - 1)
      }
    },
    getIcmpIn () {
      var vm = this
      vm.$http.get(vm.hosts + '/icmpin').then((res) => {
        // console.log(vm.uptime)
        vm.icmpIn.push(res.data)
        vm.icmp.in = res.data
      })
      if (vm.icmpIn.length >= 31) {
        vm.icmpIn = vm.icmpIn.slice(1, vm.icmpIn.length - 1)
      }
    },
    getIcmpOut () {
      var vm = this
      vm.$http.get(vm.hosts + '/icmpout').then((res) => {
        // console.log(vm.uptime)
        vm.icmpOut.push(res.data)
        vm.icmp.out = res.data
      })
      if (vm.icmpOut.length >= 31) {
        vm.icmpOut = vm.icmpOut.slice(1, vm.icmpOut.length - 1)
      }
    },
    shortWords (word, index) {
      if (word.search('FastEthernet') !== -1) {
        return 'Fa0/' + index
      } else {
        return word
      }
    },
    getCPU () {
      var vm = this
      vm.$http.get(vm.hosts + '/cpu').then((res) => {
        if (vm.cpu.length < 31) {
          vm.cpu.push(parseInt(res.data))
        } else {
          vm.cpu = vm.cpu.slice(1, vm.cpu.length - 1)
          vm.cpu.push(parseInt(res.data))
        }
      })
    },
    getFreeRAM() {
      var vm = this
      vm.$http.get(vm.hosts + '/ram').then((res) => {
        if (vm.ram.length < 31) {
          vm.ram.push(parseInt(res.data))
        } else {
          vm.ram = vm.ram.slice(1, vm.ram.length - 1)
          vm.ram.push(parseInt(res.data))
        }
      })
    },
    gettraps () {
      var vm = this
      vm.$http.get(vm.hosts + '/traps').then((res) => {
        // console.log(JSON.stringify(res.data.pdu.varbinds.filter(vb => vb.type == 4).map(vb => vb.value)))
        let str = res.data.snm.pdu.varbinds.filter(vb => vb.type == 4).map(vb => vb.value)
        if (res.data.snm !== '' && JSON.stringify(res.data.snm) !== vm.traps2) {
          vm.traps += res.data.time + ' ' + str.toString('  ') + '</br>'
        }
        vm.traps2 = JSON.stringify(res.data.snm)
        var elem = document.getElementById('data')
        elem.scrollTop = elem.scrollHeight
      })
    }
  }
}
</script>

<style>

html, body{
    height: 100%;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
  height: 100%;
}

p.inter {
  font-size: 12px;
}

button.red {
  background-color: red;
  height: 50px;
  width: 50px;
}

button.green {
  background-color: rgb(75, 240, 75);
  height: 50px;
  width: 50px;
}

p.p1 {
  float: left;
}

p.small {
    line-height: 0.7;
}


.panel-heading {
     background-color: #32DC71 !important;
     font-size: 2em !important;
}

.panel-body {
     /*background-color: #32DC71 !important;*/
     font-size: 1.5em !important;
}

div.box {
  margin: 0;
  padding: 5px;
  padding-top: 0;
}

div.boxs {
  margin: 0;
  padding: 0;
  /*height: 600px;*/
}

div.small {
  line-height: 80%
}

div.small2 {
  line-height: 120%
}

.box1 {
  /*height: 100%;*/
  height: 210px;
  overflow-y: scroll;
}

.box11 {
  /*height: 100%;*/
  height: 350px;
  overflow-y: scroll;
}

.box2 {
  /*height: 100%;*/
  height: 350px;
  overflow-y: scroll;
}

.box20 {
  /*height: 100%;*/
  height: 210px;
  overflow-y: scroll;
}

.box21 {
  /*height: 100%;*/
  height: 350px;
  overflow-y: scroll;
}


.box1::-webkit-scrollbar-track {
  /*-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);*/
	/*background-color: #F5F5F5;*/
  background-color: transparent;
}

.box1::-webkit-scrollbar
{
	width: 3px;
  height: 3px;
	/*background-color: #F5F5F5;*/
  background-color: transparent;
}

.box1::-webkit-scrollbar-thumb
{
	background-color: #4F9FE5;
}

.box11::-webkit-scrollbar-track {
  /*-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);*/
	/*background-color: #F5F5F5;*/
  background-color: transparent;
}

.box11::-webkit-scrollbar
{
	width: 3px;
  height: 3px;
	/*background-color: #F5F5F5;*/
  background-color: transparent;
}

.box11::-webkit-scrollbar-thumb
{
	background-color: #4F9FE5;

}

.box2::-webkit-scrollbar-track {
  /*-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);*/
	/*background-color: #F5F5F5;*/
  background-color: transparent;
}

.box2::-webkit-scrollbar
{
	width: 3px;
  height: 3px;
	/*background-color: #F5F5F5;*/
  background-color: transparent;
}

.box2::-webkit-scrollbar-thumb
{
	background-color: #4F9FE5;
}

.box20::-webkit-scrollbar-track {
  /*-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);*/
	/*background-color: #F5F5F5;*/
  background-color: transparent;
}

.box20::-webkit-scrollbar
{
	width: 3px;
  height: 3px;
	/*background-color: #F5F5F5;*/
  background-color: transparent;
}

.box20::-webkit-scrollbar-thumb
{
	background-color: #4F9FE5;
}

.box21::-webkit-scrollbar-track {
  /*-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);*/
	/*background-color: #F5F5F5;*/
  background-color: transparent;
}

.box21::-webkit-scrollbar
{
	width: 3px;
  height: 3px;
	/*background-color: #F5F5F5;*/
  background-color: transparent;
}

.box21::-webkit-scrollbar-thumb
{
	background-color: #4F9FE5;
}

.loader {
  border: 5px solid #f3f3f3;
  border-radius: 50%;
  border-top: 5px solid #3498db;
  width: 20px;
  height: 20px;
  -webkit-animation: spin 2s linear infinite;
  animation: spin 2s linear infinite;
}

@-webkit-keyframes spin {
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
