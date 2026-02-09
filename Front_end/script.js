// --- VARIÁVEIS GLOBAIS ---
let chartPizza = null;
let chartBarras = null;
let dadosTabelaCompleta = [];

// --- 1. FUNÇÕES DE UTILIDADE (LIMPEZA E MÁSCARAS) ---

// Transforma "1.500,50" em 1500.50 para a API entender
function limparParaNumero(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/\./g, "").replace(",", "."));
}

// Aplica a máscara de R$ em tempo real nos campos com a classe .js-money
function configurarMascaras() {
    const camposMoeda = document.querySelectorAll('.js-money');

    camposMoeda.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, "");
            value = (value / 100).toFixed(2) + "";
            value = value.replace(".", ",");
            value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
            e.target.value = value === "NaN" ? "0,00" : value;
        });
    });
}

// --- 2. FUNÇÃO PRINCIPAL DE CÁLCULO ---

async function calcular() {
    const msgErro = document.getElementById('erro-mensagem');
    
    // Reseta o estado inicial
    msgErro.classList.add('hidden');
    msgErro.innerText = "";

    // Captura os valores dos campos
    const campoTaxa = document.getElementById('taxa_juros').value;
    const taxaNumerica = limparParaNumero(campoTaxa);

    // VALIDAÇÃO PERSONALIZADA: Campo de juros vazio ou zero
    if (!campoTaxa || taxaNumerica === 0) {
        msgErro.innerText = "⚠️ Por favor, informe a Taxa de Juros!";
        msgErro.classList.remove('hidden');
        return; 
    }

    // Cria o objeto com os dados (Payload)
    const payload = {
        C: limparParaNumero(document.getElementById('valor_inicial').value),
        A: limparParaNumero(document.getElementById('valor_mensal').value),
        taxa_juros: taxaNumerica,
        T: parseInt(document.getElementById('periodo').value) || 0,
        taxa_juros_mensal: document.getElementById('tipo_taxa').value === 'mensal',
        tempo_mensal: document.getElementById('tipo_periodo').value === 'meses'
    };

    // 1. Defina a URL gerada pelo Render
    // Lembre-se de trocar "projeto-calculadora-abc1" pela sua URL real do painel do Render
    const urldaAPI = "https://projeto-calculadora-1lgh.onrender.com/calcular";

    try {
        // Mostra um aviso opcional de "Carregando..." se desejar
        
        // 2. Faz a chamada para a API utilizando o payload correto
        const response = await fetch(urldaAPI, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload) 
        });

        if (!response.ok) {
            throw new Error(`Erro no servidor: ${response.status}`);
        }

        const resultado = await response.json();
        
        // 3. Exibição dos resultados (Exemplo)
        console.log("Resultado recebido:", resultado);
        exibirResultados(resultado); // Certifique-se de que essa função existe
        
    } catch (error) {
        console.error("Erro ao conectar com a API:", error);
        alert("O servidor está iniciando (plano gratuito). Aguarde cerca de 50 segundos e clique em calcular novamente.");
    }
}

// --- 3. CONTROLE DA INTERFACE ---

function exibirInterface(data) {
    // Torna a seção de resultados visível
    const secaoResultados = document.getElementById('secao-resultados');
    secaoResultados.classList.remove('hidden');

    // MOVE O BLOCO DE APOSENTADORIA PARA O FINAL (Para não atrapalhar a visão)
    const bloco = document.getElementById('bloco-aposentadoria');
    const destinoFinal = document.getElementById('destino-aposentadoria-final');
    if (bloco && destinoFinal) {
        destinoFinal.appendChild(bloco);
        bloco.classList.add('mt-12'); // Adiciona um espaçamento no topo
    }

    dadosTabelaCompleta = data.tabela;

    // Atualiza os cards de resumo
    document.getElementById('res-juros').innerText = `R$ ${data.resumo.total_juros.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('res-investido').innerText = `R$ ${data.resumo.total_investido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('res-final').innerText = `R$ ${data.resumo.valor_final.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;

    renderizarTabela();
    renderizarGraficos(data);

    // Rola a página suavemente para os resultados
    secaoResultados.scrollIntoView({ behavior: 'smooth' });
}

function renderizarTabela() {
    const tbody = document.getElementById('tabela-corpo');
    tbody.innerHTML = dadosTabelaCompleta.map(row => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td>${row.mes}</td>
            <td>R$ ${row.juros_mes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            <td>R$ ${row.total_investido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            <td>R$ ${row.juros_acumlado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            <td>R$ ${row.saldo_acumulado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
        </tr>
    `).join('');
}

// --- 4. RENDERIZAÇÃO DE GRÁFICOS (CHART.JS) ---

function renderizarGraficos(data) {
    if (chartPizza) chartPizza.destroy();
    if (chartBarras) chartBarras.destroy();

    const cores = {
        investido: '#6B7280',
        juros: '#10B981'
    };

    // Gráfico de Pizza (Doughnut)
    chartPizza = new Chart(document.getElementById('chartPizza'), {
        type: 'doughnut',
        data: {
            labels: ['Total Investido', 'Total em Juros'],
            datasets: [{
                data: [data.resumo.total_investido, data.resumo.total_juros],
                backgroundColor: [cores.investido, cores.juros],
                hoverOffset: 20
            }]
        },
        options: { maintainAspectRatio: false }
    });

    // Gráfico de Barras Empilhadas
    chartBarras = new Chart(document.getElementById('chartBarras'), {
        type: 'bar',
        data: {
            labels: data.tabela.map(item => `Mês ${item.mes}`),
            datasets: [
                { label: 'Investido', data: data.tabela.map(i => i.total_investido), backgroundColor: cores.investido },
                { label: 'Juros', data: data.tabela.map(i => i.juros_acumlado), backgroundColor: cores.juros }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
        }
    });
}

function exibirResultados(resultado) {
    // Exemplo de como preencher os campos na tela
    // Certifique-se de que esses IDs existam no seu HTML
    if (document.getElementById('total-acumulado')) {
        document.getElementById('total-acumulado').innerText = `R$ ${resultado.total_acumulado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    }
    
    if (document.getElementById('total-investido')) {
        document.getElementById('total-investido').innerText = `R$ ${resultado.total_investido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    }

    if (document.getElementById('total-juros')) {
        document.getElementById('total-juros').innerText = `R$ ${resultado.total_juros.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    }
}

// --- 5. INICIALIZAÇÃO E NAVEGAÇÃO ---

function irParaAposentadoria() {
    // Redireciona para o arquivo da nova interface
    window.location.href = 'aposentadoria.html'; 
}

function toggleDarkMode() {
    const body = document.body;
    const icon = document.getElementById('dark-icon');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        icon.innerText = "☀️";
        localStorage.setItem('theme', 'dark');
    } else {
        icon.innerText = "🌙";
        localStorage.setItem('theme', 'light');
    }
}

// Verifica se o usuário já tinha uma preferência salva ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('dark-icon').innerText = "☀️";
    }
});

// Garante que as máscaras funcionem assim que o site abrir
document.addEventListener('DOMContentLoaded', configurarMascaras);