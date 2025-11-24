const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const showRegisterLink = document.getElementById("show-register");
const showLoginLink = document.getElementById("show-login");

showRegisterLink.addEventListener("click", () => {
    loginForm.style.display = "none";
    registerForm.style.display = "block";

    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
});

showLoginLink.addEventListener("click", () => {
    registerForm.style.display = "none";
    loginForm.style.display = "block";
    
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
});

const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");

loginBtn.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    loginError.textContent = "";

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            window.location.href = "/dashboard";
        } 
        else {
            loginError.textContent = data.message || "Login failed";
        }
    }
    catch(error) {
        loginError.textContent = "An error occurred. Please try again.";
        console.error("Failure to login! Error occured: ", error);
    }
});


const registerBtn = document.getElementById("register-btn");
const registerError = document.getElementById("register-error");

registerBtn.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const confirmedPassword = document.getElementById("register-password-confirm").value; 
    
    if(password !== confirmedPassword) {
        registerError.textContent = "Passwords do not match";
        return;
    }

    registerError.textContent = "";
    
    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("token", data.token);
            window.location.href = "pages/dashboard.html";
        }
        else {
            registerError.textContent = data.message || "Registration failed";
        }
    }
    catch(error) {
        registerError.textContent = "An error occurred. Please try again.";
        console.error("Failure to register! Error occured: ", error);
    }
});