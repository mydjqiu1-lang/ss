const COLORS = ["#62f8ff", "#8d7dff", "#ff78d1", "#ffe16a", "#6dff8e", "#ff8f70"];
const NAMES = ["洛秋", "周岚", "白泽", "林烬", "顾北", "宁音", "沈昼", "江遥"];
const EVENTS = [
  { type: "combat", text: "遭遇异形突袭", key: "combat", pass: 8 },
  { type: "trap", text: "触发走廊激光陷阱", key: "perception", pass: 7 },
  { type: "resource", text: "搜索到残缺补给仓", key: "luck", pass: 6 },
  { type: "mental", text: "直面精神污染低语", key: "mental", pass: 8 }
];

const state = {
  round: 0,
  points: 0,
  survivors: []
};

const orbField = document.getElementById("orbField");
const summary = document.getElementById("summary");
const logList = document.getElementById("logList");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function createSurvivor() {
  const size = randomInt(30, 78);
  return {
    id: crypto.randomUUID(),
    name: pick(NAMES) + "-" + randomInt(10, 99),
    color: pick(COLORS),
    size,
    stats: {
      hp: Math.round(20 + size * 0.7),
      mental: randomInt(3, 10),
      combat: randomInt(3, 10),
      perception: randomInt(3, 10),
      luck: randomInt(3, 10)
    }
  };
}

function renderSurvivors() {
  orbField.innerHTML = "";
  for (const s of state.survivors) {
    const card = document.createElement("div");
    card.className = "orb-card";

    const orb = document.createElement("div");
    orb.className = "orb";
    orb.style.width = `${s.size}px`;
    orb.style.height = `${s.size}px`;
    orb.style.color = s.color;
    orb.style.background = `radial-gradient(circle at 30% 30%, #fff, ${s.color} 55%, #111 100%)`;

    const name = document.createElement("div");
    name.className = "orb-name";
    name.textContent = s.name;

    const meta = document.createElement("div");
    meta.className = "orb-meta";
    meta.textContent = `HP:${s.stats.hp} 战:${s.stats.combat} 感:${s.stats.perception} 心:${s.stats.mental} 运:${s.stats.luck}`;

    card.append(orb, name, meta);
    orbField.append(card);
  }
}

function appendLog(text) {
  const li = document.createElement("li");
  li.textContent = text;
  logList.prepend(li);
}

function updateSummary() {
  const alive = state.survivors.filter((s) => s.stats.hp > 0).length;
  summary.innerHTML = `
    <div>当前幕数：<strong>${state.round}</strong></div>
    <div>团队积分：<strong>${state.points}</strong></div>
    <div>存活人数：<strong>${alive}/${state.survivors.length}</strong></div>
  `;
}

function rollEvent() {
  if (!state.survivors.length) {
    appendLog("你还没有角色，先创建光球幸存者。");
    return;
  }

  state.round += 1;
  appendLog(`=== 第 ${state.round} 幕副本开启 ===`);

  for (const s of state.survivors) {
    if (s.stats.hp <= 0) continue;

    const e = pick(EVENTS);
    const value = e.key === "mental" ? s.stats.mental : s.stats[e.key];
    const roll = randomInt(1, 10) + value;

    if (roll >= e.pass + state.round / 2) {
      const gain = randomInt(4, 10);
      s.stats.hp = Math.min(100, s.stats.hp + randomInt(0, 4));
      state.points += gain;
      appendLog(`${s.name} 在「${e.text}」中成功，获得 ${gain} 积分。`);
    } else {
      const loss = randomInt(5, 14);
      s.stats.hp -= loss;
      appendLog(`${s.name} 在「${e.text}」中失败，失去 ${loss} HP。`);
      if (s.stats.hp <= 0) {
        appendLog(`☠ ${s.name} 光球熄灭，已出局。`);
      }
    }
  }

  renderSurvivors();
  updateSummary();
}

function resetGame() {
  state.round = 0;
  state.points = 0;
  state.survivors = [];
  logList.innerHTML = "";
  appendLog("循环已重置。欢迎进入下一次无限挑战。");
  renderSurvivors();
  updateSummary();
}

document.getElementById("addSurvivorBtn").addEventListener("click", () => {
  const s = createSurvivor();
  state.survivors.push(s);
  appendLog(`新增角色 ${s.name}，光球尺寸 ${s.size}px。`);
  renderSurvivors();
  updateSummary();
});

document.getElementById("nextSceneBtn").addEventListener("click", rollEvent);
document.getElementById("resetBtn").addEventListener("click", resetGame);

resetGame();
