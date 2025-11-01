
function leerTablero5x5DesdeUI() {
  const nums = Array.from({ length: 5 }, () => Array(5).fill(0));
  const rowT = Array(5).fill(null);
  const colT = Array(5).fill(null);
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const el = document.getElementById(`cell${r}${c}`);
      const v = el && el.value !== '' ? parseInt(el.value, 10) : NaN;
      nums[r][c] = Number.isNaN(v) ? 0 : v;
    }
    const rv = document.getElementById(`rowT${r}`).value;
    rowT[r] = rv === '' ? null : parseInt(rv, 10);
  }
  for (let c = 0; c < 5; c++) {
    const cv = document.getElementById(`colT${c}`).value;
    colT[c] = cv === '' ? null : parseInt(cv, 10);
  }
  return { nums, rowT, colT };
}

function mostrarSolucionEnUI(mask) {
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const el = document.getElementById(`cell${r}${c}`);
      if (!el) continue;
      el.classList.remove('solution');
      if (mask && mask[r][c]) el.classList.add('solution');
    }
  }
}

function encontrarSolucion5x5(nums, rowT, colT) {
  // exigir objetivos completos
  for (let i = 0; i < 5; i++) if (rowT[i] === null || colT[i] === null) return null;

  const ROWS = 5, COLS = 5;
  const mask = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  const rowSum = Array(ROWS).fill(0);
  const colSum = Array(COLS).fill(0);

  function computeRemainingPotential(startPos) {
    const remRow = Array(ROWS).fill(0);
    const remCol = Array(COLS).fill(0);
    for (let p = startPos; p < ROWS * COLS; p++) {
      const r = Math.floor(p / COLS), c = p % COLS;
      remRow[r] += nums[r][c];
      remCol[c] += nums[r][c];
    }
    return { remRow, remCol };
  }

  let found = null;

  function backtrack(pos) {
    if (found) return true;
    if (pos === ROWS * COLS) {
      for (let r = 0; r < ROWS; r++) if (rowSum[r] !== rowT[r]) return false;
      for (let c = 0; c < COLS; c++) if (colSum[c] !== colT[c]) return false;
      found = mask.map(row => row.slice());
      return true;
    }

    const r = Math.floor(pos / COLS), c = pos % COLS;
    const val = nums[r][c];
    const { remRow, remCol } = computeRemainingPotential(pos);

    if (rowSum[r] + remRow[r] >= rowT[r] && colSum[c] + remCol[c] >= colT[c]) {
      if (backtrack(pos + 1)) return true;
    }

    rowSum[r] += val; colSum[c] += val; mask[r][c] = 1;
    let ok = true;
    if (rowSum[r] > rowT[r] || colSum[c] > colT[c]) ok = false;
    else {
      const { remRow: remRow2, remCol: remCol2 } = computeRemainingPotential(pos + 1);
      for (let rr = 0; rr < ROWS; rr++) {
        if (rowSum[rr] + remRow2[rr] < rowT[rr]) { ok = false; break; }
      }
      for (let cc = 0; cc < COLS && ok; cc++) {
        if (colSum[cc] + remCol2[cc] < colT[cc]) { ok = false; break; }
      }
    }

    if (ok) {
      if (backtrack(pos + 1)) return true;
    }

    rowSum[r] -= val; colSum[c] -= val; mask[r][c] = 0;
    return false;
  }

  backtrack(0);
  return found;
}

