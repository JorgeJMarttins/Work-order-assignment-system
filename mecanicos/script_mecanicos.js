let mecanicos = [];

        function criarTabelaMecanicos(event) {
            if (event) event.preventDefault();
            document.querySelector("#botaoVeiculos").style.backgroundColor = "white";
            document.querySelector("#botaoMecanicos").style.backgroundColor = "#81a425";

            fetch("https://cenoura.glitch.me/mecanicos")
                .then(res => res.json())
                .then(dados => {
                    mecanicos = dados;
                    renderizarTabelaMecanicos(dados);
                })
                .catch(console.error);
        }

        function renderizarTabelaMecanicos(dados) {
            const areaTabela = document.getElementById("areaDaTabela");
            areaTabela.innerHTML = "";
            let table = document.createElement("table");
            table.id = "tableMecanicos";
            table.innerHTML = `<tr>
                <th>Nome</th><th>Código Mecânico</th><th>Centro de Distribuição</th>
                <th>Início do Turno</th><th>Fim do Turno</th><th>Início do Almoço</th><th>Fim do Almoço</th>
            </tr>`;

            dados.forEach(dado => {
                table.innerHTML += `<tr>
                    <td>${dado.nome}</td><td>${dado.codigoMecanico}</td>
                    <td>${dado.codigoCentroDistribuicao == 1 ? "Ribeirão Preto" : dado.codigoCentroDistribuicao == 2 ? "São Paulo" : "Campinas"}</td>
                    <td>${dado.inicioTurno}</td><td>${dado.fimTurno}</td><td>${dado.inicioAlmoco}</td><td>${dado.fimAlmoco}</td>
                </tr>`;
            });

            areaTabela.appendChild(table);
        }

        function aplicarFiltros() {
            const idInput = document.getElementById("buscaPorIDMecanicos").value.toLowerCase();
            const nomeInput = document.getElementById("buscaPorNome").value.toLowerCase();
            const ctInput = document.getElementById("buscaPorCD").value;

            const filtrados = mecanicos.filter(mecanico => {
                // Aplica todos os filtros de forma cumulativa
                const filtraID = !idInput || mecanico.codigoMecanico.toString().toLowerCase().includes(idInput);
                const filtraNome = !nomeInput || mecanico.nome.toLowerCase().includes(nomeInput);
                const filtraCD = !ctInput || mecanico.codigoCentroDistribuicao.toString() === ctInput;

                // Só retorna o mecânico se todos os critérios forem atendidos
                return filtraID && filtraNome && filtraCD;
            });

            renderizarTabelaMecanicos(filtrados); // Renderiza a tabela com os resultados filtrados
        }

        function telaDeVeiculos() {
            window.location.href = "/veiculos/paginaveiculos.html";
        }

        function voltar() {
            window.location.href = "/pagina principal/paginaprincipal.html";
        }

        window.onload = function () {
            criarTabelaMecanicos();
        };