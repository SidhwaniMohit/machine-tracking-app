import './App.css';
import Map from './Map.js';
import SideBar from './SideBar.js';

function App() {
  return (
    <div className="App">
      <div className= "sideBar">
        <SideBar/>
      </div>
      <div className="map">
        {/* <Map /> */}
      </div>
    </div>
  );
}

export default App;
