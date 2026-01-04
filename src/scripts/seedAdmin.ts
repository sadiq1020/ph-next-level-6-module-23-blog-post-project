import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";

async function seedAdmin() {
    try {
        const adminData = {
            name: "Admin Super3",
            email: "admin@super3.com",
            role: UserRole.ADMIN,
            password: "admin1234",
            emailVerified: true
        }
        // checking user exist in the DB or not
        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email
            }
        })

        if (existingUser) {
            throw new Error("User already exists");
        }

        const signUpAdmin = await fetch("http://localhost:3000/api/auth/sign-up/email", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(adminData)
        })

        if (signUpAdmin.ok) {
            await prisma.user.update({
                where: {
                    email: adminData.email
                },
                data: {
                    emailVerified: true
                }
            })
        }
        // console.log(signUpAdmin);

    } catch (err) {
        console.error(err);
    }
}

seedAdmin();