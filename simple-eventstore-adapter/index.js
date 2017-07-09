const addLineEvent = require('@m1ch3lcl/data-line-event');
const { Observable } = require('rxjs/Observable');
const net = require('net');
const { EventEmitter } = require('events').EventEmitter;

const send = (socket, line) =>
  socket.connecting ? socket._commands.push(line) : socket.write(`${line}\n`);
const join = (socket, namespace) => send(socket, `JOIN ${namespace}`);
const pull = socket => index => send(socket, `PULL ${index}`);
const push = socket => fact =>
  send(
    socket,
    `PUSH ${JSON.stringify(
      Object.assign({}, fact, { _timestamp: Date.now() })
    )}`
  );

module.exports = ({ host, port, namespace }) => {
  const socket = net.createConnection({ host, port });

  socket._commands = [];

  const adapter = Object.assign(new EventEmitter(), {
    pull: pull(socket),
    push: push(socket)
  });

  const observable = Observable.create(observer =>
    adapter.on('event', (...args) => observer.next(...args))
  );

  adapter.observable = () => observable;

  socket.on('connect', () => {
    addLineEvent(socket);
    join(socket, namespace);

    socket.write(socket._commands.join('\n'));
    socket.write('\n');

    adapter.emit('ready');
  });

  socket.on('line', buffer => {
    const data = buffer.toString();
    if (/^(\d+) (.*)$/.test(data)) {
      const logId = parseInt(RegExp.$1);
      const event = RegExp.$2;

      try {
        adapter.emit(
          'event',
          Object.assign(JSON.parse(event), { _logId: logId })
        );
      } catch (e) {
        adapter.emit('event', event);
      }
    }
  });

  return adapter;
};
