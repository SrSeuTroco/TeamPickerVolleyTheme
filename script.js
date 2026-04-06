let players = JSON.parse(localStorage.getItem("players_volei")) || [];
let currentTeams = [];

// ====================== PERSISTÊNCIA E INTERFACE ======================
function save() { localStorage.setItem("players_volei", JSON.stringify(players)); }
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
    save();
    renderPlayers();
}

function removePlayer(index) {
    players.splice(index, 1);
    save();
    renderPlayers();
}

// ====================== EVENTOS ======================
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

    const drawBtn = document.getElementById("drawTeamsBtn");
    drawBtn.disabled = true;

    let shuffled = shuffle([...players]);
    let teams = Array.from({ length: teamCount }, () => []);
    currentTeams = teams;

    const area = document.getElementById("teamsArea");
    area.innerHTML = "";

    // Criar os containers dos times
    teams.forEach((_, index) => {
        let div = document.createElement("div");
        div.className = "team";
        div.id = "team-" + index;
        div.innerHTML = `<h3>Time ${index + 1}</h3>`;
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

// ====================== LÓGICA DE PARTIDA E BOLA ======================
function animateMatch() {
    const teamCount = currentTeams.length;
    const teamIds = currentTeams.map((_, i) => i);

    // Efeito de pulo para todos
    teamIds.forEach(id => {
        const el = document.getElementById('team-' + id);
        el.classList.add('bounce');
        el.classList.remove('ball-possession', 'highlight1', 'highlight2');
    });

    setTimeout(() => {
        teamIds.forEach(id => document.getElementById('team-' + id).classList.remove('bounce'));

        let playingIds = [];

        // Define quais times jogam agora e as cores
        if (teamCount === 2) {
            playingIds = [0, 1];
            document.getElementById('team-0').classList.add('highlight1');
            document.getElementById('team-1').classList.add('highlight1');
        } else if (teamCount === 3) {
            playingIds = shuffle([...teamIds]).slice(0, 2);
            playingIds.forEach(id => document.getElementById('team-' + id).classList.add('highlight1'));
        } else {
            let shuffledTeams = shuffle([...teamIds]);
            playingIds = [shuffledTeams[0], shuffledTeams[1]];
            document.getElementById('team-' + shuffledTeams[0]).classList.add('highlight1');
            document.getElementById('team-' + shuffledTeams[1]).classList.add('highlight1');
            document.getElementById('team-' + shuffledTeams[2]).classList.add('highlight2');
            document.getElementById('team-' + shuffledTeams[3]).classList.add('highlight2');
        }

        // LÓGICA DA POSSE DE BOLA
        if (playingIds.length >= 2) {
            const t1Id = playingIds[0];
            const t2Id = playingIds[1];
            const size1 = currentTeams[t1Id].length;
            const size2 = currentTeams[t2Id].length;

            let winnerId;
            if (size1 < size2) {
                winnerId = t1Id; // Time menor começa
            } else if (size2 < size1) {
                winnerId = t2Id; // Time menor começa
            } else {
                winnerId = Math.random() < 0.5 ? t1Id : t2Id; // Empate = Sorteio
            }

            document.getElementById('team-' + winnerId).classList.add('ball-possession');
        }
    }, 2000);
}

renderPlayers();
