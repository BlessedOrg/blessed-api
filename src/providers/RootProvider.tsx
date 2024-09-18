import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { UserContextProvider } from "@/store/UserContext";

export const RootProvider = ({ children }) => {
  return (
    <>
      <UserContextProvider>{children}</UserContextProvider>
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
