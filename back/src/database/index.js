const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/managercar', {
	useUnifiedTopology: true,
	useNewUrlParser: true,
	useCreateIndex: true
}).then((con) => {
	console.log('MongoDB conectado!!');
}).catch((err) => {
  	console.log(err.message);
});

mongoose.Promise = global.Promise;

module.exports = mongoose;