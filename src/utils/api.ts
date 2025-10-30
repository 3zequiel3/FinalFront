import { envs } from "./enviromentVariable";

const API_URL = envs.API_URL;
export async function getUsers() {
    try {
        const response = await fetch(`${API_URL}/usuario`);
        if (!response.ok) {
            throw new Error(`Error fetching users: ${response.statusText}`);
        }
        const users = await response.json();
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

export async function getUser() {
    try {
        const userData = localStorage.getItem("userData");
        if (!userData) {
            throw new Error("No user data in localStorage");
        }
        const parsedUser = JSON.parse(userData);
        const id = parsedUser.id;
        if (!id) {
            throw new Error("User ID is missing");
        }
        const response = await fetch(`${API_URL}/usuario/${id}`);
        if (!response.ok) {
            throw new Error(`Error fetching user: ${response.statusText}`);
        }
        const user = await response.json();
        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

