
import { findUserById } from "../DAO/user.dao.js"
import { verifyToken } from "./helper.js"

export const attachuser = async (req, res, next) => {
    const token = req.cookies.accessToken
    if(!token) return next()

    try {
        const decoded = verifyToken(token)
        const user = await findUserById(decoded)
        if(!user) return next()
        req.user = user
        next()
    } catch (error) {
        console.log(error)
        next()
    }
}