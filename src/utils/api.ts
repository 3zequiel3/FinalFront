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

export async function getUser(id: string) {
    try {
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