function dibujarTablero(div, datos) {
  const { numeros, sumasFilas, sumasColumnas, seleccion } = datos;
  const filas = numeros.length, columnas = numeros[0].length;
  let html = '<table>';
  // top-left empty
  html += '<tr><th></th>';
  for (let c = 0; c < columnas; c++) {
    html += `<th class="target" data-col="${c}">${sumasColumnas[c]}<div class="curSum" data-col-sum="${c}"></div></th>`;
  }
  html += '</tr>';

  for (let r = 0; r < filas; r++) {
    html += '<tr>';
    html += `<th class="target" data-row="${r}">${sumasFilas[r]}<div class="curSum" data-row-sum="${r}"></div></th>`;
    for (let c = 0; c < columnas; c++) {
      const val = numeros[r][c];
      const inactive = seleccion && seleccion[r] && seleccion[r][c] === false ? ' inactive' : '';
      html += `<td class="celda${inactive}" data-f="${r}" data-c="${c}">${val}</td>`;
    }
    html += '</tr>';
  }
  html += '</table>';
  div.innerHTML = html;

  div.querySelectorAll('.celda').forEach(td => {
    td.addEventListener('click', () => {
      const f = parseInt(td.dataset.f, 10);
      const c = parseInt(td.dataset.c, 10);
      if (!datos.seleccion) datos.seleccion = Array.from({ length: filas }, () => Array(columnas).fill(true));
      datos.seleccion[f][c] = !datos.seleccion[f][c];
      td.classList.toggle('inactive', !datos.seleccion[f][c]);
      actualizarSumaActualYEstado(datos);
    });
  });

  actualizarSumaActualYEstado(datos);
}

function actualizarSumaActualYEstado(datos) {
  const { numeros, sumasFilas, sumasColumnas, seleccion } = datos;
  const filas = numeros.length, columnas = numeros[0].length;
  const selFilas = Array(filas).fill(0);
  const selCols = Array(columnas).fill(0);
  for (let r = 0; r < filas; r++) {
    for (let c = 0; c < columnas; c++) {
      if (seleccion && seleccion[r] && seleccion[r][c]) {
        selFilas[r] += numeros[r][c];
        selCols[c] += numeros[r][c];
      }
    }
  }
  for (let c = 0; c < columnas; c++) {
    const th = document.querySelector(`th.target[data-col=\"${c}\"]`);
    if (!th) continue;
    const cur = th.querySelector(`.curSum[data-col-sum=\"${c}\"]`);
    if (cur) cur.textContent = ` (${selCols[c]})`;
    if (selCols[c] === sumasColumnas[c]) th.classList.add('ok'); else th.classList.remove('ok');
  }
  for (let r = 0; r < filas; r++) {
    const th = document.querySelector(`th.target[data-row=\"${r}\"]`);
    if (!th) continue;
    const cur = th.querySelector(`.curSum[data-row-sum=\"${r}\"]`);
    if (cur) cur.textContent = ` (${selFilas[r]})`;
    if (selFilas[r] === sumasFilas[r]) th.classList.add('ok'); else th.classList.remove('ok');
  }
  const mensajeDiv = document.getElementById('mensaje');
  const allRowsOk = selFilas.every((s, i) => s === sumasFilas[i]);
  const allColsOk = selCols.every((s, i) => s === sumasColumnas[i]);
  if (allRowsOk && allColsOk) mensajeDiv.textContent = '¡Ganaste! Todos los objetivos coinciden.'; else mensajeDiv.textContent = '';
}

document.getElementById('btnResolver').addEventListener('click', () => {
  const { nums, rowT, colT } = leerTablero5x5DesdeUI();
  const solverMsg = document.getElementById('solverMsg');
  solverMsg.textContent = 'Buscando...';
  setTimeout(() => {
    const sol = backtrackSolve(nums, rowT, colT);
    if (!sol) {
      solverMsg.textContent = 'No se encontró solución (o faltan objetivos).';
      mostrarSolucionEnUI(null);
      window.lastSolution5x5 = null;
    } else {
      solverMsg.textContent = 'Solución encontrada.';
      window.lastSolution5x5 = sol;
      mostrarSolucionEnUI(sol);
    }
  }, 10);
});


