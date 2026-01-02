// Example middleware for checking auth
export const checkAuth = () => {
  const token = localStorage.getItem("token");
  return !!token;
};
