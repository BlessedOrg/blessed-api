import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

export const RootProvider = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        theme={"dark"}
        newestOnTop={false}
        closeOnClick
      />
    </>
  );
};
