import type {
  LoginBody,
  LoginResponse,
  RegisterBody,
  RegisterResponse,
  ProfileResponse,
  UpdateProfileResponse,
  UpdateProfileBody,
  ReauthenticateBody,
  ChangePasswordBody,
  CreateVerificationTokenBody,
} from "@qw/dto";
import { api, setTokens } from "./api";

const profile = async () => {
  const response = await api.get<ProfileResponse>("/auth/profile");
  return response.data;
};

const updateProfile = async (body: UpdateProfileBody) => {
  const response = await api.put<UpdateProfileResponse>("/auth/profile", body);
  return response.data;
};

const login = async (body: LoginBody) => {
  const response = await api.post<LoginResponse>("/auth/login", body);
  await setTokens(response.data.accessToken, response.data.refreshToken);
  return response.data;
};

const register = async (body: RegisterBody) => {
  const response = await api.post<RegisterResponse>("/auth/register", body);
  await setTokens(response.data.accessToken, response.data.refreshToken);
  return response.data;
};

const reauthenticate = async (body: ReauthenticateBody) => {
  const response = await api.post<LoginResponse>("/auth/reauthenticate", body);
  return response.data;
};

const changePassword = async (body: ChangePasswordBody) => {
  const response = await api.post<LoginResponse>("/auth/change-password", body);
  return response.data;
};

const sendVerificationEmail = async (body: CreateVerificationTokenBody) => {
  const response = await api.post("/auth/create-verification-token", body);
  return response.data;
};

const authService = {
  changePassword,
  login,
  profile,
  reauthenticate,
  register,
  updateProfile,
  sendVerificationEmail,
};

export default authService;
