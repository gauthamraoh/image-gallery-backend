const express = require('express');
const app = express();
const cors = require('cors');
const indexRouter = require('./routes/index');
app.use(cors())
app.use(express.json());
app.use(express.json({limit: '50mb', strict: false, extended: true}));
app.use(express.urlencoded({extended: true}));

app.use(express.static('uploads')); 
app.use('/uploads', express.static('uploads'));

app.use('/', indexRouter);
app.listen(4000, () => {
    console.log('listening on port 4000');
})