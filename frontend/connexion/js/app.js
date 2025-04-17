document.addEventListener("DOMContentLoaded", () =>
{

    const utilisateurs =[
        {username:"borris",password:"admin123",role:"admin"},
        {username:"natacha",password:"user123",role:"user"}
    ];

    localStorage.setItem("utilisateurs",JSON.stringify(utilisateurs))

    const user = localStorage.getItem("monNom");
    document.getElementById("monnom").textContent = user;

    afficherFilm();
});

function login(e)
{
    e.preventDefault();
    const user = document.getElementById("username").value;
    localStorage.setItem("monNom",user);
    window.location.href = "collection.html";
}


function loginUser(e)
{
    e.preventDefault();

    const monusername = document.getElementById("username").value;
    const monpassword = document.getElementById("password").value;

    const users = JSON.parse(localStorage.getItem("utilisateurs"));

    const user = users.find(i => i.username ===  monusername && i.password === monpassword);

    if (!user)
    {
        // alert("Username ou mot de passe erronee");
        document.getElementById("error").style.display = "block";
        return;
    }

    if(user.role === "admin")
    {
        window.location.href = "admin.html";
    }
    else
    {
        window.location.href = "user.html";
    }
}

function ajouterFilm(e)
{
    e.preventDefault();

    const nom = document.getElementById("titreFilm").value;
    const img = document.getElementById("imageFilm").value;

    const film =  {nom, img};

    let listFilm = JSON.parse(localStorage.getItem("films") || "[]");
    listFilm.push(film);

    localStorage.setItem("films", JSON.stringify(listFilm));

    afficherFilm();
}

function afficherFilm()
{
    const mesFilm = JSON.parse(localStorage.getItem("films"));

    const gallerie = document.getElementById("carteFilm");

    gallerie.innerHTML = "";

    mesFilm.forEach((film, index) => {
        gallerie.innerHTML = gallerie.innerHTML + `
            <div class="col-4">
                <div class="card">
                    <img class="card-img-top" style="height: 300px; object-fit: cover; " src="${film.img}">
                    <div class="card-body">
                        <h5 class="card-title">${film.nom}</h5>
                        <button class="btn btn-danger" onClick="supprimerFilm(${index})"> Supprimer</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function supprimerFilm(index)
{
    let films = JSON.parse(localStorage.getItem("films" || "[]"));

    films.splice(index, 1);

    localStorage.setItem("films", JSON.stringify(films));

    afficherFilm();
}
