/**
 * https://serialport.io/docs/guide-errors  you can find serialport document from the url
 * npm install -g @serialport/list or @serialport/terminal or  serialport-repl  you can install a software that make you get serialport list
 * @author icezhang
 */
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 9999 });

server.on('open', function open() {
  console.log('connected');
});

server.on('close', function close() {
  console.log('disconnected');
});

server.on('connection', function connection(ws, req) {
  const ip = req.connection.remoteAddress;
  const port = req.connection.remotePort;
  const clientName = ip + port;
  console.log('%s is connected', clientName)
  //ws.send("Welcome " + clientName);
  ws.on('message', function incoming(message) {
    console.log('received: %s from %s', message, clientName);
  });
});


/**
 * there are serveral Parsers that parse the serialport data
 *
 * const Readline = require('@serialport/parser-readline')
 * const parser = new Readline()
 * const ByteLength = require('@serialport/parser-byte-length')
 * const parser = new ByteLength({length: 1025})
 * const Delimiter = require('@serialport/parser-delimiter')
 * let splitBuffer = Buffer.from([0x68, 0x65 ,0x6C,0x6C ,0x6F ,0x77 ,0x6F ,0x72 ,0x6C ,0x64]);
 * @author icezhang
 */

//声明串口数据  分行解析器
var pointArr=new Array();
// const Readline = require('@serialport/parser-readline')
// const parser = new Readline()
const Delimiter = require('@serialport/parser-delimiter')
let splitBuffer = Buffer.from([0x68, 0x65 ,0x6C,0x6C ,0x6F ,0x77 ,0x6F ,0x72 ,0x6C ,0x64]);
const parser=new Delimiter({ delimiter: splitBuffer })
//串口初始化
const SerialPort = require('serialport')

SerialPort.list().then(ports => {
  console.info("=========================================================================================\r\n")
  console.info("hello ,there are serialport lists that we selected from your device\r\n")
  ports.forEach(function(port) {
    console.info("port:%s\r\n",port.path);
  });
  console.info("=========================================================================================\r\n")
});

const port = new SerialPort("com3", { baudRate: 115200,autoOpen:true })
//管道添加解析器
port.pipe(parser)
parser.on('data', function(data) {
  let buffer = new Buffer(data);
  
  // if(buffer.length==1024){
    console.info(buffer.length)
    for(var i=0;i<buffer.length;i++){
      pointArr[i]=buffer.readUInt8(i);
    }
    let jsonData=JSON.stringify({ "data":pointArr});
    server.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(jsonData);
      }
    });
  // }
})
