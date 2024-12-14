require("dotenv").config();
const PORT = process.env.PORT || 3000;  // Se não encontrar o PORT, usa 3000 como padrão
const stringSQL = process.env.CONNECTION_STRING;

const express = require("express");
const mssql = require("mssql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Função para conectar ao banco de dados
function conectaBD() {
    mssql.connect(stringSQL)
        .then(() => console.log("Banco de dados conectado"))
        .catch(error => console.log("Erro na conexão com o banco de dados.", error));
}
conectaBD();

// Função para executar consultas SQL
async function execQuery(querySql) {
    try {
        const result = await mssql.query(querySql);
        console.log(result);
        return result;
    } catch (error) {
        console.error("Erro ao executar a consulta SQL:", error);
        throw error; // Propaga o erro para ser tratado na rota
    }
}

// Função para converter tempo em formato "HH:MM" para minutos
function converteTempoParaMinutos(tempo) {
    const [horas, minutos] = tempo.split(':').map(Number); // Divide a string e converte para número
    return horas * 60 + minutos; // Converte tudo para minutos
}

// Rota DELETE para apagar a programação
app.delete('/programacao/:codigoCentroDistribuicao', async (req, res) => {  // Agora é async
    try {
        const codCentro = req.params.codigoCentroDistribuicao;

        const sql = `DELETE FROM daroca1.programacao2 WHERE codigoCentroDistribuicao = ${codCentro}`;

        await execQuery(sql);  // Espera a execução da consulta
        res.sendStatus(204);  // Corrigido para 204 (No Content)
    } catch (error) {
        res.status(400).json({ error: 'Erro na exclusão dos dados.' });
    }
});

// Rota POST para gerar a programação de ordens de serviço
app.post('/programacao', async (req, res) => {
    try {
        const data = req.body.data; // A data já vem no formato YYYY-MM-DD
        const codigoCentroDistribuicao = req.body.codigoCentroDistribuicao;
        const ordens = req.body.ordens
        console.log("cod:", ordens);
        console.log(codigoCentroDistribuicao);
        console.log(data);

        // 1. Buscar todas as ordens de serviço do centro
        const ordensResponse = await fetch(`https://cenoura.glitch.me/ordensservico?codigoCentroDistribuicao=${codigoCentroDistribuicao}`);
        const ordensServico = await ordensResponse.json();

        // 2. Buscar todos os mecânicos do centro
        const mecanicosResponse = await fetch(`https://cenoura.glitch.me/mecanicos?codigoCentroDistribuicao=${codigoCentroDistribuicao}`);
        const mecanicos = await mecanicosResponse.json();

        const maxHoras = 8 * 60; // 8 horas em minutos
        const horaDeInicio = 8 * 60 + 15; // 08:15 em minutos
        const horaDeFim = 18 * 60; // 18:00 em minutos
        let cargaHorariaMecanico = {};

        // Inicializar a carga horária dos mecânicos
        mecanicos.forEach(mecanico => {
            cargaHorariaMecanico[mecanico.codigoMecanico] = 0;
        });

        // Hora inicial de trabalho (08:15)
        let horaAtual = horaDeInicio;

        // Função para distribuir as ordens
        for (const ordem of ordensServico) {
            if (ordem.codigoCentroDistribuicao !== codigoCentroDistribuicao) {
                console.log(`Ordem ${ordem.numeroOrdemServico} ignorada. Código do centro de distribuição não corresponde.`);
                continue; // Ignora ordens que não correspondem
            }
            if (ordem.status !== 'APROG') {
                console.log(`Ordem ${ordem.numeroOrdemServico} ignorada. Status não aprovado.`);
                continue;
            }
            if (!ordens.includes(String(ordem.numeroOrdemServico))) {
                console.log(`Ordem ${ordem.numeroOrdemServico} ignorada. Não escolhida.`);
                continue;
            }

            let mecanicoSelecionado = null;
            const tempoEstimadoMinutos = converteTempoParaMinutos(ordem.tempoEstimado);

            // Tentativa de distribuir a ordem entre os mecânicos, um por um
            for (const mecanico of mecanicos) {
                if (mecanico.codigoCentroDistribuicao !== codigoCentroDistribuicao) {
                    console.log(`Ordem ${ordem.numeroOrdemServico} ignorada. Código do centro de distribuição não corresponde.`);
                    continue; // Ignora ordens que não correspondem
                }

                // Verifica se o mecânico tem tempo disponível dentro do limite de 8 horas
                if (cargaHorariaMecanico[mecanico.codigoMecanico] + tempoEstimadoMinutos <= maxHoras) {
                    // Verifica se o mecânico já trabalhou entre 3 e 5 horas
                    const horasTrabalhadas = cargaHorariaMecanico[mecanico.codigoMecanico] / 60;
                    if (horasTrabalhadas >= 3 && horasTrabalhadas < 5) {
                        cargaHorariaMecanico[mecanico.codigoMecanico] += 60; // Pausa de 1 hora
                        horaAtual += 60; // Adiciona 1 hora de pausa
                    }

                    cargaHorariaMecanico[mecanico.codigoMecanico] += tempoEstimadoMinutos;
                    mecanicoSelecionado = mecanico;
                    break; // Se o mecânico foi selecionado, sai do loop
                }
            }

            if (mecanicoSelecionado) {
                // Definindo o horário de início e término da ordem
                const horaInicio = formataHora(horaAtual);
                horaAtual += tempoEstimadoMinutos;

                // Verificar se o horário de término ultrapassa 18:00
                if (horaAtual > horaDeFim) {
                    console.log(`Ordem ${ordem.numeroOrdemServico} ultrapassaria 18:00, atribuindo para o próximo dia.`);

                    // Se ultrapassar 18:00, atribuir ao próximo dia
                    const novaData = new Date(data);
                    novaData.setDate(novaData.getDate() + 1); // Avançar um dia
                    const novaDataFormatada = novaData.toISOString().split('T')[0]; // Formatar como YYYY-MM-DD

                    horaAtual = horaDeInicio; // Reiniciar para 08:15
                    console.log(`Ordem ${ordem.numeroOrdemServico} será atribuída para o dia ${novaDataFormatada} a partir das 08:15.`);

                    const horaInicioNovoDia = formataHora(horaAtual);
                    horaAtual += tempoEstimadoMinutos;
                    const horaFimNovoDia = formataHora(horaAtual);

                    const intervaloHorario = `${horaInicioNovoDia} - ${horaFimNovoDia}`;
                    const nomeUsuario = req.body.nomeUsuario;

                    // Atribuindo a ordem ao próximo dia
                    const sql = `INSERT INTO daroca1.programacao2
                        (Data, codigoCentroDistribuicao, codigoMecanico, numeroOrdemServico, tipoManutencao, criadaEm, tempoEstimado, status, Horario, nome, nomeUsuario) 
                        VALUES (
                            '${novaDataFormatada}',  
                            '${codigoCentroDistribuicao}', 
                            ${mecanicoSelecionado.codigoMecanico}, 
                            ${ordem.numeroOrdemServico}, 
                            '${ordem.tipoManutencao}', 
                            '${ordem.criadaEm}', 
                            '${ordem.tempoEstimado}', 
                            '${ordem.status}',
                            '${intervaloHorario}',
                            '${mecanicoSelecionado.nome}',
                            '${nomeUsuario}'
                        );`;

                    await execQuery(sql);
                    console.log(`Ordem ${ordem.numeroOrdemServico} atribuída para ${novaDataFormatada} e inserida com sucesso.`);
                } else {
                    const horaFim = formataHora(horaAtual);
                    const intervaloHorario = `${horaInicio} - ${horaFim}`;
                    const nomeUsuario = req.body.nomeUsuario;

                    console.log(`Ordem ${ordem.numeroOrdemServico} atribuída a ${mecanicoSelecionado.nome} de ${intervaloHorario}.`);

                    const sql = `INSERT INTO daroca1.programacao2
                        (Data, codigoCentroDistribuicao, codigoMecanico, numeroOrdemServico, tipoManutencao, criadaEm, tempoEstimado, status, Horario, nome, nomeUsuario) 
                        VALUES (
                            '${data}',  
                            '${codigoCentroDistribuicao}', 
                            ${mecanicoSelecionado.codigoMecanico}, 
                            ${ordem.numeroOrdemServico}, 
                            '${ordem.tipoManutencao}', 
                            '${ordem.criadaEm}', 
                            '${ordem.tempoEstimado}', 
                            '${ordem.status}',
                            '${intervaloHorario}',
                            '${mecanicoSelecionado.nome}',
                            '${nomeUsuario}'
                        );`;

                    await execQuery(sql);
                    console.log(`Ordem ${ordem.numeroOrdemServico} atribuída a ${mecanicoSelecionado.nome} e inserida com sucesso.`);
                }
            } else {
                console.log(`Ordem ${ordem.numeroOrdemServico} não pode ser atribuída a nenhum mecânico.`);
            }
        }

        res.status(201).json({ mensagem: 'SUCESSO' });
    } catch (error) {
        console.error('Erro ao gerar programação de ordens de serviço:', error);
        res.status(500).json({ mensagem: 'Erro ao gerar programação de ordens de serviço.' });
    }
});

app.get("/programacao", async (req, res) => {
    try {
        const sql = `SELECT * FROM daroca1.programacao2`;
        const programacoes = await execQuery(sql);
        res.json(programacoes);
    } catch (error) {
        console.error('Erro ao buscar programacoes:', error);
        res.status(500).json({ error: 'Erro ao buscar os programacoes.' });
    }
});

// Rota principal
app.use("/", (req, res) => {
    res.json({ mensagem: "Servidor em execução" });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log("API funcionando na porta", PORT);
});
