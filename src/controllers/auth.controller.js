import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
    sendVerificationEmail,
    generateverificationToken
} from "../utils/email.js";
import { successFullVerification } from "../utils/emailTemplate.js";

export const me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({
            email: email.toLowerCase(),
        });

        if (existingUser) {
            return res.status(400).json({
                message: `User with email ${email} already exists`,
            });
        }

        const doesUsernameExists = await User.findOne({ username });

        if (doesUsernameExists) {
            return res.status(400).json({
                message: `Username ${username} already exists`,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const verificationToken = generateverificationToken(
            email.toLowerCase()
        );

        console.log("\n========== REGISTER ==========");
        console.log("Generated Token:");
        console.log(verificationToken);

        const result = await User.create({
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
            verificationToken,
            isVerified: false,
        });

        try {
            await sendVerificationEmail(
                email.toLowerCase(),
                verificationToken,
                username
            );
        } catch (sendError) {
            console.error("Failed to send verification email after user creation:", sendError);
            await User.findByIdAndDelete(result._id);
            return res.status(500).json({
                message: "Unable to send verification email. Please try again later.",
                detail: sendError?.message || sendError,
            });
        }

        res.status(201).json({
            user: result,
            message: `Verification email has been sent to ${email}`,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message,
        });
    }
};

export const verifyemail = async (req, res) => {
    try {
        const tokenId = decodeURIComponent(req.params.tokenId);

        try {
            jwt.verify(tokenId, process.env.JWT_SECRET);
        } catch (verifyError) {
            console.error("Verification token validation failed:", verifyError);
            return res.status(400).json({
                error: "Verification link is invalid or has expired.",
            });
        }

        console.log("\n===============================");
        console.log("VERIFY ROUTE HIT");
        console.log("===============================");

        console.log("\nToken From URL:");
        console.log(tokenId);

        const user = await User.findOne({
            verificationToken: tokenId,
        });

        if (!user) {
            console.log("\n❌ TOKEN NOT FOUND");

            return res.status(404).json({
                error: "Invalid verification token.",
            });
        }

        user.isVerified = true;
        user.verificationToken = null;

        await user.save();

        console.log("\n✅ VERIFIED SUCCESSFULLY");
        console.log(user.email);

        return res.send(
            successFullVerification(user.username)
        );
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: error.message,
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({
            email: email.toLowerCase(),
        });

        if (!existingUser) {
            return res.status(404).json({
                message: "User doesn't exist",
            });
        }

        if (!existingUser.isVerified) {
            return res.status(400).json({
                message: `Please verify your ${email} first`,
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            {
                email: existingUser.email,
                id: existingUser._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );

        res.status(200).json({
            user: existingUser,
            token,
            message: "Logged in successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const debugVerify = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase(),
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.isVerified = true;
        user.verificationToken = null;

        await user.save();

        res.status(200).json({
            message: `${email} verified successfully`,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};