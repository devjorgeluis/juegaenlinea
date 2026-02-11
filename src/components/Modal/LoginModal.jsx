import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../AppContext";
import { callApi } from "../../utils/Utils";

const LoginModal = ({ isOpen, onClose, onLoginSuccess, isMobile }) => {
    const { contextData, updateSession } = useContext(AppContext);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!username.trim() || !password.trim()) {
            setErrorMsg("Por favor completa ambos campos");
            return;
        }

        setIsLoading(true);
        setErrorMsg("");

        const body = {
            username,
            password,
            site_label: "main",
        };

        callApi(contextData, "POST", "/login/", callbackSubmitLogin, JSON.stringify(body));
    };

    const callbackSubmitLogin = (result) => {
        setIsLoading(false);

        if (result?.status === "success") {
            localStorage.setItem("session", JSON.stringify(result));
            updateSession(result);
            onLoginSuccess?.(result.user?.balance);
            setTimeout(() => {
                onClose();
            }, 800);
        } 
        else if (result?.status === "country") {
            setErrorMsg(result.message || "Restricción por país");
        } 
        else {
            setErrorMsg(
                result?.message || 
                "Nombre de usuario o contraseña incorrectos"
            );
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    // Update input type when showPassword changes
    useEffect(() => {
        const passwordInput = document.getElementById("password-input");
        if (passwordInput) {
            passwordInput.type = showPassword ? "text" : "password";
        }
    }, [showPassword]);

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-backdrop fade show"></div>

            <div
                className="modal fade show"
                id="modalLogin"
                tabIndex="-1"
                aria-labelledby="modalLoginLabel"
                aria-modal="true"
                role="dialog"
                style={{ display: "block" }}
            >
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-body">
                            <div className="modal-auth">
                                <div className="modal-auth-content">
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        onClick={onClose}
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>

                                    <div className="modal-auth-form mt-4">
                                        <ul className="nav nav-tabs" role="tablist">
                                            <li className="nav-item" role="presentation">
                                                <button
                                                    className="btn nav-link active"
                                                    id="login-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#login-tab-pane"
                                                    type="button"
                                                    role="tab"
                                                    aria-selected="true"
                                                >
                                                    <span>Ingresar</span>
                                                </button>
                                            </li>
                                        </ul>

                                        <div className="tab-content" id="tabAuth">
                                            <form
                                                className="tab-pane active show"
                                                id="login-tab-pane"
                                                role="tabpanel"
                                                onSubmit={handleSubmit}
                                            >
                                                {errorMsg && (
                                                    <div className="alert alert-danger mb-3">
                                                        {errorMsg}
                                                    </div>
                                                )}

                                                <div className="modal-auth-form-title mb-2">Usuario</div>
                                                <div className="input-group mb-3">
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        placeholder="Usuario"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        autoFocus
                                                        disabled={isLoading}
                                                    />
                                                </div>

                                                <div className="modal-auth-form-title mb-2">Contraseña</div>
                                                <div className="input-group input-group-password mb-4">
                                                    <input
                                                        id="password-input"
                                                        className="form-control"
                                                        type="password"
                                                        placeholder="Contraseña"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        disabled={isLoading}
                                                    />
                                                    <span
                                                        className="input-toggle-password"
                                                        onClick={togglePasswordVisibility}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                                    </span>
                                                </div>

                                                <div className="d-grid gap-2">
                                                    <button
                                                        className="btn btn-theme"
                                                        type="submit"
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? (
                                                            <>
                                                                <i className="pi pi-spin pi-spinner me-2"></i>
                                                                Ingresando...
                                                            </>
                                                        ) : (
                                                            "Ingresar"
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginModal;