import API from "../api/client";

const unwrap = (res) => res?.data?.data ?? res?.data ?? {};

async function register(payload) {
  const res = await API.post("/client/register", payload);
  return unwrap(res);
}

async function login(payload) {
  const res = await API.post("/client/login", {
    login: payload?.login, // always send login
    password: payload?.password,
    remember: payload?.remember ?? true,
  });
  return unwrap(res);
}
async function logout() {
  // ensure cookie goes with the request even if instance doesn't have withCredentials
  const res = await API.post("/client/logout", null, { withCredentials: true });
  return unwrap(res);
}

async function me() {
  const res = await API.get("/client/me");
  return unwrap(res);
}

const authService = {
  register,
  login,
  logout,
  me,
  // compat aliases
  registerCustomer: register,
  loginCustomer: login,
  logoutCustomer: logout,
  getMe: me,
};

export default authService;
