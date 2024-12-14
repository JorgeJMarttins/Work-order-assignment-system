let veiculos = [];
        let currentPage = 1;
        const rowsPerPage = 15;
        let loading = false;

        // Função para criar a tabela de veículos
        function criarTabelaVeiculos(event) {
            event.preventDefault();
            document.querySelector("#botaoVeiculos").style.backgroundColor = "#81a425";
            document.querySelector("#botaoMecanicos").style.backgroundColor = "white";

            fetch("https://cenoura.glitch.me/veiculos")
                .then(res => res.json())
                .then(dados => {
                    veiculos = dados;
                    aplicarFiltros(); // Garante que filtros sejam aplicados após carregar dados
                })
                .catch(console.error);
        }

        // Função para aplicar todos os filtros interconectados
        function aplicarFiltros() {
            const idInput = document.getElementById("buscaPorIDVeiculos").value.toLowerCase();
            const placaInput = document.getElementById("buscaPorPlaca").value.toLowerCase();
            const ctInput = document.getElementById("buscaPorCD").value;

            // Filtragem interconectada
            const filtrados = veiculos.filter(veiculo => {
                const filtraID = !idInput || veiculo.codigoVeiculo.toString().toLowerCase().includes(idInput);
                const filtraPlaca = !placaInput || veiculo.placa.toLowerCase().includes(placaInput);
                const filtraCT = !ctInput || veiculo.codigoCentroDistribuicao.toString() === ctInput;

                return filtraID && filtraPlaca && filtraCT;
            });

            renderizarTabelaVeiculos(filtrados);
        }

        // Função para renderizar a tabela de veículos
        function renderizarTabelaVeiculos(dados) {
            const areaTabela = document.getElementById("areaDaTabela");
            const loader = document.getElementById("loader");
            loader.style.display = "none";

            areaTabela.innerHTML = "";
            let table = document.createElement("table");
            table.innerHTML = `<tr>
                <th>Código Veículo</th>
                <th>Placa</th>
                <th>Centro de Distribuição</th>
                <th>Fabricante</th>
                <th>Modelo</th>
                <th>Ano</th>
                <th>Velocidade Média</th>
            </tr>`;

            // Add rows dynamically
            dados.forEach(dado => {
                table.innerHTML += `<tr>
                    <td>${dado.codigoVeiculo}</td>
                    <td>${dado.placa}</td>
                    <td>${dado.codigoCentroDistribuicao == 1 ? "Ribeirão Preto" : dado.codigoCentroDistribuicao == 2 ? "São Paulo" : "Campinas"}</td>
                    <td>${dado.fabricante}</td>
                    <td>${dado.modelo}</td>
                    <td>${dado.ano}</td>
                    <td>${dado.velocidadeMedia}</td>
                </tr>`;
            });

            areaTabela.appendChild(table);
        }

        // Scroll infinito
        document.getElementById("areaDaTabela").addEventListener("scroll", function () {
            const areaTabela = document.getElementById("areaDaTabela");
            if (!loading && areaTabela.scrollHeight - areaTabela.scrollTop === areaTabela.clientHeight) {
                loading = true;
                const loader = document.getElementById("loader");
                loader.style.display = "block";

                // Simulating loading more data
                setTimeout(() => {
                    currentPage++;
                    aplicarFiltros();
                    loading = false;
                }, 500);
            }
        });

        // Navegação
        function telaDeMecanicos() {
            window.location.href = "/mecanicos/paginamecanicos.html";
        }

        function voltar() {
            window.location.href = "/pagina principal/paginaprincipal.html";
        }

        window.onload = function () {
            criarTabelaVeiculos(event);
        };
