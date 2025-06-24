import { sign, verify } from "jsonwebtoken";
import { jwtVerify } from "jose";

export const signToken = (payload: { _id: string, email: string }) => {
    const token = sign(payload, process.env.JWT_SECRET as string);
    return token;
};

export const verifyToken = (token: string) => {
    try {
        const decoded = verify(token, process.env.JWT_SECRET as string)
        return decoded;
    } catch (error) {
        console.log(error);
        throw { message: "Invalid token", status: 401 };
    }
};

export const verifyTokenAsync = async <T>(token: string) => {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
        const { payload } = await jwtVerify<T>(token, secret);
        return payload;
    } catch (error) {
        console.log(error);
        throw { message: "Invalid token", status: 401 };
    }
}