require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT
const accessRoute = require('./routes/access');
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const problemsRoute = require('./routes/problems');
const blogsRoute = require('./routes/blogs');
const {MongoClient} = require('mongodb')
const problemRoute = require('./routes/problem');
const createProblemRoute = require('./routes/createproblem');
const createBlogRoute = require('./routes/createblog');
const testprobRoute = require('./routes/testprob');
const coderunner = require('./routes/runcode');
const submissionsRoute = require('./routes/submissions');
const notesRoute = require('./routes/notes');
const manageblogsRoute = require('./routes/manageblogs');
const getprofileRoute = require('./routes/getprofile');
const saveimgRoute = require('./routes/saveimage');
const uploadimgRoute = require('./routes/upload');
const getimgRoute = require('./routes/getimage');
const getdatesRoute = require('./routes/getdates')

function connectMongoDB() {
  const uri = process.env.MONGODB_URI
  const client = new MongoClient(uri);
  const db = client.db('CodeArena');
  return db;
}
const db = connectMongoDB();

global.db = db;

app.use(cors());
app.use(express.json());

app.use('/access', accessRoute) 
app.use('/submissions', submissionsRoute) 
app.use('/runcode', coderunner)
app.use('/problems', problemsRoute)
app.use('/blogs', blogsRoute)
app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/problem', problemRoute);
app.use('/createproblem', createProblemRoute);
app.use('/createblog', createBlogRoute);
app.use('/testing', testprobRoute);
app.use('/notes', notesRoute)
app.use('/manageblogs', manageblogsRoute)

app.use('/getprofile', getprofileRoute)
app.use('/uploadurl', uploadimgRoute)
app.use('/saveimage', saveimgRoute)
app.use('/getimage', getimgRoute)
app.use('/getdates', getdatesRoute)

const PORT = port || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
