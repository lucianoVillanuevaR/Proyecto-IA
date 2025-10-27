// Rullo: implementación básica jugable

function numeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function crearMascaraSolucion(filas, columnas, densidad) {
  const mascara = Array.from({ length: filas }, () => Array(columnas).fill(false));
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      mascara[f][c] = Math.random() < densidad;
    }
  }
  // garantizar al menos una celda por fila
  for (let f = 0; f < filas; f++) {
    if (!mascara[f].some(v => v)) {
      mascara[f][Math.floor(Math.random() * columnas)] = true;
    }
  }
  // garantizar al menos una celda por columna
  for (let c = 0; c < columnas; c++) {
    let activo = false;
    for (let f = 0; f < filas; f++) if (mascara[f][c]) { activo = true; break; }
    if (!activo) mascara[Math.floor(Math.random() * filas)][c] = true;
  }
  return mascara;
}

function generarTablero(filas, columnas, min, max, densidad) {
  const numeros = Array.from({ length: filas }, () => Array(columnas).fill(0));
  for (let f = 0; f < filas; f++) for (let c = 0; c < columnas; c++) numeros[f][c] = numeroAleatorio(min, max);

  const solucion = crearMascaraSolucion(filas, columnas, densidad);
  const sumasFilas = Array(filas).fill(0);
  const sumasColumnas = Array(columnas).fill(0);
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (solucion[f][c]) {
        sumasFilas[f] += numeros[f][c];
        sumasColumnas[c] += numeros[f][c];
      }
    }
  }

  // estado de seleccion: por defecto todas activas (jugador puede desactivar)
  const seleccion = Array.from({ length: filas }, () => Array(columnas).fill(true));

  return { numeros, solucion, sumasFilas, sumasColumnas, seleccion };
}

function dibujarTablero(div, datos) {
  const { numeros, solucion, sumasFilas, sumasColumnas, seleccion } = datos;
  const filas = numeros.length;
  const columnas = numeros[0].length;

  let html = '<table>';
  // header: empty top-left then column targets
  html += '<tr><th></th>';
  for (let c = 0; c < columnas; c++) {
    html += `<th class="target" data-col="${c}">${sumasColumnas[c]}<div class="curSum" data-col-sum="${c}"></div></th>`;
  }
  html += '</tr>';

  for (let f = 0; f < filas; f++) {
    html += '<tr>';
    // row cells
    html += `<th class="target" data-row="${f}">${sumasFilas[f]}<div class="curSum" data-row-sum="${f}"></div></th>`;
    for (let c = 0; c < columnas; c++) {
      const val = numeros[f][c];
      const inactive = !seleccion[f][c] ? ' inactive' : '';
      html += `<td class="celda${inactive}" data-f="${f}" data-c="${c}">${val}</td>`;
    }
    html += '</tr>';
  }

  html += '</table>';
  div.innerHTML = html;

  // agregar listeners a celdas
  div.querySelectorAll('.celda').forEach(td => {
    td.addEventListener('click', () => {
      const f = parseInt(td.dataset.f, 10);
      const c = parseInt(td.dataset.c, 10);
      datos.seleccion[f][c] = !datos.seleccion[f][c];
      td.classList.toggle('inactive', !datos.seleccion[f][c]);
      actualizarSumaActualYEstado(datos);
    });
  });

  // initial update
  actualizarSumaActualYEstado(datos);
}

function actualizarSumaActualYEstado(datos) {
  const { numeros, solucion, sumasFilas, sumasColumnas, seleccion } = datos;
  const filas = numeros.length;
  const columnas = numeros[0].length;

  // calcular sumas seleccionadas por fila/col
  const selFilas = Array(filas).fill(0);
  const selCols = Array(columnas).fill(0);
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (seleccion[f][c]) {
        selFilas[f] += numeros[f][c];
        selCols[c] += numeros[f][c];
      }
    }
  }

  // actualizar DOM: current sums and mark ok targets
  // columns
  for (let c = 0; c < columnas; c++) {
    const th = document.querySelector(`th.target[data-col=\"${c}\"]`);
    if (!th) continue;
    const cur = th.querySelector(`.curSum[data-col-sum=\"${c}\"]`);
    if (cur) cur.textContent = ` (${selCols[c]})`;
    if (selCols[c] === sumasColumnas[c]) th.classList.add('ok'); else th.classList.remove('ok');
  }
  // rows
  for (let f = 0; f < filas; f++) {
    const th = document.querySelector(`th.target[data-row=\"${f}\"]`);
    if (!th) continue;
    const cur = th.querySelector(`.curSum[data-row-sum=\"${f}\"]`);
    if (cur) cur.textContent = ` (${selFilas[f]})`;
    if (selFilas[f] === sumasFilas[f]) th.classList.add('ok'); else th.classList.remove('ok');
  }

  // mensaje de win
  const allRowsOk = selFilas.every((s, i) => s === sumasFilas[i]);
  const allColsOk = selCols.every((s, i) => s === sumasColumnas[i]);
  const mensajeDiv = document.getElementById('mensaje');
  if (allRowsOk && allColsOk) {
    mensajeDiv.textContent = '¡Ganaste! Todos los objetivos coinciden.';
  } else {
    mensajeDiv.textContent = '';
  }
}

