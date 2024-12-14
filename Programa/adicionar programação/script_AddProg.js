function adicionarProgramacao() {
    const data = document.getElementById("data").value;
    const centroDistribuicao = parseInt(document.getElementById("centroDistribuicao").value, 10);

    if (isNaN(centroDistribuicao)) {
        alert("Código do centro de distribuição deve ser um número válido.");
        return;
    }

    const checkboxes = document.querySelectorAll('#ordensTabela input[type="checkbox"]:checked');
    const ordensSelecionadas = Array.from(checkboxes).map(cb => cb.getAttribute('data-id'));
    const nomeUsuario = localStorage.getItem('nomeUsuario')

    if (ordensSelecionadas.length === 0) {
        alert("Por favor, selecione ao menos uma ordem de serviço.");
        return;
    }
    
    const url = "http://localhost:8081/programacao";

    const options = {
        method: "POST",
        body: JSON.stringify({
            data: data,
            codigoCentroDistribuicao: centroDistribuicao,
            ordens: ordensSelecionadas,
            nomeUsuario:nomeUsuario
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };

    fetch(url, options)
        .then(response => {
            if (!response.ok) throw new Error('Erro ao adicionar a programação');
            return response.json();
        })
        .then(() => {
            alert("Programação adicionada com sucesso!");
            window.location.href = "paginaprincipal.html";
        })
        .catch(error => {
            alert("Erro ao adicionar a programação: " + error.message);
        });
        window.location.href="carregamento.html";
}

document.getElementById('adicionarBtn').onclick = adicionarProgramacao;

document.getElementById('carregarOrdensBtn').addEventListener('click', function () {
    const centroDistribuicao = document.getElementById('centroDistribuicao').value.trim();

    if (centroDistribuicao === "") {
        alert("Por favor, insira um código de Centro de Distribuição.");
        return;
    }

    carregarOrdensCentro(centroDistribuicao);
});

function carregarOrdensCentro(codigoCentroDistribuicao) {
// Primeira requisição para pegar as ordens de serviço
fetch(`https://cenoura.glitch.me/ordensservico?codigoCentroDistribuicao=${codigoCentroDistribuicao}`)
.then(response => response.json())
.then(ordens => {
    const ordensTabelaBody = document.querySelector('#ordensTabela tbody');
    ordensTabelaBody.innerHTML = '';
    
    // Buscar os números de ordens de serviço já existentes no campo numeroOrdemServico
    fetch('http://localhost:8081/programacao')
        .then(response => response.json())
        .then(programacao => {
            // Verificar se a resposta contém a chave 'recordset' e é um array
            if (Array.isArray(programacao.recordset)) {
                // Obter todos os números de ordens já existentes, tratando como string para garantir comparação correta
                const ordensExistentes = programacao.recordset.map(item => String(item.numeroOrdemServico));

                if (ordens.length === 0) {
                    ordensTabelaBody.innerHTML = '<tr><td colspan="8">Nenhuma ordem encontrada para este centro de distribuição.</td></tr>';
                } else {
                    // Filtrar ordens que não estão na lista de ordens existentes
                    const ordensFiltradas = ordens.filter(ordem => 
                        ordem.codigoCentroDistribuicao == codigoCentroDistribuicao &&
                        !ordensExistentes.includes(String(ordem.numeroOrdemServico))  // Convertendo para string para comparar corretamente
                    );

                    // Adicionar as ordens filtradas na tabela
                    ordensFiltradas.forEach(ordem => {
                        const ordemHtml = `
                            <tr>
                                <td><input type="checkbox" data-id="${ordem.numeroOrdemServico}"></td>
                                <td>${ordem.numeroOrdemServico}</td>
                                <td>${ordem.tipoManutencao}</td>
                                <td>${ordem.status}</td>
                                <td>${ordem.codigoVeiculo}</td>
                                <td>${new Date(ordem.criadaEm).toLocaleString()}</td>
                                <td>${ordem.tempoEstimado}</td>
                                <td>${ordem.codigoCentroDistribuicao}</td>
                            </tr>
                        `;
                        ordensTabelaBody.insertAdjacentHTML('beforeend', ordemHtml);
                    });

                    if (ordensFiltradas.length === 0) {
                        ordensTabelaBody.innerHTML = '<tr><td colspan="8">Nenhuma nova ordem encontrada para este centro de distribuição.</td></tr>';
                    }
                }
            } else {
                // Caso a resposta não contenha a chave recordset ou não seja um array
                console.error('Resposta inesperada da API. Esperado um array dentro de "recordset":', programacao);
            }

            document.getElementById('adicionarBtn').style.display = 'block';
        })
        .catch(error => {
            console.error('Erro ao carregar programacao:', error);
        });
})
.catch(error => {
    console.error('Erro ao carregar ordens de serviço:', error);
});
}

document.getElementById('selecionarTodosBtn').addEventListener('click', function() {
const checkboxes = document.querySelectorAll('#ordensTabela input[type="checkbox"]');
const selecionarTodos = Array.from(checkboxes).some(checkbox => !checkbox.checked);

checkboxes.forEach(checkbox => {
checkbox.checked = selecionarTodos;
});
});
