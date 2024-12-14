// Define o tempo mínimo de exibição da tela de carregamento (em milissegundos)
const minLoadingTime = 4500;
const errorMessage = document.querySelector('.erro');

// Simula a requisição para um servidor
const fetchData = new Promise((resolve, reject) => {
    // Exemplo de requisição simulada
    setTimeout(() => {
        const statusCode = 201; // Simule o código de status que o servidor retorna
        if (statusCode === 201) {
            resolve('Operação concluída com sucesso');
        } else {
            reject('Erro na operação');
        }
    }, 3000); // Simula a resposta após 3 segundos
});

// Marca o momento em que a página carrega
const startTime = Date.now();

fetchData
    .then((message) => {
        // Calcula o tempo que passou desde o início da tela de carregamento
        const elapsedTime = Date.now() - startTime;
        
        // Calcula o tempo restante para garantir que a tela de carregamento apareça por pelo menos 4.5 segundos
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

        // Exibe a mensagem de sucesso e redireciona após o tempo mínimo
        setTimeout(() => {
            console.log(message); // Exibe a mensagem no console (opcional)
            window.location.href = "/pagina principal/paginaprincipal.html"; // Redireciona para a próxima página
        }, remainingTime);
    })
    .catch((error) => {
        // Em caso de erro, mostra a mensagem e redireciona após 4 segundos
        errorMessage.textContent = error;
        errorMessage.style.display = 'block'; // Exibe a mensagem de erro

        // Aguarda 4 segundos e redireciona para a página anterior
        setTimeout(() => {
            window.history.back(); // Redireciona para a página anterior
        }, 4000);
    });