import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { JoinCreateRoom } from "./components/JoinCreateRoom"
import { JoinedChat } from "./components/JoinedChat"
import { SignUp } from './Pages/SignUp';
import { Signin } from './Pages/Signin';
import { Home } from './Pages/Home';
import { AppInitializer } from './Pages/Appinitializer';

function App() {

  return (
    <><AppInitializer />
    <BrowserRouter>
    <Routes>

      <Route path='/' element={<Home/>}></Route>
      <Route path='/Signup' element={<SignUp/>}></Route>
      <Route path='/Signin' element={<Signin/>}></Route>
      <Route path='/dashboard' element={<JoinCreateRoom/>}></Route>
      <Route path='/joined' element={<JoinedChat/>}></Route>
    </Routes>
    </BrowserRouter>
    </>
    
  )
}

export default App
