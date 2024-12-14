let programacoes = [];
        const linhas = 15;
        let pagina = 1;

        function tabelaPrincipal() {
            const areaTabela = document.getElementById("areaDaTabela");
            areaTabela.innerHTML = "";
            let table = document.createElement("table");
            table.id = "tabelaProgramacao";
            table.innerHTML = `<tr>
                <th>Data Criação</th><th>Centro de Distribuição</th><th>Ordem de Serviço</th><th>Tipo Manutenção</th><th>Data Criação</th><th>Tempo Estimado</th><th>Status</th>
            </tr>`;
        
            const urlParams = new URLSearchParams(window.location.search);
            const codigoCentroDistribuicao = urlParams.get("codigoCentroDistribuicao"); // Obtém o ID do centro da URL
        
            fetch("http://localhost:8081/programacao")
                .then(res => res.json())
                .then(dados => {
                    programacoes = dados.recordsets[0];
        
                    // Filtra programações pelo codigoCentroDistribuicao da URL
                    const filteredProgramacoes = codigoCentroDistribuicao
                    ? programacoes.filter(prog => prog.codigoCentroDistribuicao.toString() === codigoCentroDistribuicao)
                    : programacoes;

        
                    renderTabela(filteredProgramacoes);
                    renderizarPaginacao(filteredProgramacoes);
                })
                .catch(console.error);
        }
        

        function filtrarOrdens() {
            const buscaPorData = document.getElementById("buscaPorData").value;
            const buscaPorCD = document.getElementById("buscaPorCD").value.toLowerCase();

            const filteredProgramacoes = programacoes.filter(prog => {
                const Data = buscaPorData ? prog.Data === buscaPorData : true;
                const CD = buscaPorCD ? prog.codigoCentroDistribuicao.toLowerCase().includes(buscaPorCD) : true;
                return Data && CD;
            });

            renderTabela(filteredProgramacoes);
            renderizarPaginacao(filteredProgramacoes.length);
        }

        function renderTabela(filteredData = programacoes) {
            const areaTabela = document.getElementById("areaDaTabela");
            areaTabela.innerHTML = "";
            let table = document.createElement("table");
            table.id = "tabelaProgramacao";
            table.innerHTML = `<tr>
                <th>Nome Mecanico</th><th>Codigo Mecanico</th><th>Data Criação Programacão</th><th>Centro de Distribuição</th><th>Numero Ordem de Serviço</th><th>Tipo Manutenção</th><th>Data Criação Ordem</th><th>Tempo Estimado</th><th>Horario Estimado</th><th>Status</th>
            </tr>`;

            const start = (pagina - 1) * linhas;
            const end = start + linhas;
            const pageData = filteredData.slice(start, end);

            pageData.forEach(prog => {
                table.innerHTML += `<tr>
                    <td>${prog.nome}</td>
                    <td>${prog.codigoMecanico}</td>
                    <td>${formatarData(prog.Data)}</td>
                    <td>${prog.codigoCentroDistribuicao}</td>
                    <td>${prog.numeroOrdemServico}</td>
                    <td>${prog.tipoManutencao}</td>
                    <td>${formatarData(prog.criadaEm)}</td>
                    <td>${formatarHora(prog.tempoEstimado)}</td>
                    <td>${(prog.Horario)}</td>
                    <td>${prog.status}</td>
                </tr>`;
            });

            areaTabela.appendChild(table);
        }

        function renderizarPaginacao(filteredData = programacoes) {
            const pagination = document.getElementById("pagination");
            pagination.innerHTML = "";

            const pageCount = Math.ceil(filteredData.length / linhas);

            for (let i = 1; i <= pageCount; i++) {
                const button = document.createElement("div");
                button.innerText = i;
                button.classList.add("page-button");
                button.classList.toggle("active", i === pagina);
                button.addEventListener("click", () => {
                    pagina = i;
                    renderTabela(filteredData);
                    renderizarPaginacao(filteredData);
                });
                pagination.appendChild(button);
            }
        }

        function formatarData(data) {
            const date = new Date(data);
            return date.toISOString().split('T')[0].split('-').reverse().join('/');
        }
        

        function formatarHora(time) {
            const data = new Date(time);
            let horas = data.getUTCHours();
            let minutos = data.getMinutes();

            if (minutos < 10) {
                minutos = `0${minutos}`;
            }

            return `${horas}:${minutos}`;
        }

        window.onload = tabelaPrincipal;
