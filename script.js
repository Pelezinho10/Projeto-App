let atividades = [];
const contas = JSON.parse(localStorage.getItem('contas')) || [];

const mapaSiglas = {
    'engenharia de software': 'ges',
    'engenharia de computação': 'gec',
    'engenharia de controle automação': 'gca',
    'engenharia de controle e automação': 'gca',
    'engenharia de biomedicina': 'gbm',
    'engenharia de produção': 'gep',
    'engenharia elétrica': 'gee',
    'engenharia de telecomunicações': 'get'
};

function fazerLogin(nome = null, email = null) {
    if (nome && email) {
        abrirTela(nome, email);
        return;
    }

    const nomeInput = document.getElementById('nome').value.trim();
    const curso = document.getElementById('curso').value.trim().toLowerCase();
    const senha = document.getElementById('senha').value.trim();

    if (!mapaSiglas[curso]) {
        alert("Não existe este curso nesta faculdade.");
        return;
    }

    if (senha.length !== 6 || isNaN(senha)) {
        alert("Senha inválida. A senha deve conter exatamente 6 números.");
        return;
    }

    const sigla = mapaSiglas[curso];
    const partes = nomeInput.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().split(' ');
    const primeiro = partes[0];
    const segundo = partes[1] ? partes[1] : '';
    const emailGerado = segundo ? `${primeiro}.${segundo}@${sigla}.inatel.br` : `${primeiro}@${sigla}.inatel.br`;

    // verifica se a conta já existe
    const contaExistente = contas.find(c => c.email === emailGerado);
    if (!contaExistente) {
        contas.push({ nome: nomeInput, email: emailGerado });
        localStorage.setItem('contas', JSON.stringify(contas));
    }

    abrirTela(nomeInput, emailGerado);
}

function abrirTela(nome, email) {
    document.getElementById('login').style.display = 'none';
    document.getElementById('menuLateral').style.display = 'block';
    document.getElementById('telaPrincipal').style.display = 'block';

    document.getElementById('nomePerfil').innerText = nome;
    document.getElementById('cursoPerfil').innerText = email;
    
    //carrega as atividades específicas do usuário
    atividades = JSON.parse(localStorage.getItem(`atividades_${email}`)) || [];
    atualizarAvisos();
    atualizarContas();
}

function salvarAtividade() {
    const tipo = document.getElementById('tipo').value;
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    const descricao = document.getElementById('descricao').value;

    if (!tipo || !data) {
        alert("Preencha pelo menos: Tipo e Data.");
        return;
    }

    atividades.push({
        tipo, 
        data, 
        horario: horario || "Pendente", 
        descricao: descricao || "", 
        concluido: false, 
        urgente: tipo.toLowerCase() === 'prova'
    });
    
    // salva as atividades no localStorage
    const email = document.getElementById('cursoPerfil').innerText;
    localStorage.setItem(`atividades_${email}`, JSON.stringify(atividades));
    
    limparCampos();
    atualizarAvisos();
}

function marcarConcluido(index) {
    atividades[index].concluido = true;
    atividades[index].urgente = false;
    
    const email = document.getElementById('cursoPerfil').innerText;
    localStorage.setItem(`atividades_${email}`, JSON.stringify(atividades));
    
    atualizarAvisos();
}

function alterarAtividade(index) {
    const a = atividades[index];
    document.getElementById('tipo').value = a.tipo;
    document.getElementById('data').value = a.data;
    document.getElementById('horario').value = a.horario;
    document.getElementById('descricao').value = a.descricao;
    atividades.splice(index, 1);
    
    const email = document.getElementById('cursoPerfil').innerText;
    localStorage.setItem(`atividades_${email}`, JSON.stringify(atividades));
    
    atualizarAvisos();
}

function removerAtividade(index) {
    atividades.splice(index, 1);
    
    const email = document.getElementById('cursoPerfil').innerText;
    localStorage.setItem(`atividades_${email}`, JSON.stringify(atividades));
    
    atualizarAvisos();
}

function atualizarAvisos() {
    const div = document.getElementById('mensagemAviso');

    if (atividades.length === 0) {
        div.innerHTML = "Não tem avisos no momento.";
        return;
    }

    // ordena por data (mais próximas primeiro)
    atividades.sort((a, b) => new Date(a.data) - new Date(b.data));

    div.innerHTML = '';
    atividades.forEach((a, index) => {
        let classe = 'atividade';
        if (a.concluido) classe += ' concluido';
        else if (a.urgente) classe += ' urgente';

        div.innerHTML += `
            <div class="${classe}">
                <strong>${a.tipo}</strong> - ${formatarData(a.data)}<br>
                Horário: ${a.horario}<br>
                ${a.descricao ? `Descrição: ${a.descricao}<br>` : ""}
                <button class="concluir-btn" onclick="marcarConcluido(${index})">Concluído</button>
                <button class="alterar-btn" onclick="alterarAtividade(${index})">Alterar</button>
                <button class="remove-btn" onclick="removerAtividade(${index})">Remover</button>
            </div>`;
    });
}

function formatarData(data) {
    const p = data.split("-");
    return `${p[2]}/${p[1]}/${p[0]}`;
}

function alerta() {
    alert("Funcionalidade indisponível nesta versão.");
}

function sair() {
    document.getElementById('login').style.display = 'block';
    document.getElementById('menuLateral').style.display = 'none';
    document.getElementById('telaPrincipal').style.display = 'none';
    limparCampos();
    atualizarContas();
}

function limparCampos() {
    document.getElementById('tipo').value = '';
    document.getElementById('data').value = '';
    document.getElementById('horario').value = '';
    document.getElementById('descricao').value = '';
}

function atualizarContas() {
    const div = document.getElementById('contasSalvas');
    if (contas.length === 0) {
        div.innerHTML = "";
        return;
    }

    div.innerHTML = "<h4>Contas Salvas:</h4>";
    contas.forEach((c, index) => {
        div.innerHTML += `
            <div style="border:1px solid #ccc; padding:10px; border-radius:8px; margin-bottom:8px;">
                <button onclick="fazerLogin('${c.nome}', '${c.email}')">
                    ${c.nome} <br> (${c.email})
                </button><br>
                <button class="remove-btn" onclick="removerConta(${index})">Remover</button>
            </div>
        `;
    });
}

function removerConta(index) {
    if (confirm("Deseja remover essa conta?")) {
        // remove as atividades associadas a essa conta
        const email = contas[index].email;
        localStorage.removeItem(`atividades_${email}`);
        
        contas.splice(index, 1);
        localStorage.setItem('contas', JSON.stringify(contas));
        atualizarContas();
    }
}

// inicializa o app
window.onload = function() {
    atualizarContas();
    
    // verifica se há um usuário logado
    if (contas.length > 0) {
    }
};