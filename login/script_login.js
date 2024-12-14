function entrar() {
    fetch("https://cenoura.glitch.me/usuarios")
        .then(resposta => resposta.json())
        .then(dados => {
            let usuarioValido = false;
            dados.forEach(dado => {
                if (document.querySelector("#usuario").value === dado.login && document.querySelector("#senha").value === dado.senha) {
                    usuarioValido = true;
                    const nomeUsuario = dado.nome;
                    
                    // Armazenar o nome do usuário no localStorage
                    localStorage.setItem("nomeUsuario", nomeUsuario);
                    
                    window.location.href = "paginaprincipal.html";
                }
            });
            if (!usuarioValido) {
                alert("Usuário ou senha inválidos.");
            }
        });
}