document.getElementById('btnCargarEnJuego').addEventListener('click', () => {
  const solverMsg = document.getElementById('solverMsg');
  const { nums, rowT, colT } = leerTablero5x5DesdeUI();
  // validar objetivos
  for (let i = 0; i < 5; i++) {
    if (rowT[i] === null || colT[i] === null) {
      solverMsg.textContent = 'Rellena los 5 objetivos de filas y columnas antes de cargar.';
      return;
    }
  }
  const datos = {
    numeros: nums,
    sumasFilas: rowT.slice(),
    sumasColumnas: colT.slice(),
    seleccion: Array.from({ length: 5 }, () => Array(5).fill(true)),
    solucion: window.lastSolution5x5 || Array.from({ length: 5 }, () => Array(5).fill(false))
  };
  window.rulloDatos = datos;
  dibujarTablero(document.getElementById('tablero'), datos);
  document.getElementById('solverMsg').textContent = 'Tablero cargado en el área jugable.';
});
// Simpler, explicit helpers for 6x6, 7x7, 8x8 to keep code straightforward

function leerTablero6() {
  const n = 6;
  const nums = Array.from({ length: n }, () => Array(n).fill(0));
  const rowT = Array(n).fill(null);
  const colT = Array(n).fill(null);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const el = document.getElementById('cell6' + r + c);
      const v = el && el.value !== '' ? parseInt(el.value, 10) : NaN;
      nums[r][c] = Number.isNaN(v) ? 0 : v;
    }
    const rv = document.getElementById('row6T' + r).value;
    rowT[r] = rv === '' ? null : parseInt(rv, 10);
  }
  for (let c = 0; c < n; c++) {
    const cv = document.getElementById('col6T' + c).value;
    colT[c] = cv === '' ? null : parseInt(cv, 10);
  }
  return { nums, rowT, colT };
}

function mostrarSolucion6(mask) {
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
    const el = document.getElementById('cell6' + r + c);
    if (!el) continue; el.classList.remove('solution'); if (mask && mask[r] && mask[r][c]) el.classList.add('solution');
  }
}

function leerTablero7() {
  const n = 7; const nums = Array.from({ length: n }, () => Array(n).fill(0)); const rowT = Array(n).fill(null); const colT = Array(n).fill(null);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) { const el = document.getElementById('cell7' + r + c); const v = el && el.value !== '' ? parseInt(el.value, 10) : NaN; nums[r][c] = Number.isNaN(v) ? 0 : v; }
    const rv = document.getElementById('row7T' + r).value; rowT[r] = rv === '' ? null : parseInt(rv, 10);
  }
  for (let c = 0; c < n; c++) { const cv = document.getElementById('col7T' + c).value; colT[c] = cv === '' ? null : parseInt(cv, 10); }
  return { nums, rowT, colT };
}

function mostrarSolucion7(mask) {
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
    const el = document.getElementById('cell7' + r + c); if (!el) continue; el.classList.remove('solution'); if (mask && mask[r] && mask[r][c]) el.classList.add('solution');
  }
}

function leerTablero8() {
  const n = 8; const nums = Array.from({ length: n }, () => Array(n).fill(0)); const rowT = Array(n).fill(null); const colT = Array(n).fill(null);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) { const el = document.getElementById('cell8' + r + c); const v = el && el.value !== '' ? parseInt(el.value, 10) : NaN; nums[r][c] = Number.isNaN(v) ? 0 : v; }
    const rv = document.getElementById('row8T' + r).value; rowT[r] = rv === '' ? null : parseInt(rv, 10);
  }
  for (let c = 0; c < n; c++) { const cv = document.getElementById('col8T' + c).value; colT[c] = cv === '' ? null : parseInt(cv, 10); }
  return { nums, rowT, colT };
}

function mostrarSolucion8(mask) {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const el = document.getElementById('cell8' + r + c); if (!el) continue; el.classList.remove('solution'); if (mask && mask[r] && mask[r][c]) el.classList.add('solution');
  }
}

