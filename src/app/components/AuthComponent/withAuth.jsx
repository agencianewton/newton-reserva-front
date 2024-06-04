import { useEffect } from "react";
import { redirect } from "next/navigation";

const withAuth = (WrappedComponent) => {
  const Auth = (props) => {
    useEffect(() => {
      const accessToken = localStorage.getItem("token");

      if (!accessToken) {
        redirect("/login");
      }
    }, []);

    return <WrappedComponent {...props} />;
  };

  return Auth;
};

export default withAuth;
