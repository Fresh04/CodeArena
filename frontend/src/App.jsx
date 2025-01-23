import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from './components/Home.jsx'
import Register from './components/Register.jsx'
import Login from './components/Login.jsx'
import Problem from './components/Problem.jsx'
import Createprob from './components/Createproblem.jsx'
import Createblog from './components/Createblog.jsx'
import ProblemSet from './components/Problemset.jsx'
import CodeEditor from './components/Ide.jsx'
import Submissions from './components/Submissions.jsx'
import Notes from './components/Notes.jsx'
import ManageBlogs from './components/Manageblogs.jsx'
import Profile from './components/Profile.jsx'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path = "/" element={<Home />}></Route>
          <Route path = "/login" element={<Login />}></Route>
          <Route path = "/register" element={<Register />}></Route>
          <Route path = "/problem/:id" element={<Problem />}></Route>
          <Route path = "/createproblem" element={<Createprob />}></Route>
          <Route path = "/createblog" element={<Createblog />}></Route>
          <Route path = "/problemset" element={<ProblemSet />}></Route>
          <Route path = "/ide" element={<CodeEditor />}></Route>
          <Route path = "/submissions" element={<Submissions />}></Route>
          <Route path = "/notes" element={<Notes />}></Route>
          <Route path = "/manageblogs" element={<ManageBlogs />}></Route>
          <Route path = "/profile/:username" element={<Profile />}></Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
