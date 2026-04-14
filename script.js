// ====================== VARIÁVEIS GLOBAIS ======================
let players = JSON.parse(localStorage.getItem("players_volei")) || [];
let currentTeams = JSON.parse(localStorage.getItem("teams_volei")) || [];
let victories = JSON.parse(localStorage.getItem("victories_volei")) || {};

// Variáveis da Partida Atual
let currentScoreA = 0;
let currentScoreB = 0;
let limitScore = 25;
let playingTeamA_Id = -1;
let playingTeamB_Id = -1;

// ====================== CONTROLE DE TELAS (SPA) ======================
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
    document.getElementById('screen-' + screenName).classList.remove('hidden');

    const navbar = document.getElementById('navbar');
    if(screenName === 'home') {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
    }

    if(screenName === 'placar-config') { loadCardsForScoreboard(); }
}

// ====================== PERSISTÊNCIA ======================
function savePlayers() { localStorage.setItem("players_volei", JSON.stringify(players)); }
function saveTeams() { localStorage.setItem("teams_volei", JSON.stringify(currentTeams)); }
function saveVictories() { localStorage.setItem("victories_volei", JSON.stringify(victories)); }

function updateCounter() { document.getElementById("playerCount").textContent = players.length; }

function renderPlayers() {
    const list = document.getElementById("playersList");
    list.innerHTML = "";
    players.forEach((name, index) => {
        let div = document.createElement("div");
        div.className = "player";
        div.innerHTML = `<span>${name}</span><span class="remove" onclick="removePlayer(${index})">✖</span>`;
        list.appendChild(div);
    });
    updateCounter();
}

function addPlayer() {
    const input = document.getElementById("playerInput");
    const name = input.value.trim();
    if (name === "") return;
    players.push(name);
    input.value = "";
    savePlayers();
    renderPlayers();
}

function removePlayer(index) {
    players.splice(index, 1);
    savePlayers();
    renderPlayers();
}

document.getElementById("addPlayerBtn").addEventListener("click", addPlayer);
document.getElementById("playerInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); addPlayer(); }
});

// ====================== LÓGICA DE SORTEIO ======================
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

document.getElementById("drawTeamsBtn").addEventListener("click", drawTeams);

function drawTeams() {
    const teamCount = parseInt(document.getElementById("teamCount").value);
    if (players.length < teamCount) {
        alert("Adicione mais jogadores para dividir os times!");
        return;
    }

    // Zera as vitórias ao fazer novo sorteio
    victories = {};
    saveVictories();

    const drawBtn = document.getElementById("drawTeamsBtn");
    drawBtn.disabled = true;

    let shuffled = shuffle([...players]);
    let teams = Array.from({ length: teamCount }, () => []);
    currentTeams = teams;
    saveTeams();

    const area = document.getElementById("teamsArea");
    area.innerHTML = "";

    teams.forEach((_, index) => {
        let div = document.createElement("div");
        div.className = "team";
        div.id = "team-" + index;
        div.innerHTML = `<h3>Time ${index + 1}</h3><div class="team-victory">🏆 Vitórias: 0</div>`;
        area.appendChild(div);
    });

    let i = 0;
    function animateNext() {
        if (i >= shuffled.length) {
            animateMatch();
            drawBtn.disabled = false;
            return;
        }

        let player = shuffled[i];
        let teamIndex = i % teamCount;
        teams[teamIndex].push(player);
        saveTeams();

        let teamDiv = document.getElementById("team-" + teamIndex);
        let falling = document.createElement("div");
        falling.className = "falling-player";
        falling.textContent = player;
        teamDiv.appendChild(falling);

        falling.addEventListener("animationend", () => {
            let chip = document.createElement("div");
            chip.className = "chip";
            chip.textContent = player;
            teamDiv.appendChild(chip);
            falling.remove();
            i++;
            animateNext();
        });
    }
    animateNext();
}

function renderTeamsMemory() {
    if (currentTeams.length === 0) return;
    const area = document.getElementById("teamsArea");
    area.innerHTML = "";
    currentTeams.forEach((teamMembers, index) => {
        let div = document.createElement("div");
        div.className = "team";
        div.id = "team-" + index;
        let vics = victories["Time " + (index + 1)] || 0;
        let html = `<h3>Time ${index + 1}</h3><div class="team-victory">🏆 Vitórias: ${vics}</div>`;
        teamMembers.forEach(player => { html += `<div class="chip">${player}</div>`; });
        div.innerHTML = html;
        area.appendChild(div);
    });
}

