import { Auth } from 'firebase/auth';
import { logout } from "../services/auth";

export function checkEmailVerification(
    auth: Auth,
    callback: (emailVerification: boolean) => void
) {
    if (!auth) return;

    const interval = setInterval(async () => {
        try {
            await auth.currentUser?.reload();
            const refreshedUser = auth.currentUser;

            if (refreshedUser) {
                callback(refreshedUser.emailVerified);
            } else {
                await logout();
                clearInterval(interval);
            }
        } catch (error) {
            clearInterval(interval);
        }
    }, 5000);

    return () => clearInterval(interval);
}
