<template>
  <div id="app">
  <!-- <div> -->
  <div class="box">
    <!-- {{decryptedPayload.toString('hex')}} -->
    <div class="panel panel-primary">
        <div class="panel-heading">General</div>

        <div class="panel-body" style="text-align: left">
          <div v-if="!download" class="loader"></div>
          <div v-else>
            Name: {{sysName.value}} <br>
            IP: {{speed.client.ip}} <br>
            ISP: {{speed.client.isp}} &emsp;
            Location: {{speed.server.location}} {{speed.server.cc}} <br>
            Ping: {{speed.server.ping}} [ Host : {{speed.server.host}} ] <br>
            Uptime : {{timeCheck(uptime.value*10)}}
            <!-- {{uptime}} -->
          </div>
        </div>
      </div>

  </div>
  <div class="col-md-8 boxs">

    <div class="col-md-6 box">

        <div class="panel panel-primary">
          <div class="panel-heading">
            WIFI
            <button v-if="check" @click="pause" class="btn btn-default"> &#10074;&#10074; </button>
            <button v-else @click="resume" class="btn btn-default"> &#9658; </button>
          </div>
          <div class="panel-body box1">
            <div v-if="!wifis" class="loader"></div>
            <div v-eslse class="col-xs-12" v-for="wifi in wifis">
                {{wifi.ssid}} &emsp; [ {{wifi.mac}} ] <br>
                <div class="progress">
                  <div :class="'progress-bar progress-bar-'+wifi.stat" role="progressbar"
                    :aria-valuenow="wifi.per" aria-valuemin="0" aria-valuemax="100"
                    :style="{'width': wifi.per +'%'}">
                        {{wifi.rssi}} dB
                  </div>
                </div>
                Chanel : {{wifi.channel}}
                <hr>
            </div>
          </div>
        </div>

      </div>

      <div class="col-md-6 box">

        <div class="panel panel-primary">
          <div class="panel-heading">Bandwidth</div>
          <div class="panel-body">
             <div v-show="!download" class="loader"></div>
             <div v-show="download" class="col-xs-12">
                  Download : {{download}} Mbps
                  Upload : {{upload}} Mbps
             </div>
             <canvas id="income" width="250" height="200"></canvas>
          </div>
        </div>

      </div>

      <!-- <div class="col-md-6 box">

          <div class="panel panel-primary">
            <div class="panel-heading">VLAN</div>
            <div class="panel-body">
              <div v-if="!interfaces" class="loader"></div>
              <div v-else>
                <p class="p1" v-for="interfaceSe in interfaces">
                     {{interfaceSe.vlan}} &emsp;
                   </p>
              </div>
            </div>
          </div>

      </div> -->

  </div>

    <div class="col-md-4 box">

        <div class="panel panel-primary">
          <div class="panel-heading">All Ports</div>
          <div class="panel-body box1">
            <div v-if="!datas" class="loader"></div>
            <div v-else>
              <p v-for="data in datas">
                  Interface = {{data.interface}} <br>
                  <!-- {{data.mac}} -->
                  MTU = {{data.mtu}} <br>
                  Status = {{data.status}} <br>
                  Last = {{data.lastChange}} <br>
                  In = {{data.inOctets}} <br>
                  Out = {{data.outOctets}} <br>
                 </p>
            </div>
          </div>
        </div>

    </div>
    <br>
    tcp in = {{tcp.in}} <br>
    tcp out = {{tcp.out}} <br>
    udp in = {{udp.in}} <br>
    udp out = {{udp.out}} <br>
    icmp in = {{icmp.in}} <br>
    icmp out = {{icmp.out}} <br>
  </div>
</template>

