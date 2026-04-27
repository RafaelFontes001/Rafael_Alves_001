// carrega dados salvos ou começa vazio
let itens = [];

function salvarLocal() {
    localStorage.setItem("estoqueTI", JSON.stringify(itens));
}

function carregarLocal() {
    let dados = localStorage.getItem("estoqueTI");
    if(dados) {
        itens = JSON.parse(dados);
    } else {
        // alguns itens como exemplo (nada profissional)
        itens = [
            { nome: "Mouse Óptico", categoria: "Periférico", quant: 8, local: "Sala 1 - Gaveta A" },
            { nome: "Teclado USB", categoria: "Periférico", quant: 5, local: "Sala 1 - Gaveta B" },
            { nome: "Monitor 21'", categoria: "Monitor/Display", quant: 2, local: "Depósito" },
            { nome: "Cabo de Rede", categoria: "Rede", quant: 15, local: "Caixa 04" },
            { nome: "HD Externo 1TB", categoria: "Hardware interno", quant: 1, local: "Armário chave" },
            { nome: "Switch 5 portas", categoria: "Rede", quant: 3, local: "Sala de servidores" }
        ];
        salvarLocal();
    }
    atualizarTela();
}

function atualizarTela() {
    let tbody = document.getElementById("corpoTabela");
    tbody.innerHTML = "";
    
    for(let i = 0; i < itens.length; i++) {
        let item = itens[i];
        let linha = tbody.insertRow();
        
        let classeStatus = "";
        let textoStatus = "";
        if(item.quant <= 0) {
            textoStatus = "❌ Sem estoque";
            classeStatus = "status-baixo";
        } else if(item.quant < 3) {
            textoStatus = "⚠️ Baixo";
            classeStatus = "status-baixo";
        } else {
            textoStatus = "✅ Suficiente";
            classeStatus = "status-bom";
        }
        
        linha.insertCell(0).innerHTML = item.nome;
        linha.insertCell(1).innerHTML = item.categoria;
        linha.insertCell(2).innerHTML = item.quant;
        linha.insertCell(3).innerHTML = item.local;
        
        let cellStatus = linha.insertCell(4);
        cellStatus.innerHTML = textoStatus;
        cellStatus.className = classeStatus;
        
        let cellAcao = linha.insertCell(5);
        let btnRemove = document.createElement("span");
        btnRemove.innerHTML = "🗑️";
        btnRemove.className = "remover";
        btnRemove.style.marginRight = "8px";
        btnRemove.title = "Remover item";
        btnRemove.onclick = (function(idx) { return function() { removerItem(idx); }; })(i);
        
        let btnSub = document.createElement("span");
        btnSub.innerHTML = "➖";
        btnSub.style.cursor = "pointer";
        btnSub.style.marginRight = "8px";
        btnSub.title = "Diminuir 1 unidade";
        btnSub.onclick = (function(idx) { return function() { diminuirUm(idx); }; })(i);
        
        let btnAdd = document.createElement("span");
        btnAdd.innerHTML = "➕";
        btnAdd.style.cursor = "pointer";
        btnAdd.title = "Adicionar 1 unidade";
        btnAdd.onclick = (function(idx) { return function() { adicionarUm(idx); }; })(i);
        
        cellAcao.appendChild(btnRemove);
        cellAcao.appendChild(btnSub);
        cellAcao.appendChild(btnAdd);
    }
    salvarLocal();
}

function adicionarItem() {
    let nome = document.getElementById("nomeItem").value.trim();
    let categoria = document.getElementById("categoriaItem").value;
    let quant = parseInt(document.getElementById("quantItem").value);
    let local = document.getElementById("localItem").value.trim();
    
    if(nome === "") {
        alert("Preenche o nome do equipamento");
        return;
    }
    if(isNaN(quant) || quant < 0) quant = 0;
    if(local === "") local = "Não definido";
    
    let novoItem = {
        nome: nome,
        categoria: categoria,
        quant: quant,
        local: local
    };
    itens.push(novoItem);
    atualizarTela();
    
    // limpa alguns campos
    document.getElementById("nomeItem").value = "";
    document.getElementById("localItem").value = "";
    document.getElementById("quantItem").value = "1";
}

function removerItem(index) {
    if(confirm("Remover '" + itens[index].nome + "' do estoque?")) {
        itens.splice(index, 1);
        atualizarTela();
    }
}

function diminuirUm(index) {
    if(itens[index].quant > 0) {
        itens[index].quant--;
        atualizarTela();
    } else {
        alert("Já está zerado, não pode ficar negativo");
    }
}

function adicionarUm(index) {
    itens[index].quant++;
    atualizarTela();
}

function gerarRelatorio() {
    let totalItens = 0;
    let categoriasCount = {};
    let itensAbaixo = [];
    
    for(let item of itens) {
        totalItens += item.quant;
        let cat = item.categoria;
        if(categoriasCount[cat]) categoriasCount[cat] += item.quant;
        else categoriasCount[cat] = item.quant;
        
        if(item.quant < 3 && item.quant > 0) {
            itensAbaixo.push(item.nome + " (" + item.quant + ")");
        } else if(item.quant === 0) {
            itensAbaixo.push(item.nome + " (ESGOTADO)");
        }
    }
    
    let msg = "📊 Total de unidades: " + totalItens + " | ";
    let maisCategoria = "";
    let maxQtd = -1;
    for(let c in categoriasCount) {
        if(categoriasCount[c] > maxQtd) {
            maxQtd = categoriasCount[c];
            maisCategoria = c;
        }
    }
    msg += "Categoria com mais itens: " + maisCategoria + " (" + maxQtd + ")";
    
    if(itensAbaixo.length > 0) {
        msg += " | ⚠️ Itens críticos: " + itensAbaixo.join(", ");
    } else {
        msg += " | ✅ Nenhum item crítico no momento";
    }
    
    document.getElementById("msgRelatorio").innerHTML = msg;
    setTimeout(() => {
        let el = document.getElementById("msgRelatorio");
        el.style.opacity = "0.7";
        setTimeout(() => { el.style.opacity = "1"; }, 300);
    }, 50);
}

window.onload = function() {
    carregarLocal();
};