function animateMatch() {
    const teamCount = currentTeams.length;
    const teamIds = currentTeams.map((_, i) => i);

    teamIds.forEach(id => {
        const el = document.getElementById('team-' + id);
        el.classList.add('bounce');
        el.classList.remove('ball-possession', 'highlight1', 'highlight2');
    });

    setTimeout(() => {
        teamIds.forEach(id => document.getElementById('team-' + id).classList.remove('bounce'));
        let playingIds = [];

        if (teamCount === 2) {
            playingIds = [0, 1];
            document.getElementById('team-0').classList.add('highlight1');
            document.getElementById('team-1').classList.add('highlight1');
        } else if (teamCount === 3) {
            playingIds = shuffle([...teamIds]).slice(0, 2);
            playingIds.forEach(id => document.getElementById('team-' + id).classList.add('highlight1'));
        } else {
            let shuffledTeams = shuffle([...teamIds]);
            playingIds = [shuffledTeams[0], shuffledTeams[1], shuffledTeams[2], shuffledTeams[3]];
            document.getElementById('team-' + shuffledTeams[0]).classList.add('highlight1');
            document.getElementById('team-' + shuffledTeams[1]).classList.add('highlight1');
            document.getElementById('team-' + shuffledTeams[2]).classList.add('highlight2');
            document.getElementById('team-' + shuffledTeams[3]).classList.add('highlight2');
        }

        if (playingIds.length >= 2) {
            let p1 = playingIds[0], p2 = playingIds[1];
            let w1 = (currentTeams[p1].length < currentTeams[p2].length) ? p1 : 
                     (currentTeams[p2].length < currentTeams[p1].length) ? p2 : 
                     (Math.random() < 0.5 ? p1 : p2);
            document.getElementById('team-' + w1).classList.add('ball-possession');
            
            if(playingIds.length >= 4) {
                let p3 = playingIds[2], p4 = playingIds[3];
                let w2 = (currentTeams[p3].length < currentTeams[p4].length) ? p3 : 
                         (currentTeams[p4].length < currentTeams[p3].length) ? p4 : 
                         (Math.random() < 0.5 ? p3 : p4);
                document.getElementById('team-' + w2).classList.add('ball-possession');
            }
        }
    }, 2000);
}

// ====================== LÓGICA DE SELEÇÃO POR CARDS ======================
function loadCardsForScoreboard() {
    const areaA = document.getElementById('cardsAreaA');
    const areaB = document.getElementById('cardsAreaB');
    areaA.innerHTML = "";
    areaB.innerHTML = "";
    playingTeamA_Id = -1;
    playingTeamB_Id = -1;

    if (currentTeams.length < 2) {
        areaA.innerHTML = "<p>Sorteie os times primeiro!</p>";
        return;
    }

    currentTeams.forEach((_, index) => {
        let name = "Time " + (index + 1);
        
        let cardA = document.createElement('div');
        cardA.className = "select-card";
        cardA.id = "cardA-" + index;
        cardA.innerText = name;
        cardA.onclick = () => selectTeam('A', index);
        areaA.appendChild(cardA);

        let cardB = document.createElement('div');
        cardB.className = "select-card";
        cardB.id = "cardB-" + index;
        cardB.innerText = name;
        cardB.onclick = () => selectTeam('B', index);
        areaB.appendChild(cardB);
    });

    if(currentTeams.length >= 2) {
        selectTeam('A', 0);
        selectTeam('B', 1);
    }
}

function selectTeam(side, index) {
    if (side === 'A') {
        playingTeamA_Id = index;
        document.querySelectorAll('#cardsAreaA .select-card').forEach(c => c.classList.remove('active-a'));
        document.getElementById('cardA-' + index).classList.add('active-a');
    } else {
        playingTeamB_Id = index;
        document.querySelectorAll('#cardsAreaB .select-card').forEach(c => c.classList.remove('active-b'));
        document.getElementById('cardB-' + index).classList.add('active-b');
    }
}