<script>
var humanizeDuration = require('humanize-duration')
export default {
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
      download: false
    }
  },
  mounted () {
    var vm = this

    vm.getSysName()
    vm.getDetail()

    vm.updateWifi = setInterval(function(){
      vm.getWifi()
    }, 5000)

    vm.getIndex()
    vm.getUptime()
    vm.getUpAndDown()

    // if (vm.datas) {
      vm.getIsDescr()
      vm.getMtu()
      vm.getSpeed()
      vm.getMac()
      vm.getStat()
      vm.getLastChange()
    // }

    vm.update = setInterval(function(){
      vm.getInOctets()
      vm.getOutOctets()

      vm.getTcpIn()
      vm.getTcpOut()
      vm.getUdpIn()
      vm.getUdpOut()
      vm.getIcmpIn()
      vm.getIcmpOut()

      if (!vm.datas) {
        clearInterval(vm.update)
      }
    }, 10000)

  },
  methods: {
    pause () {
      clearInterval(this.updateWifi)
      this.check = false
    },
    resume () {
      this.getWifi()
      this.check = true
    },
    getIndex () {
      var vm = this
      vm.$http.get('/index').then((res) => {
        // console.log(res.data)
        vm.datas = res.data
      })
    },
    getIsDescr () {
      var vm = this
      // console.log('IsDescr');
      vm.$http.get('/isDescr').then((res) => {
        var i = ''
        res.data.map((item) => {
          i = vm.datas.findIndex(items => items.index === item.index)
          vm.datas[i].interface = item.interface
          // console.log(item.interface)
        })
      })
    },
    getMtu () {
      var vm = this
      // console.log('MTU');
      vm.$http.get('/mtu').then((res) => {
        var i = ''
        res.data.map((item) => {
          i = vm.datas.findIndex(items => items.index === item.index)
          vm.datas[i].mtu = item.mtu
        })
      })
    },
    getSpeed () {
      var vm = this
      vm.$http.get('/speed').then((res) => {
        var i = ''
        res.data.map((item) => {
          i = vm.datas.findIndex(items => items.index === item.index)
          vm.datas[i].speed = item.speed
        })
      })
    },
    getMac () {
      var vm = this
      vm.$http.get('/mac').then((res) => {
        var i = ''
        res.data.map((item) => {
          i = vm.datas.findIndex(items => items.index === item.index)
          vm.datas[i].mac = item.mac
        })
      })
    },
    getStat () {
      var vm = this
      vm.$http.get('/stat').then((res) => {
        var i = ''
        res.data.map((item) => {
          i = vm.datas.findIndex(items => items.index === item.index)
          vm.datas[i].status = item.status
        })
      })
    },
    getLastChange () {
      var vm = this
      vm.$http.get('/lastChange').then((res) => {
        var i = ''
        res.data.map((item) => {
          i = vm.datas.findIndex(items => items.index === item.index)
          vm.datas[i].lastChange = item.lastChange
        })
      })
    },
    getInOctets () {
      var vm = this
      vm.$http.get('/inOctets').then((res) => {
        var i = ''
        res.data.map((item) => {
          i = vm.datas.findIndex(items => items.index === item.index)
          vm.datas[i].inOctets = item.inOctets
        })
      })
    },
    getOutOctets () {
      var vm = this
      vm.$http.get('/outOctets').then((res) => {
        var i = ''
        res.data.map((item) => {
          i = vm.datas.findIndex(items => items.index === item.index)
          vm.datas[i].outOctets = item.outOctets
        })
      })
    },
    getDetail () {
      var vm = this
      vm.$http.get('/detail').then((res) => {
        vm.detail = res.data
        // console.log('detail' + vm.detail)
      })
    },
    getUptime () {
      var vm = this
      vm.$http.get('/uptime').then((res) => {
        // console.log(res.data)
        vm.uptime = res.data
      })
    },
    getSysName () {
      var vm = this
      vm.$http.get('/sysname').then((res) => {
        // console.log(vm.uptime)
        vm.sysName = res.data
      })
    },
    getUpAndDown () {
      // console.log('updown')
      var vm = this
      vm.$http.get('/upAndDown').then((res) => {
        vm.speed = res.data
        vm.download = vm.speed.speeds.download
        vm.upload = vm.speed.speeds.upload

        var barData = {
             labels : ['Download','Upload'],
             datasets : [
                 {
                     fillColor : '#00ffab',
                     strokeColor : '#ffffff',
                     data : [vm.upload,vm.download]
                 }
             ]
         }
         var income = document.getElementById('income').getContext('2d')
         new Chart(income).Bar(barData)
      })
    },
    getWifi () {
      var vm = this

      vm.$http.get('/wifi').then((res) => {
        vm.wifis = res.data
        for (var i = 0; i < vm.wifis.length; i++) {
          vm.wifis[i].per = vm.wifis[i].rssi+100
          if (vm.wifis[i].per <= 20) {
            vm.wifis[i].stat = 'danger'
          } else if (vm.wifis[i].per <= 30) {
            vm.wifis[i].stat = 'warning'
          } else if (vm.wifis[i].per <= 50) {
            vm.wifis[i].stat = 'info'
          } else if (vm.wifis[i].per <= 70) {
            vm.wifis[i].stat = 'success'
          }
        }
        // console.log(vm.wifis)
      })

    },
    getTcpIn () {
      var vm = this
      vm.$http.get('/tcpin').then((res) => {
        // console.log(vm.uptime)
        vm.tcp.in = res.data
      })
    },
    getTcpOut () {
      var vm = this
      vm.$http.get('/tcpout').then((res) => {
        // console.log(vm.uptime)
        vm.tcp.out = res.data
      })
    },
    getUdpIn () {
      var vm = this
      vm.$http.get('/udpin').then((res) => {
        // console.log(vm.uptime)
        vm.udp.in = res.data
      })
    },
    getUdpOut () {
      var vm = this
      vm.$http.get('/udpout').then((res) => {
        // console.log(vm.uptime)
        vm.udp.out = res.data
      })
    },
    getIcmpIn () {
      var vm = this
      vm.$http.get('/icmpin').then((res) => {
        // console.log(vm.uptime)
        vm.icmp.in = res.data
      })
    },
    getIcmpOut () {
      var vm = this
      vm.$http.get('/icmpout').then((res) => {
        // console.log(vm.uptime)
        vm.icmp.out = res.data
      })
    },
    timeCheck (uptime) {
      return humanizeDuration(uptime)
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

p.p1 {
  float: left;
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
.box1 {
  /*height: 100%;*/
  height: 450px;
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
	/*background-color: #F5F5F5;*/
  background-color: transparent;
}

.box1::-webkit-scrollbar-thumb
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
