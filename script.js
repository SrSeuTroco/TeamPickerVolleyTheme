let players = JSON.parse(localStorage.getItem("players_volei")) || [];
let currentTeams = [];

// ====================== FUNÇÕES DE JOGADORES ======================
function save(){ localStorage.setItem("players_volei", JSON.stringify(players)); }
function updateCounter(){ document.getElementById("playerCount").textContent = players.length; }

function renderPlayers(){
  const list = document.getElementById("playersList");
  list.innerHTML="";
  players.forEach((name,index)=>{
    let div=document.createElement("div");
    div.className="player";
    div.innerHTML=`<span>${name}</span><span class="remove" onclick="removePlayer(${index})">✖</span>`;
    list.appendChild(div);
  });
  updateCounter();
}

function addPlayer(){
  const input = document.getElementById("playerInput");
  const name = input.value.trim();
  if(name==="") return;
  players.push(name);
  input.value="";
  save();
  renderPlayers();
}

function removePlayer(index){
  players.splice(index,1);
  save();
  renderPlayers();
}

// ====================== EVENTOS ======================
document.getElementById("addPlayerBtn").addEventListener("click", addPlayer);
document.getElementById("playerInput").addEventListener("keydown", function(e){
  if(e.key === "Enter") {
    e.preventDefault();
    addPlayer();
  }
});

// ====================== UTILITÁRIOS ======================
function shuffle(array){
  for(let i=array.length-1;i>0;i--){
    let j=Math.floor(Math.random()*(i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
  return array;
}

// ====================== SORTEIO DE TIMES ======================
document.getElementById("drawTeamsBtn").addEventListener("click", drawTeams);

function drawTeams(){
  const teamCount = parseInt(document.getElementById("teamCount").value);
  const totalPlayers = players.length;

  if(totalPlayers < teamCount){
    alert("Poucos jogadores para a quantidade de times.");
    return;
  }

  const drawBtn = document.getElementById("drawTeamsBtn");
  drawBtn.disabled = true;

  let shuffled = shuffle([...players]);
  let teams = Array.from({length: teamCount}, ()=>[]);
  currentTeams = teams;

  const area = document.getElementById("teamsArea");
  area.innerHTML="";

  // criar times HTML
  teams.forEach((_,index)=>{
    let div=document.createElement("div");
    div.className="team";
    div.id="team-"+index;
    div.innerHTML=`<h3>Time ${index+1}</h3>`;
    area.appendChild(div);
  });

  // ========================= Distribuição cíclica =========================
  let i = 0;
  function animateNext(){
    if(i >= shuffled.length) {
      if(teamCount>2) animateMatch(); // animação de cores
      drawBtn.disabled = false;
      return;
    }

    let player = shuffled[i];
    let teamIndex = i % teamCount; // alterna em ciclo
    teams[teamIndex].push(player);

    let teamDiv = document.getElementById("team-"+teamIndex);
    let falling = document.createElement("div");
    falling.className = "falling-player";
    falling.textContent = player;
    teamDiv.appendChild(falling);

    falling.addEventListener("animationend", ()=>{
      let chip = document.createElement("div");
      chip.className="chip";
      chip.textContent = player;
      teamDiv.appendChild(chip);
      falling.remove();
      i++;
      animateNext();
    });
  }

  animateNext();
}

// ====================== ANIMAÇÃO DE CORES ======================
function animateMatch(){
  const teamCount = currentTeams.length;
  const teamIds = currentTeams.map((_,i)=>i);

  // efeito de bounce
  teamIds.forEach(id=>{
    let div = document.getElementById('team-'+id);
    div.classList.add('bounce');
  });

  setTimeout(()=>{
    // remover bounce
    teamIds.forEach(id=>document.getElementById('team-'+id).classList.remove('bounce'));

    // aplicar cores apenas
    if(teamCount===3){
      let chosen = shuffle(teamIds).slice(0,2);
      chosen.forEach(id=>document.getElementById('team-'+id).classList.add('highlight1'));
    } else if(teamCount===4){
      let chosen = shuffle(teamIds);
      document.getElementById('team-'+chosen[0]).classList.add('highlight1');
      document.getElementById('team-'+chosen[1]).classList.add('highlight1');
      document.getElementById('team-'+chosen[2]).classList.add('highlight2');
      document.getElementById('team-'+chosen[3]).classList.add('highlight2');
    }

    // sem texto abaixo
    document.getElementById('matchArea').innerHTML = '';

  },3000);
}

renderPlayers();