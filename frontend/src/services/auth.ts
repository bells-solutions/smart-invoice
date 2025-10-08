import api from "./api";
import type { User } from "@/types";

export const authService = {
  async register(data: {
    email: string;
    password: string;
    accountType: "individual" | "company";
    firstName?: string;
    lastName?: string;
    phone?: string;
    town?: string;
    address?: string;
    companyName?: string;
    taxpayerNumber?: string;
    commercialRegister?: string;
    poBox?: string;
  }) {
    const response = await api.post("/auth/register", data);
    // Backend should return all provided optional fields; in case some (like companyName)
    // come back as null while the user supplied them (observed issue), patch them locally
    // const user = response.data?.user || {};
    // if (data.companyName && !user.companyName)
    //   user.companyName = data.companyName;

    // if (data.taxpayerNumber && !user.taxpayerNumber)
    //   user.taxpayerNumber = data.taxpayerNumber;

    // if (data.commercialRegister && !user.commercialRegister)
    //   user.commercialRegister = data.commercialRegister;

    // if (data.poBox && !user.poBox) user.poBox = data.poBox;
    // if (data.town && !user.town) user.town = data.town;
    // if (data.address && !user.address) user.address = data.address;

    // response.data.user = user;

    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  async updateProfile(updateData: {
    accountType?: "individual" | "company";
    firstName?: string;
    lastName?: string;
    phone?: string;
    town?: string;
    address?: string;
    companyName?: string;
    taxpayerNumber?: string;
    commercialRegister?: string;
    poBox?: string;
  }) {
    const response = await api.put("/users/me", updateData);
    return response.data;
  },

  async uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append("profilePicture", file);

    const response = await api.post("/users/me/profile-picture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async deleteProfilePicture() {
    const response = await api.delete("/users/me/profile-picture");
    return response.data;
  },

  setToken(token: string) {
    localStorage.setItem("token", token);
  },

  setUser(user: User) {
    localStorage.setItem("user", JSON.stringify(user));
  },

  getUser(): User | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