// ====================== LÓGICA DO PLACAR E JOGO ======================
function startMatch() {
    if (currentTeams.length < 2) {
        alert("Você precisa sortear os times antes de jogar!");
        showScreen('sorteio');
        return;
    }

    if (playingTeamA_Id === playingTeamB_Id) {
        alert("Selecione times diferentes para a partida!");
        return;
    }

    limitScore = parseInt(document.getElementById('maxScoreInput').value) || 25;
    
    currentScoreA = 0;
    currentScoreB = 0;
    updateScoreboardUI();

    let nameA = "Time " + (parseInt(playingTeamA_Id) + 1);
    let nameB = "Time " + (parseInt(playingTeamB_Id) + 1);
    
    document.getElementById('nameTeamA').innerText = nameA;
    document.getElementById('nameTeamB').innerText = nameB;
    
    document.getElementById('vicA').innerText = victories[nameA] || 0;
    document.getElementById('vicB').innerText = victories[nameB] || 0;

    showScreen('match');
}

function updateScoreboardUI() {
    document.getElementById('scoreA').innerText = currentScoreA;
    document.getElementById('scoreB').innerText = currentScoreB;
    document.getElementById('matchTitle').innerText = `Placar (Até ${limitScore})`;
}

function addPoint(side) {
    if (side === 'A') currentScoreA++;
    if (side === 'B') currentScoreB++;
    
    updateScoreboardUI();
    checkWinCondition();
}

function subPoint(side) {
    if (side === 'A' && currentScoreA > 0) currentScoreA--;
    if (side === 'B' && currentScoreB > 0) currentScoreB--;
    updateScoreboardUI();
}

function checkWinCondition() {
    let diff = Math.abs(currentScoreA - currentScoreB);

    if (currentScoreA >= limitScore && currentScoreA > currentScoreB && diff >= 2) {
        declareWinner('A');
    } else if (currentScoreB >= limitScore && currentScoreB > currentScoreA && diff >= 2) {
        declareWinner('B');
    } else if (currentScoreA >= limitScore && currentScoreB >= limitScore && diff < 2) {
        document.getElementById('matchTitle').innerText = "VAI A DOIS!";
    }
}

function declareWinner(side) {
    let winningTeamId = side === 'A' ? playingTeamA_Id : playingTeamB_Id;
    let winningTeamName = "Time " + (parseInt(winningTeamId) + 1);
    
    if (!victories[winningTeamName]) victories[winningTeamName] = 0;
    victories[winningTeamName]++;
    saveVictories();
    renderTeamsMemory(); 

    setTimeout(() => {
        alert("🏆 FIM DE JOGO!\nVitória do " + winningTeamName + "!");
        showPodium(); 
    }, 100); 
}

// ====================== SALA DE STANDBY (PÓDIO COM JOGADORES) ======================
function showPodium() {
    if(currentTeams.length === 0) {
        alert("Sorteie os times primeiro!");
        return showScreen('sorteio');
    }

    const area = document.getElementById('podiumArea');
    area.innerHTML = "";

    // Mapeia vitórias e inclui os membros do time na nova variável 'players'
    let rank = currentTeams.map((members, i) => {
        let name = "Time " + (i + 1);
        return { name: name, vics: victories[name] || 0, players: members };
    });

    // Ordena do maior pro menor número de vitórias
    rank.sort((a, b) => b.vics - a.vics);

    // Cria a parte visual do pódio
    rank.forEach((team, index) => {
        let div = document.createElement('div');
        div.className = 'podium-item';
        
        let medal = "";
        if (index === 0 && team.vics > 0) { medal = "🥇"; div.classList.add('rank-1'); }
        else if (index === 1 && team.vics > 0) { medal = "🥈"; div.classList.add('rank-2'); }
        else if (index === 2 && team.vics > 0) { medal = "🥉"; div.classList.add('rank-3'); }
        else { medal = "🏅"; div.classList.add('rank-4'); }

        // Junta os nomes dos jogadores com uma bolinha como separador
        let playersList = team.players.length > 0 ? team.players.join(" • ") : "Nenhum jogador";

        div.innerHTML = `
            <div class="podium-header">
                <span>${medal} ${team.name}</span>
                <span>🏆 ${team.vics} Vitórias</span>
            </div>
            <div class="podium-members">
                👥 ${playersList}
            </div>
        `;
        
        area.appendChild(div);
    });

    showScreen('podium');
}

// INICIALIZAÇÃO
renderPlayers();
renderTeamsMemory();