function crearNuevoTablero() {
  const filas = parseInt(document.getElementById('filas').value);
  const columnas = parseInt(document.getElementById('columnas').value);
  const densidad = parseFloat(document.getElementById('dificultad').value);
  const rango = document.getElementById('rango').value.split('-');
  const min = parseInt(rango[0], 10);
  const max = parseInt(rango[1], 10);

  const datos = generarTablero(filas, columnas, min, max, densidad);
  // guardar en global para botones/uso posterior
  window.rulloDatos = datos;
  dibujarTablero(document.getElementById('tablero'), datos);
}

function mostrarSolucion() {
  const datos = window.rulloDatos;
  if (!datos) return;
  const { solucion } = datos;
  // marcar visualmente las celdas que están en la solución
  document.querySelectorAll('td.celda').forEach(td => {
    const f = parseInt(td.dataset.f, 10);
    const c = parseInt(td.dataset.c, 10);
    td.classList.toggle('solution', solucion[f][c]);
  });
}

document.getElementById('btnNuevo').addEventListener('click', crearNuevoTablero);
document.getElementById('btnSolucion').addEventListener('click', mostrarSolucion);

// iniciar tablero
crearNuevoTablero();

// ------------------ Solucionador 5x5 (entrada manual) ------------------

function leerTablero5x5DesdeUI() {
  const nums = Array.from({ length: 5 }, () => Array(5).fill(0));
  const rowT = Array(5).fill(0);
  const colT = Array(5).fill(0);
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
  // mask: 5x5 booleans
  // limpiar marcas anteriores
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const tdId = `cell${r}${c}`;
      const el = document.getElementById(tdId);
      if (!el) continue;
      el.classList.remove('solution');
      if (mask && mask[r][c]) el.classList.add('solution');
    }
  }
}

