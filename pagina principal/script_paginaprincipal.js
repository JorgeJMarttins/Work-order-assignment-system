let ordensServico = [], nomeUsuario;

        // Função para carregar e exibir as programações
        function tabelaPrincipal() {
            const areaTabela = document.getElementById("areaDaTabela");
            areaTabela.innerHTML = "";
            let table = document.createElement("table");
            table.id = "tabelaInicial";
            table.innerHTML = `<tr>
                <th>Data Criação</th><th>Centro de Distribuição</th><th>Nome do Usuário</th>
            </tr>`;

            fetch("http://localhost:8081/programacao")
                .then(res => res.json())
                .then(dados => {
                    const programacoes = dados.recordsets[0];
                    renderTabela(programacoes); // Corrigido para passar os dados
                })
                .catch(console.error);
        }

        const centrosDistribuicao = {
            1: "Ribeirão Preto",
            2: "Guarulhos",
            3: "Campinas"
        };

        function renderTabela(filteredData) {
    const areaTabela = document.getElementById("areaDaTabela");
    areaTabela.innerHTML = ""; // Limpa a área da tabela
    let table = document.createElement("table");
    table.id = "tabelaInicial";
    table.innerHTML = `<tr><th>Data Criação</th><th>Centro de Distribuição</th><th>Nome do Usuário</th></tr>`;

    // Armazena as datas já exibidas para evitar duplicação
    const exibidos = new Set();

    // Filtra as programações para exibir apenas uma por data única
    filteredData.forEach(prog => {
        const dataFormatada = formatarData(prog.Data); // Formata a data para comparar

        if (!exibidos.has(dataFormatada)) {
            exibidos.add(dataFormatada); // Marca a data como exibida

            const cidade = centrosDistribuicao[prog.codigoCentroDistribuicao]; // Obtem o nome do centro
            table.innerHTML += `<tr>
                <td>${dataFormatada}</td>
                <td id="Ct" onclick="window.location.href='paginaFinal.html?codigoCentroDistribuicao=${prog.codigoCentroDistribuicao}'">${cidade}</td>
                <td>${prog.nomeUsuario}</td>  
            </tr>`;
        }
    });

    areaTabela.appendChild(table);
}

        
        // Função para formatar a data (se necessário)
        function formatarData(data) {
            const date = new Date(data);

            // Usando getUTCDate e getUTCMonth para garantir que a data esteja em UTC
            const dia = String(date.getUTCDate()).padStart(2, '0');  // Garante que o dia tenha 2 dígitos
            const mes = String(date.getUTCMonth() + 1).padStart(2, '0');  // Garante que o mês tenha 2 dígitos (lembrando que o mês é zero-indexado)

            return `${dia}/${mes}/${date.getUTCFullYear()}`; // Usamos getUTCFullYear para o ano em UTC
        }

        function deletar() {
            const codCentro = document.getElementById("del").value;

            // Adiciona a confirmação
            const confirmar = confirm(`Deseja realmente deletar a programação do código ${codCentro}?`);

            if (!confirmar) {
                return; // Se o usuário cancelar, a função é encerrada
            }

            const url = `http://localhost:8081/programacao/${codCentro}`;  // Passando o código do centro na URL

            const options = {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }
            };
            setTimeout(() => {
            window.location.reload(); // Recarregar a página
            });
            fecharModalDeletar()

            fetch(url, options)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro na exclusão de dados');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Programação deletada com sucesso:', data);
                    tabelaPrincipal(); // Atualiza a tabela após deletar
                })
                .catch(error => {
                    console.log("Erro na exclusão de dados", error);
                });
        }

        // Função para abrir o modal de deletar
        function abrirModalDeletar() {
            const modalDelete = `
        <div id="modalDeletar" class="modal">
            <div class="modal-content">
                <span class="close" onclick="fecharModalDeletar()">&times;</span>
                <h3>Deletar Programação</h3>
                <label for="centroDistribuicao">Centro de Distribuição:</label>
                <input type="number" id="del" required>
                <button id="deletarBtn">Deletar</button>
            </div>
        </div>
    `;

            document.body.insertAdjacentHTML('beforeend', modalDelete);
            document.getElementById("modalDeletar").style.display = "block";

            // Adiciona o ouvinte de evento ao botão de deletar
            document.getElementById("deletarBtn").onclick = function () {
                deletar(); // Chama a função para deletar
            };
        }

        function adicionar() {
            window.location.href = "/adicionar programação/AddProg.html"
        }
        // Função para fechar o modal de deletar
        function fecharModalDeletar() {
            const modal = document.getElementById("modalDeletar");
            if (modal) {
                modal.remove();
            }


        }

        // Se a página for 'paginaprincipal.html', carrega a tabela principal
        if (window.location.href.endsWith("/pagina principal/paginaprincipal.html")) {
            tabelaPrincipal();
        }

        function tabelaDeMecanicos() {
            window.location.href = "/mecanicos/paginamecanicos.html";
        }

        function tabelaDeVeiculos() {
            window.location.href = "/veiculos/paginaveiculos.html";
        }
        function logOut(){
            const confirmar = confirm(`Deseja realmente Sair??`);

            if (!confirmar) {
                return; 
            }
            window.location.href = "/login/login.html"
        }