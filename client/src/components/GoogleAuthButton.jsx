import { GoogleLogin } from "@react-oauth/google";
import { apiFetch } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GoogleAuthButton({ text = "Sign in with Google" }) {
    const navigate = useNavigate();
    const { login } = useAuth(); // Assuming useAuth exposes a login method

    const handleSuccess = async (credentialResponse) => {
        try {
            const { credential } = credentialResponse;
            const res = await apiFetch("/api/auth/google", {
                method: "POST",
                body: JSON.stringify({ token: credential }),
            });

            login(res.token);
            navigate("/dashboard");
        } catch (err) {
            console.error("Google Auth Error:", err);
            // Optional: Display error via toast or parent callback
        }
    };

    const handleError = () => {
        console.error("Google Login Failed");
    };

    return (
        <div className="w-full flex justify-center">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap
                theme="outline"
                size="large"
                width="100%"
                text={text}
                shape="pill"
            />
        </div>
    );
}
