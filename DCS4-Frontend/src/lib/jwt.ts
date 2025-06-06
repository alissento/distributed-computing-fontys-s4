import {Role, User} from "@/types/user.ts";
import {jwtDecode} from "jwt-decode";

type JwtPayload = {
    sub: string;
    email: string;
    name: string;
    role: Role;
    exp: number;
}

export const decodeToken = (token: string): { user: User, exp: number } => {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        return {
            user: {
                id: decoded.sub,
                email: decoded.email,
                name: decoded.name,
                role: decoded.role
            },
            exp: decoded.exp
        };
    } catch (error) {
        console.error("Error decoding token:", error);
        throw new Error("Invalid token");
    }
};