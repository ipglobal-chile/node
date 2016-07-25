/////Servidor en express para adquirr del puerto serial el dato de temperatura 
/////proveniente del PIC16f887 y enviarlo por sockets
//// al cliente
////Por Rodolfo Vera

var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
 
var express = require('express');
var app = express();
var  server = require('http').createServer(app);
var  io = require('socket.io').listen(server);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/cliente.html')
  });

var numConexion = 0;

server.listen(3000);

/////////////////////////////////////////////////////////////////////////////////
 //lista de puertos seriales
serialport.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
  });
});

///////////////////////////////////////////////////Leer pUerto
// Escribe el numero de puerto en la línea de comando:
 var  portName = process.argv[2];

//Abrimos el puerto con la función new()
var myPort = new SerialPort(portName, {
   //configuración
   baudRate: 9600,
    databits: 8,
    parity: 'none'
   });

 ///////////////////////////////////////////////////////////////////////////////////////
///Abrimos Puerto Serial
myPort.on("open", function (temperatura) {
  console.log('Puerto Abierto');

  ///////////////////////////////////////////////////////////////////////////////////////
  ///Abrimos conexion por sockets
  io.sockets.on('connection', function(socket){
      numConexion += 1; //número de cliente
      console.log("Conexion: ", + numConexion +" se conectó por el puerto 3000"); 


      myPort.on('data', function(data) {
        
        var temperatura=data;
        console.log(temperatura.toString());  //vemos que llega el dato temperatura

        socket.broadcast.emit("data", temperatura.toString()); //todos menos a mi
      });
    //cliente desconectado:
    socket.on('disconnect', function(){
        console.log('usuario: ' + numConexion + ' Desconectado');
      numConexion -= 1;
    });

  });
});
