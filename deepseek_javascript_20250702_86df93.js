document.addEventListener('DOMContentLoaded', async () => {
    // Verifica autenticação
    const session = await checkAuth();
    if (!session) return;

    // Carrega dados do usuário
    const { inversores, paineis } = await loadUserData(session.user.id);
    
    // Preenche dropdowns e tabelas
    preencherDropdown('selecionar-inversor', inversores);
    preencherDropdown('selecionar-painel', paineis);
    atualizarTabelas(inversores, paineis);
});

// Função para cadastrar inversor
async function cadastrarInversor() {
    const inversorData = {
        marca: document.getElementById('inversor-marca').value,
        modelo: document.getElementById('inversor-modelo').value,
        potencia: parseFloat(document.getElementById('inversor-potencia').value),
        overload: parseFloat(document.getElementById('inversor-overload').value) / 100,
        vMin: parseFloat(document.getElementById('inversor-vmin').value),
        vMax: parseFloat(document.getElementById('inversor-vmax').value)
    };

    const { error } = await saveInversor(inversorData);
    
    if (error) {
        document.getElementById('inversor-error').textContent = error.message;
    } else {
        alert('Inversor cadastrado com sucesso!');
        location.reload(); // Recarrega para mostrar o novo inversor
    }
}

// Função para cadastrar painel
async function cadastrarPainel() {
    const painelData = {
        marca: document.getElementById('painel-marca').value,
        modelo: document.getElementById('painel-modelo').value,
        potencia: parseFloat(document.getElementById('painel-potencia').value),
        voc: parseFloat(document.getElementById('painel-voc').value),
        vmp: parseFloat(document.getElementById('painel-vmp').value),
        imp: parseFloat(document.getElementById('painel-imp').value)
    };

    const { error } = await savePainel(painelData);
    
    if (error) {
        document.getElementById('painel-error').textContent = error.message;
    } else {
        alert('Painel cadastrado com sucesso!');
        location.reload(); // Recarrega para mostrar o novo painel
    }
}

// Função para calcular a expansão
async function calcularExpansao() {
    const inversorIndex = document.getElementById('selecionar-inversor').value;
    const painelIndex = document.getElementById('selecionar-painel').value;
    const qtdAtual = parseInt(document.getElementById('qtd-atual').value);
    const irradiacao = parseFloat(document.getElementById('irradiacao').value);

    // Carrega dados novamente para garantir que está atualizado
    const { data: { user } } = await supabase.auth.getUser();
    const { inversores, paineis } = await loadUserData(user.id);

    const inversor = inversores[inversorIndex];
    const painel = paineis[painelIndex];

    // Cálculos principais
    const potenciaMaximaInversor = inversor.potencia * (1 + inversor.overload); // em kW
    const potenciaAtual = (qtdAtual * painel.potencia) / 1000; // em kW
    const potenciaDisponivel = Math.max(0, potenciaMaximaInversor - potenciaAtual);
    const maxPaineisSistema = Math.floor((potenciaMaximaInversor * 1000) / painel.potencia);
    const paineisAdicionaveis = Math.floor((potenciaDisponivel * 1000) / painel.potencia);

    // Validações técnicas
    const vocValido = painel.voc <= inversor.vMax;
    const vmpValido = painel.vmp >= inversor.vMin && painel.vmp <= inversor.vMax;

    // Cálculo de geração energética (estimativa)
    const eficienciaSistema = 0.75; // 75% (considerando perdas)
    const geracaoDiaria = (potenciaAtual + (paineisAdicionaveis * painel.potencia / 1000)) * irradiacao * eficienciaSistema;
    const geracaoMensal = geracaoDiaria * 30;

    // Exibir resultados
    const resultadoDiv = document.getElementById('resultado-conteudo');
    resultadoDiv.innerHTML = `
        <h3>Dados do Sistema</h3>
        <p><strong>Inversor:</strong> ${inversor.marca} ${inversor.modelo} (${inversor.potencia} kW + ${inversor.overload * 100}%)</p>
        <p><strong>Painel:</strong> ${painel.marca} ${painel.modelo} (${painel.potencia}W)</p>
        <p><strong>Potência Máxima do Inversor (com overload):</strong> ${potenciaMaximaInversor.toFixed(2)} kW</p>
        <p><strong>Potência Atual do Sistema:</strong> ${potenciaAtual.toFixed(2)} kW (${qtdAtual} painéis)</p>

        <h3>Resultados da Expansão</h3>
        <p><strong>Potência Disponível para Expansão:</strong> ${potenciaDisponivel.toFixed(2)} kW</p>
        <p><strong>Número Máximo de Painéis no Sistema:</strong> ${maxPaineisSistema}</p>
        <p><strong>Painéis Adicionáveis:</strong> ${paineisAdicionaveis}</p>
        <p><strong>Nova Potência Total:</strong> ${(potenciaAtual + (paineisAdicionaveis * painel.potencia / 1000)).toFixed(2)} kW</p>

        <h3>Validações Técnicas</h3>
        <p class="${vocValido ? '' : 'error-message'}"><strong>Tensão VOC (${painel.voc}V):</strong> ${vocValido ? '✔ Compatível' : '✖ Excede tensão máxima do inversor (' + inversor.vMax + 'V)'}</p>
        <p class="${vmpValido ? '' : 'error-message'}"><strong>Tensão VMP (${painel.vmp}V):</strong> ${vmpValido ? '✔ Dentro da faixa do inversor' : '✖ Fora da faixa (' + inversor.vMin + 'V a ' + inversor.vMax + 'V)'}</p>

        <h3>Geração Energética Estimada</h3>
        <p><strong>Média Diária:</strong> ${geracaoDiaria.toFixed(2)} kWh/dia</p>
        <p><strong>Média Mensal:</strong> ${geracaoMensal.toFixed(2)} kWh/mês</p>
    `;

    document.getElementById('resultado').style.display = 'block';
}

// Funções auxiliares
function preencherDropdown(elementId, itens) {
    const select = document.getElementById(elementId);
    select.innerHTML = itens.map((item, index) => 
        `<option value="${index}">${item.marca} ${item.modelo}</option>`
    ).join('');
}

function atualizarTabelas(inversores, paineis) {
    const tabelaInversores = document.querySelector('#tabela-inversores tbody');
    const tabelaPaineis = document.querySelector('#tabela-paineis tbody');
    
    tabelaInversores.innerHTML = inversores.map(inv => `
        <tr>
            <td>${inv.marca}</td>
            <td>${inv.modelo}</td>
            <td>${inv.potencia}</td>
            <td>${(inv.overload * 100)}%</td>
            <td>${inv.vMin}V - ${inv.vMax}V</td>
        </tr>
    `).join('');
    
    tabelaPaineis.innerHTML = paineis.map(pnl => `
        <tr>
            <td>${pnl.marca}</td>
            <td>${pnl.modelo}</td>
            <td>${pnl.potencia}</td>
            <td>${pnl.voc}</td>
            <td>${pnl.vmp}</td>
            <td>${pnl.imp}</td>
        </tr>
    `).join('');
}