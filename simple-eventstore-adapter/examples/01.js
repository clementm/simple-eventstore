/**
 * Example 01 :
 * - how to connect to an event store
 * - benefits of the observable interface
 */

const adapter = require('../index')({
  host: 'localhost',
  port: 2564,
  namespace: 'recipes'
});

const Rx = require('rxjs/Rx');

adapter.pull(1);

adapter.push({ type: 'ADD_RECIPE', data: { name: 'Test' } });

adapter
  .observable()
  .filter(x => typeof x === 'object')
  .filter(x => x.type === 'ADD_RECIPE')
  .subscribe(event => console.log(event));
