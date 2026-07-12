import Dashboard from "./pages/Dashboard.jsx";
import Audit from "./pages/Audit.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Dashboard />
      <ToastContainer
        position="top-right"
        autoClose={3000}
      />
    </>
  );
}

export default App;

// function App() {
//   return (
//     <>
//       <Audit />
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//       />
//     </>
//   );
// }

// export default App;