export const getSession = () => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  };
  
  export const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };
  