function backtrackSolve(nums, rowT, colT) {
  const N = nums.length; for (let i = 0; i < N; i++) if (rowT[i] === null || colT[i] === null) return null;
  const mask = Array.from({ length: N }, () => Array(N).fill(0)); const rSum = Array(N).fill(0); const cSum = Array(N).fill(0); let found = null;

  function remPot(start) { const r = Array(N).fill(0), c = Array(N).fill(0); for (let p = start; p < N*N; p++) { const rr = Math.floor(p/N), cc = p%N; r[rr]+=nums[rr][cc]; c[cc]+=nums[rr][cc]; } return {r,c}; }

  function bt(pos) {
    if (found) return true; if (pos === N*N) { if (rSum.every((s,i)=>s===rowT[i]) && cSum.every((s,i)=>s===colT[i])) { found = mask.map(r=>r.slice()); return true; } return false; }
    const rr = Math.floor(pos/N), cc = pos%N, val = nums[rr][cc]; const pot = remPot(pos);
    if (rSum[rr]+pot.r[rr] >= rowT[rr] && cSum[cc]+pot.c[cc] >= colT[cc]) if (bt(pos+1)) return true;
    rSum[rr]+=val; cSum[cc]+=val; mask[rr][cc]=1;
    let ok = !(rSum[rr]>rowT[rr] || cSum[cc]>colT[cc]);
    if (ok) { const pot2 = remPot(pos+1); for (let i=0;i<N;i++) if (rSum[i]+pot2.r[i]<rowT[i]) { ok=false; break; } for (let j=0;j<N&&ok;j++) if (cSum[j]+pot2.c[j]<colT[j]) ok=false; }
    if (ok && bt(pos+1)) return true;
    rSum[rr]-=val; cSum[cc]-=val; mask[rr][cc]=0; return false;
  }

  bt(0); return found;
}

const btnR6 = document.getElementById('btnResolver6'); if (btnR6) btnR6.addEventListener('click', ()=>{ const {nums,rowT,colT}=leerTablero6(); const m=document.getElementById('solver6Msg'); m.textContent='Buscando...'; setTimeout(()=>{ const sol=backtrackSolve(nums,rowT,colT); if(!sol){ m.textContent='No se encontró solución.'; window.lastSolution6x6=null; mostrarSolucion6(null);} else { m.textContent='Solución encontrada.'; window.lastSolution6x6=sol; mostrarSolucion6(sol);} },10); });
const btnC6 = document.getElementById('btnCargar6EnJuego'); if (btnC6) btnC6.addEventListener('click', ()=>{ const {nums,rowT,colT}=leerTablero6(); const m=document.getElementById('solver6Msg'); for(let i=0;i<6;i++) if(rowT[i]===null||colT[i]===null){ m.textContent='Rellena los 6 objetivos antes de cargar.'; return;} const datos={numeros:nums,sumasFilas:rowT.slice(),sumasColumnas:colT.slice(),seleccion:Array.from({length:6},()=>Array(6).fill(true)),solucion:window.lastSolution6x6||Array.from({length:6},()=>Array(6).fill(false))}; window.rulloDatos=datos; dibujarTablero(document.getElementById('tablero'),datos); m.textContent='Tablero 6x6 cargado en el área jugable.'; });

const btnR7 = document.getElementById('btnResolver7'); if (btnR7) btnR7.addEventListener('click', ()=>{ const {nums,rowT,colT}=leerTablero7(); const m=document.getElementById('solver7Msg'); m.textContent='Buscando...'; setTimeout(()=>{ const sol=backtrackSolve(nums,rowT,colT); if(!sol){ m.textContent='No se encontró solución.'; window.lastSolution7x7=null; mostrarSolucion7(null);} else { m.textContent='Solución encontrada.'; window.lastSolution7x7=sol; mostrarSolucion7(sol);} },10); });
const btnC7 = document.getElementById('btnCargar7EnJuego'); if (btnC7) btnC7.addEventListener('click', ()=>{ const {nums,rowT,colT}=leerTablero7(); const m=document.getElementById('solver7Msg'); for(let i=0;i<7;i++) if(rowT[i]===null||colT[i]===null){ m.textContent='Rellena los 7 objetivos antes de cargar.'; return;} const datos={numeros:nums,sumasFilas:rowT.slice(),sumasColumnas:colT.slice(),seleccion:Array.from({length:7},()=>Array(7).fill(true)),solucion:window.lastSolution7x7||Array.from({length:7},()=>Array(7).fill(false))}; window.rulloDatos=datos; dibujarTablero(document.getElementById('tablero'),datos); m.textContent='Tablero 7x7 cargado en el área jugable.'; });

