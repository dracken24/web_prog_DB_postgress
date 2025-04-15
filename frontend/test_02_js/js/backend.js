document.addEventListener("DOMContentLoaded", () => 
{
    const utilisateurs = [
        {username:"Tony", password:"admin123", role:"admin"},
        {username:"Alice", password:"user123", role:"user"}
    ]

    // NOTE: JSON.stringify()
    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));

    const username = localStorage.getItem("username");
    if (!username) 
    {
        window.location.href = "index.html";
    }
    const usernameElement = document.getElementById("username");
    if (usernameElement) {
        usernameElement.textContent = username;
    }
});

function loginUser(e)
{
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // NOTE: JSON.parse()
    const users = JSON.parse(localStorage.getItem("utilisateurs"));

    const user = users.find(i => i.username === username && i.password === password);

    if (!user)
    {
        alert("Nom d'utilisateur ou mot de passe incorrect");
        return;
    }

    if (user.role === "admin")
    {
        window.location.href = "admin.html";
    }
    else if (user.role === "user")
    {
        window.location.href = "user.html";
    }
}