// backtracking solver for 5x5
function encontrarSolucion5x5(nums, rowT, colT) {
  // rowT or colT may be null for unspecified -> treat as impossible
  for (let i = 0; i < 5; i++) if (rowT[i] === null || colT[i] === null) return null;

  const ROWS = 5, COLS = 5;
  const mask = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  const rowSum = Array(ROWS).fill(0);
  const colSum = Array(COLS).fill(0);

  // precompute remaining sums for pruning convenience
  const totalRow = Array(ROWS).fill(0);
  const totalCol = Array(COLS).fill(0);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { totalRow[r] += nums[r][c]; totalCol[c] += nums[r][c]; }

  // helper to compute remaining potential sums from pos p (inclusive) -> O(n) but fine for 25 cells
  function computeRemainingPotential(startPos) {
    const remRow = Array(ROWS).fill(0);
    const remCol = Array(COLS).fill(0);
    for (let p = startPos; p < ROWS * COLS; p++) {
      const r = Math.floor(p / COLS), c = p % COLS;
      // if not assigned yet (mask[r][c] still 0 and we haven't gone there) include its value
      // But since we only assign as we go forward, any p >= startPos are unassigned
      remRow[r] += nums[r][c];
      remCol[c] += nums[r][c];
    }
    return { remRow, remCol };
  }

  let found = null;

  function backtrack(pos) {
    if (found) return true; // stop if found
    if (pos === ROWS * COLS) {
      // verify all sums
      for (let r = 0; r < ROWS; r++) if (rowSum[r] !== rowT[r]) return false;
      for (let c = 0; c < COLS; c++) if (colSum[c] !== colT[c]) return false;
      // solution found
      found = mask.map(row => row.slice());
      return true;
    }

    const r = Math.floor(pos / COLS), c = pos % COLS;
    const val = nums[r][c];

    // compute remaining potential including current cell
    const { remRow, remCol } = computeRemainingPotential(pos);

    // try 0 first (not selected)
    // check feasibility: if even selecting all remaining cannot reach target -> prune
    // if rowSum[r] + remRow[r] < rowT[r] => impossible
    if (rowSum[r] + remRow[r] >= rowT[r] && colSum[c] + remCol[c] >= colT[c]) {
      // assign 0: mask stays 0, but remaining potential reduces automatically by moving pos
      if (backtrack(pos + 1)) return true;
    }

    // try 1 (select)
    rowSum[r] += val; colSum[c] += val; mask[r][c] = 1;
    // prune if exceeded
    let ok = true;
    if (rowSum[r] > rowT[r] || colSum[c] > colT[c]) ok = false;
    else {
      // check for all rows/cols if can still reach targets
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

    // undo
    rowSum[r] -= val; colSum[c] -= val; mask[r][c] = 0;
    return false;
  }

  backtrack(0);
  return found;
}

document.getElementById('btnResolver').addEventListener('click', () => {
  const { nums, rowT, colT } = leerTablero5x5DesdeUI();
  const solverMsg = document.getElementById('solverMsg');
  solverMsg.textContent = 'Buscando...';
  setTimeout(() => {
    const sol = encontrarSolucion5x5(nums, rowT, colT);
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

document.getElementById('btnAplicarSol').addEventListener('click', () => {
  const sol = window.lastSolution5x5;
  const solverMsg = document.getElementById('solverMsg');
  if (!sol) { solverMsg.textContent = 'No hay solución guardada. Pulsa Resolver primero.'; return; }
  // marcar visualmente con borde y background using .solution (already added by mostrarSolucionEnUI)
  mostrarSolucionEnUI(sol);
});

// Copiar tablero generado (window.rulloDatos) al solucionador 5x5 si es 5x5
document.getElementById('btnCopiarActual').addEventListener('click', () => {
  const solverMsg = document.getElementById('solverMsg');
  const datos = window.rulloDatos;
  if (!datos) { solverMsg.textContent = 'No hay tablero generado en la sección principal.'; return; }
  const numeros = datos.numeros;
  if (!numeros || numeros.length !== 5 || numeros[0].length !== 5) {
    solverMsg.textContent = 'El tablero generado no es 5x5. Ajusta a 5x5 para copiarlo.';
    return;
  }
  // copiar números
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const el = document.getElementById(`cell${r}${c}`);
      if (el) el.value = String(numeros[r][c]);
    }
  }
  // copiar objetivos si están disponibles (sumasColumnas/sumasFilas)
  if (datos.sumasFilas && datos.sumasColumnas && datos.sumasFilas.length === 5 && datos.sumasColumnas.length === 5) {
    for (let r = 0; r < 5; r++) {
      const re = document.getElementById(`rowT${r}`);
      if (re) re.value = String(datos.sumasFilas[r]);
    }
    for (let c = 0; c < 5; c++) {
      const ce = document.getElementById(`colT${c}`);
      if (ce) ce.value = String(datos.sumasColumnas[c]);
    }
    solverMsg.textContent = 'Tablero y objetivos copiados desde el generador.';
  } else {
    solverMsg.textContent = 'Números copiados; objetivos no disponibles en el tablero generado.';
  }
  // limpiar solución previa
  window.lastSolution5x5 = null;
  mostrarSolucionEnUI(null);
});

// Cargar los datos del solucionador 5x5 en el tablero principal para jugar
document.getElementById('btnCargarEnJuego').addEventListener('click', () => {
  const solverMsg = document.getElementById('solverMsg');
  const { nums, rowT, colT } = leerTablero5x5DesdeUI();
  // validar
  let ok = true;
  for (let i = 0; i < 5; i++) if (rowT[i] === null || colT[i] === null) ok = false;
  if (!ok) {
    solverMsg.textContent = 'Faltan objetivos en el solucionador. Rellena rowT y colT o copia desde el generador.';
    return;
  }

  const datos = {
    numeros: nums,
    solucion: window.lastSolution5x5 || Array.from({ length: 5 }, () => Array(5).fill(false)),
    sumasFilas: rowT.slice(),
    sumasColumnas: colT.slice(),
    seleccion: Array.from({ length: 5 }, () => Array(5).fill(true))
  };
  // guardar como tablero actual y dibujar
  window.rulloDatos = datos;
  dibujarTablero(document.getElementById('tablero'), datos);
  document.getElementById('mensaje').textContent = 'Tablero cargado desde el solucionador. ¡A jugar!';
  solverMsg.textContent = 'Tablero cargado en la sección principal.';
});
