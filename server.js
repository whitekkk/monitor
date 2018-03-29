var express = require('express')
var app = express()

var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

var PORT = 162;
var HOST = '10.4.15.113';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');


var traps = ''
var dat = ''
server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
})

server.on('message', function (message, remote) {
  var d = new Date();
  dat = d.getDate()+'/'+ (d.getMonth()+1) + '/'+ d.getFullYear() + '  ' + d.getHours() + ':'+d.getMinutes()+':'+d.getSeconds()+' '
  traps = message
  // if(message.indexOf('Interface') != -1){
  //
  // }
     //console.log(message.indexOf('Interface'));
    //  console.log(remote.address + ':' + remote.port +' - ' + message);
})

server.bind(PORT, HOST)


app.use(jsonParser)

app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static('dist'))
  var network = require('network')
  var speedTest = require('speedtest-net')
  var snmp = require('snmp-native')
  var moment = require('moment')
  var host = ''
  var valx = 0


  getGateway()
  // getVal()
  var community = 'public'
  const scanner = require('node-wifi-scanner')

  function timestamp(time){
      return (time/360000 |0)
  }
  function getGateway(){
    network.get_gateway_ip(function(err, ip) {
      // host = (err || ip)
      host = "10.4.15.13"
      // console.log(ip)
    })
  }
  app.get('/detail', function (req, res, next) {
    var session = new snmp.Session({ host: host, community: community })
    var oid = [1, 3, 6, 1, 2, 1, 1, 1, 0]
    session.get({ oid: oid }, function (err, varbinds) {
      if (err) {
        // console.log(err)
        console.log('Deatail Fail!')
      } else {
        this.vb = varbinds[0]
        res.send(this.vb.value)
        // console.log('The system description is "' + this.vb.value + '"')
      }
      session.close()
    })
  })

  app.get('/isDescr', function (req, res, next) {
    var value = []
    var session = new snmp.Session({ host: host, community: community })
    session.getSubtree({ oid: '.1.3.6.1.2.1.2.2.1.2' }, function (error, varbinds) {
      if (error) {
        console.log('IsDescr Fail :(')
      } else {
        varbinds.forEach(function (vb) {
          // var ss = vb.value
          value.push({'index':vb.oid[10],'interface':vb.value})
          // console.log(value)
        })
        res.send(value)
      }
      session.close();
    })
  })

  app.get('/cpu', function (req, res, next) {
    var session = new snmp.Session({ host: host, community: community })
    var oid = '.1.3.6.1.4.1.9.2.1.58.0'
    session.get({ oid: oid }, function (err, varbinds) {
      if (err) {
        // console.log(err)
        console.log('CPU Fail!')
      } else {
        this.vb = varbinds[0]
        res.send(this.vb.value.toString())
      }
    })
  })

  app.get('/ram', function (req, res, next) {
    var session = new snmp.Session({ host: host, community: community })
    var oid = '.1.3.6.1.4.1.9.2.1.8.0'
    session.get({ oid: oid }, function (err, varbinds) {
      if (err) {
        // console.log(err)
        console.log('RAM Fail!')
      } else {
        this.vb = varbinds[0]
        res.send((this.vb.value / 1048576).toString())
        // console.log(this.vb.value)
        // console.log('The system description is "' + this.vb.value + '"')
      }
    })
  })

  app.get('/mtu', function (req, res, next) {
    var value = []
    var session = new snmp.Session({ host: host, community: community })
    session.getSubtree({ oid: '.1.3.6.1.2.1.2.2.1.4' }, function (error, varbinds) {
      if (error) {
        console.log('MTU Fail :(')
      } else {
        varbinds.forEach(function (vb) {
          // var ss = vb.value
          value.push({'index':vb.oid[10],'mtu':vb.value})
          // console.log(value)
        })
        res.send(value)
      }
      session.close();
    })
  })

  app.get('/speed', function (req, res, next) {
    var value = []
    var session = new snmp.Session({ host: host, community: community })
    session.getSubtree({ oid: '.1.3.6.1.2.1.2.2.1.5' }, function (error, varbinds) {
      if (error) {
        console.log('Speed Fail :(')
      } else {
        varbinds.forEach(function (vb) {
          // var ss = vb.value
          value.push({'index':vb.oid[10],'speed':vb.value})
          // console.log(value)
        })
        res.send(value)
      }
      session.close();
    })
  })

  app.get('/mac', function (req, res, next) {
    var value = []
    var session = new snmp.Session({ host: host, community: community })
    session.getSubtree({ oid: '.1.3.6.1.2.1.2.2.1.6' }, function (error, varbinds) {
      if (error) {
        console.log('Mac Fail :(')
      } else {
        varbinds.forEach(function (vb) {
          // var ss = vb.value
          // console.log(varbinds)
          value.push({'index':vb.oid[10],'mac':vb.value.toString()})
          // console.log(value)
        })
        res.send(value)
      }
      session.close();
    })
  })

  app.get('/traps', function (req, res, next) {
    // var session = new snmp.Session({ host: host, community: community })
    res.send({time: dat, snm: snmp.parse(traps)})
  })

  app.get('/stat', function (req, res, next) {
    var value = []
    var session = new snmp.Session({ host: host, community: community })
    session.getSubtree({ oid: '.1.3.6.1.2.1.2.2.1.7' }, function (error, varbinds) {
      if (error) {
        console.log('Status Fail :(')
      } else {
        varbinds.forEach(function (vb) {
          // var ss = vb.value
          value.push({'index':vb.oid[10],'status':vb.value})
          // console.log(value)
        })
        res.send(value)
      }
      session.close();
    })
  })

  app.get('/plug', function (req, res, next) {
    var value = []
    var session = new snmp.Session({ host: host, community: community })
    session.getSubtree({ oid: '.1.3.6.1.2.1.2.2.1.8' }, function (error, varbinds) {
      if (error) {
        console.log('Status Fail :(')
      } else {
        varbinds.forEach(function (vb) {
          // var ss = vb.value
          value.push({'index':vb.oid[10],'plug':vb.value})
          // console.log(value)
        })
        res.send(value)
      }
      session.close();
    })
  })

  // app.get('/setPort', function (req, res, next) {
  //   var value = []
  //   var session = new snmp.Session({ host: host, community: community })
  //   session.set({ oid: '.1.3.6.1.2.1.2.2.1.7.12', value: 2, type: 2 }, function (error, varbind) {
  //     if (error) {
  //         console.log(error);
  //     } else {
  //         console.log('The set is done.');
  //     }
  // });
  // })

  // app.post('/setPort', function (req, res) {
  //   console.log(req.body)
  // })

  app.post('/setPort', function (req, res) {
    console.log(req.body.index)
    console.log(req.body.upDown)
      var value = []
      var id = '.1.3.6.1.2.1.2.2.1.7.' + req.body.index
      var session = new snmp.Session({ host: host, community: community })
      session.set({ oid: id, value: req.body.upDown, type: 2 }, function (error, varbind) {
        if (error) {
          res.send(error)
        } else {
          res.send('Done')
            console.log('The set is done.');
        }
        session.close();
    });
  })


  app.get('/lastChange', function (req, res, next) {
    var value = []
    var session = new snmp.Session({ host: host, community: community })
    session.getSubtree({ oid: '.1.3.6.1.2.1.2.2.1.9' }, function (error, varbinds) {
      if (error) {
        console.log('LastChange Fail :(')
      } else {
        varbinds.forEach(function (vb) {
          // var ss = vb.value
          value.push({'index':vb.oid[10],'lastChange':vb.value})
          // console.log(value)
        })
        res.send(value)
      }
      session.close();
    })
  })

  app.get('/inOctets', function (req, res, next) {
    var value = []
    var session = new snmp.Session({ host: host, community: community })
    session.getSubtree({ oid: '.1.3.6.1.2.1.2.2.1.10' }, function (error, varbinds) {
      if (error) {
        console.log('InOctets Fail :(')
      } else {
        varbinds.forEach(function (vb) {
          // var ss = vb.value
          value.push({'index':vb.oid[10],'inOctets':vb.value / 1048576})
          // console.log(value)
        })
        res.send(value)
      }
      session.close();
    })
  })

  app.get('/outOctets', function (req, res, next) {
    var value = []
    var session = new snmp.Session({ host: host, community: community })
    session.getSubtree({ oid: '.1.3.6.1.2.1.2.2.1.16' }, function (error, varbinds) {
      if (error) {
        console.log('OutOctets Fail :(')
      } else {
        varbinds.forEach(function (vb) {
          // var ss = vb.value
          value.push({'index':vb.oid[10],'outOctets':vb.value / 1048576})
          // console.log(value)
        })
        res.send(value)
      }
      session.close();
    })
  })

  app.get('/index', function (req, res, next) {
    var value = []
    var want = [2,4,5,6,8,9,10,16]
    var index = -1
    var session = new snmp.Session({ host: host, community: community })
    session.getSubtree({ oid: '.1.3.6.1.2.1.2.2.1.1' }, function (error, varbinds) {
      if (error) {
        console.log('Index Fail :(')
      } else {
        varbinds.forEach(function (vb) {
          // var ss = vb.value
          value.push({'index':vb.value, 'interface': 'waiting', 'mtu': 'waiting', 'status': 'waiting', 'plug': 'waiting', 'lastChange': 'waiting', 'inOctets': 'waiting', 'outOctets': 'waiting'})
        })
        // console.log(value)
        res.send(value)
      }
      session.close();
    })
  })

  app.get('/uptime', function (req, res, next) {
    var session = new snmp.Session({ host: host, community: community })
    session.get({ oid: '.1.3.6.1.2.1.1.3.0' }, function (err, varbinds) {
      if (err) {
        // console.log(err)
      } else {
        this.vb = varbinds[0]
        this.v = timestamp(this.vb.value)
        // console.log(this.v)
        res.send(this.vb)
      }
      session.close()
    })
  })
  app.get('/sysname', function (req, res, next) {
    var session = new snmp.Session({ host: host, community: community })
    session.get({ oid: '.1.3.6.1.2.1.1.5.0' }, function (err, varbinds) {
      if (err) {
        console.log(err)
      } else {
        this.vb = varbinds[0]
        this.v = timestamp(this.vb.value)
        // console.log(this.v)
        res.send(this.vb)
      }
      session.close()
    })
  })
  app.get('/upAndDown', function (req, res, next) {
    var test = speedTest({maxTime: 8000})
    test.on('data', function (data) {
      // console.log(data)
      res.send(data)
    })
    test.on('error', function (err) {
      // console.error(err)
    })
  })
  app.get('/wifi', function (req, res, next) {
    scanner.scan((err, networks) => {
      if (err) {
        // console.error(err)
        return
      }
      // console.log(networks)
      res.send(networks)
    })
  })
  app.get('/tcpin', function (req, res, next) {
    var session = new snmp.Session({ host: host, community: community })
    session.get({ oid: '.1.3.6.1.2.1.6.10.0' }, function (err, varbinds) {
      if (err) {
        console.log(err)
      } else {
        var tcpin = varbinds[0].value
        res.send(tcpin.toString())
      }
      session.close()
    })
  })
  app.get('/tcpout', function (req, res, next) {
    var session = new snmp.Session({ host: host, community: community })
    session.get({ oid: '.1.3.6.1.2.1.6.11.0' }, function (err, varbinds) {
      if (err) {
        console.log(err)
      } else {
        var tcpout = varbinds[0].value
        res.send(tcpout.toString())
      }
      session.close()
    })
  })
  app.get('/udpin', function (req, res, next) {
    var session = new snmp.Session({ host: host, community: community })
    session.get({ oid: '.1.3.6.1.2.1.7.1.0' }, function (err, varbinds) {
      if (err) {
        console.log(err)
      } else {
        var udpin = varbinds[0].value
        res.send(udpin.toString())
      }
      session.close()
    })
  })
  app.get('/udpout', function (req, res, next) {
    var session = new snmp.Session({ host: host, community: community })
    session.get({ oid: '.1.3.6.1.2.1.7.4.0' }, function (err, varbinds) {
      if (err) {
        console.log(err)
      } else {
        var udpout = varbinds[0].value
        res.send(udpout.toString())
      }
      session.close()
    })
  })
  app.get('/icmpin', function (req, res, next) {
    var session = new snmp.Session({ host: host, community: community })
    session.get({ oid: '.1.3.6.1.2.1.5.1.0' }, function (err, varbinds) {
      if (err) {
        console.log(err)
      } else {
        var icmpin = varbinds[0].value
        res.send(icmpin.toString())
      }
      session.close()
    })
  })
  app.get('/icmpout', function (req, res, next) {
    var session = new snmp.Session({ host: host, community: community })
    session.get({ oid: '.1.3.6.1.2.1.5.14.0' }, function (err, varbinds) {
      if (err) {
        console.log(err)
      } else {
        var icmpout = varbinds[0].value
        res.send(icmpout.toString())
      }
      session.close()
    })
  })

app.listen(3001, function () {
  console.log('Example app listening on port 3001!')
})
