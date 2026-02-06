let chartPizza = null;
let chartBarras = null;

async function calcular() {
    // Captura se o usuário selecionou "mês(es)" no dropdown
    const e_tempo_mensal = document.getElementById('tipo_periodo').value === 'meses';

    const payload = {
        C: parseFloat(document.getElementById('valor_inicial').value) || 0,
        A: parseFloat(document.getElementById('valor_mensal').value) || 0,
        T: parseInt(document.getElementById('periodo').value),
        taxa_juros: parseFloat(document.getElementById('taxa_juros').value),
        taxa_juros_mensal: document.getElementById('tipo_taxa').value === 'mensal',
        tempo_mensal: e_tempo_mensal // Agora envia corretamente True ou False
    };

    try {
        const response = await fetch('http://127.0.0.1:8000/calculadora', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        exibirInterface(data);
    } catch (e) {
        console.error(e);
        alert("Erro ao conectar com a API!");
    }
}

function exibirInterface(data) {
    document.getElementById('secao-resultados').classList.remove('hidden');

    // Cards
    document.getElementById('res-juros').innerText = `R$ ${data.resumo.total_juros.toLocaleString('pt-BR')}`;
    document.getElementById('res-investido').innerText = `R$ ${data.resumo.total_investido.toLocaleString('pt-BR')}`;
    document.getElementById('res-final').innerText = `R$ ${data.resumo.valor_final.toLocaleString('pt-BR')}`;

    // Tabela
    const tbody = document.getElementById('tabela-corpo');
    tbody.innerHTML = data.tabela.map(row => `
        <tr>
            <td>${row.mes}</td>
            <td>R$ ${row.juros_mes.toLocaleString('pt-BR')}</td>
            <td>R$ ${row.total_investido.toLocaleString('pt-BR')}</td>
            <td>R$ ${row.juros_acumlado.toLocaleString('pt-BR')}</td>
            <td>R$ ${row.saldo_acumulado.toLocaleString('pt-BR')}</td>
        </tr>
    `).join('');

    renderizarGraficos(data);
}

function renderizarGraficos(data) {
    if (chartPizza) chartPizza.destroy();
    if (chartBarras) chartBarras.destroy();

    // Pizza
    chartPizza = new Chart(document.getElementById('chartPizza'), {
        type: 'doughnut',
        data: {
            labels: ['Investido', 'Juros'],
            datasets: [{
                data: [data.resumo.total_investido, data.resumo.total_juros],
                backgroundColor: ['#4B5563', '#BFDBFE']
            }]
        }
    });

    // Barras - MOSTRA TODOS OS MESES (ex: 12 colunas para 1 ano)
    chartBarras = new Chart(document.getElementById('chartBarras'), {
        type: 'bar',
        data: {
            labels: data.tabela.map(i => `Mês ${i.mes}`),
            datasets: [
                {
                    label: 'Investido',
                    data: data.tabela.map(i => i.total_investido),
                    backgroundColor: '#4B5563'
                },
                {
                    label: 'Juros',
                    data: data.tabela.map(i => i.juros_acumlado),
                    backgroundColor: '#BFDBFE'
                }
            ]
        },
        options: {
            responsive: true,
            scales: { x: { stacked: true }, y: { stacked: true } }
        }
    });
}

// Função para formatar o valor enquanto digita
function configurarMascaras() {
    const camposMoeda = document.querySelectorAll('.js-money');

    camposMoeda.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value;

            // Remove tudo que não é dígito
            value = value.replace(/\D/g, "");

            // Transforma em decimal (ex: 50000 vira 500.00)
            value = (value / 100).toFixed(2) + "";

            // Troca ponto por vírgula e adiciona pontos de milhar
            value = value.replace(".", ",");
            value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");

            e.target.value = value === "NaN" ? "0,00" : value;
        });
    });
}

// Chame a função ao carregar a página
document.addEventListener('DOMContentLoaded', configurarMascaras);

// --- AJUSTE NA FUNÇÃO DE CALCULAR ---
// Como agora os campos são texto (ex: "50.000,00"), precisamos "limpar" 
// para enviar à API como número puro (ex: 50000.00)

function limparParaNumero(str) {
    if (!str) return 0;
    // Remove pontos e troca a vírgula por ponto
    return parseFloat(str.replace(/\./g, "").replace(",", "."));
}

async function calcular() {
    const payload = {
        C: limparParaNumero(document.getElementById('valor_inicial').value),
        A: limparParaNumero(document.getElementById('valor_mensal').value),
        taxa_juros: limparParaNumero(document.getElementById('taxa_juros').value),
        T: parseInt(document.getElementById('periodo').value),
        taxa_juros_mensal: document.getElementById('tipo_taxa').value === 'mensal',
        tempo_mensal: document.getElementById('tipo_periodo').value === 'meses'
    };

    // ... restante do seu código fetch ...
    try {
        const response = await fetch('http://127.0.0.1:8000/calculadora', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        exibirInterface(data);
    } catch (e) {
        alert("Erro ao calcular. Verifique se os números colacados sáo válidos!");
    }
}