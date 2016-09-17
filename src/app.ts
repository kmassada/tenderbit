import * as express from 'express';
var app = express();
app.get('/', function (req, res) {
  res.send('Hello World!');
});
var port = 4500;
app.listen(port,() => {
  console.log(`App listening on ${port}`);
})