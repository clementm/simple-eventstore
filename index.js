const inoutdb = require('./server');
const { success } = require('./log');

const PORT = 2564;

inoutdb(PORT, () => success(`store listening on port ${PORT}`));
