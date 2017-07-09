const net = require('net');
const addLineEvent = require('@m1ch3lcl/data-line-event');
const { log, info } = require('./log');
const { EventEmitter } = require('events');
const { execFile, execFileSync } = require('child_process');

const OCAML_READ = './ocaml/read_ocaml.bin';
const OCAML_WRITE = './ocaml/write_ocaml.bin';

module.exports = (...args) => {
  let listeners = {};

  // Extract command and payload from line input
  // Dispatch command through EventEmitter
  let handle = socket => line =>
    socket.emit(
      line.slice(0, 4).toString().toLowerCase(),
      line.slice(5).toString()
    );

  // Add socket to namespace
  let join = socket => namespace => {
    socket._namespace = namespace;
    info(`socket has joined namespace ${namespace}`);
  };

  // Register socket as an event listener
  let listen = socket => line => {
    if (!listeners[socket._namespace]) listeners[socket._namespace] = [socket];
    else listeners[socket._namespace].push(socket);
  };

  // Pull events starting at specified index
  let pull = socket => index => {
    execFile(OCAML_READ, [socket._namespace, index]).stdout.pipe(socket, {
      end: false
    });

    log(`socket started pulling from log index ${index}`);
  };

  // Append event and dispatch to listeners
  let push = socket => fact => {
    execFileSync(OCAML_WRITE, [socket._namespace, fact]);

    info(`socket pushed immutable fact: ${fact}`);

    listeners[socket._namespace].forEach(_sock => {
      if (socket !== _sock) {
        _sock.write(`${fact}\n`);
      }
    });
  };

  // Remove socket from listeners
  let close = socket => () => {
    info(`socket left namespace ${socket._namespace}`);

    listeners[socket._namespace].splice(
      listeners[socket._namespace].indexOf(socket),
      1
    );
  };

  net
    .createServer(socket => {
      addLineEvent(socket);

      socket.on('line', handle(socket));

      socket.once('join', join(socket));
      socket.once('join', () => {
        socket.once('pull', listen(socket));
        socket.on('pull', pull(socket));
        socket.on('push', push(socket));
        socket.on('close', close(socket));
      });
    })
    .listen(...args);
};