const btnR8 = document.getElementById('btnResolver8'); if (btnR8) btnR8.addEventListener('click', ()=>{ const {nums,rowT,colT}=leerTablero8(); const m=document.getElementById('solver8Msg'); m.textContent='Buscando...'; setTimeout(()=>{ const sol=backtrackSolve(nums,rowT,colT); if(!sol){ m.textContent='No se encontró solución.'; window.lastSolution8x8=null; mostrarSolucion8(null);} else { m.textContent='Solución encontrada.'; window.lastSolution8x8=sol; mostrarSolucion8(sol);} },10); });
const btnC8 = document.getElementById('btnCargar8EnJuego'); if (btnC8) btnC8.addEventListener('click', ()=>{ const {nums,rowT,colT}=leerTablero8(); const m=document.getElementById('solver8Msg'); for(let i=0;i<8;i++) if(rowT[i]===null||colT[i]===null){ m.textContent='Rellena los 8 objetivos antes de cargar.'; return;} const datos={numeros:nums,sumasFilas:rowT.slice(),sumasColumnas:colT.slice(),seleccion:Array.from({length:8},()=>Array(8).fill(true)),solucion:window.lastSolution8x8||Array.from({length:8},()=>Array(8).fill(false))}; window.rulloDatos=datos; dibujarTablero(document.getElementById('tablero'),datos); m.textContent='Tablero 8x8 cargado en el área jugable.'; });

function hideAllSolverSections() {
  const ids = ['solverArea','solver6Area','solver7Area','solver8Area'];
  ids.forEach(id=>{ const el=document.getElementById(id); if(el) el.classList.add('hidden'); });
  const page = document.getElementById('pageContent'); if (page) page.classList.add('hidden');
  const t = document.getElementById('tablero'); if (t) t.classList.add('hidden');
  const m = document.getElementById('mensaje'); if (m) m.classList.add('hidden');
}

function showSection(sectionId) {
  hideAllSolverSections();
  const chooser = document.getElementById('chooser'); if (chooser) chooser.classList.add('hidden');
  const page = document.getElementById('pageContent'); if (page) page.classList.remove('hidden');
  const sec = document.getElementById(sectionId); if (sec) sec.classList.remove('hidden');
  const t = document.getElementById('tablero'); if (t) t.classList.remove('hidden');
  const m = document.getElementById('mensaje'); if (m) m.classList.remove('hidden');
  setTimeout(()=>{ const el=document.getElementById(sectionId); if(el) el.scrollIntoView({behavior:'smooth'}); },50);
}

document.addEventListener('DOMContentLoaded', ()=>{
  hideAllSolverSections();
  const c5 = document.getElementById('choose5'); if (c5) c5.addEventListener('click', ()=> showSection('solverArea'));
  const c6 = document.getElementById('choose6'); if (c6) c6.addEventListener('click', ()=> showSection('solver6Area'));
  const c7 = document.getElementById('choose7'); if (c7) c7.addEventListener('click', ()=> showSection('solver7Area'));
  const c8 = document.getElementById('choose8'); if (c8) c8.addEventListener('click', ()=> showSection('solver8Area'));
  const back = document.getElementById('btnBack'); if (back) back.addEventListener('click', ()=>{ const chooser = document.getElementById('chooser'); if(chooser) chooser.classList.remove('hidden'); hideAllSolverSections(); });
});
