// Primera parte solo es visual no funciona nada :D

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

  // para las filas y columnas
  for (let f = 0; f < filas; f++) {
    if (!mascara[f].some(v => v)) {
      mascara[f][Math.floor(Math.random() * columnas)] = true;
    }
  }

  for (let c = 0; c < columnas; c++) {
    let activo = false;
    for (let f = 0; f < filas; f++) {
      if (mascara[f][c]) { activo = true; break; }
    }
    if (!activo) {
      mascara[Math.floor(Math.random() * filas)][c] = true;
    }
  }

  return mascara;
}

function generarTablero(filas, columnas, min, max, densidad) {
  const numeros = Array.from({ length: filas }, () => Array(columnas).fill(0));
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      numeros[f][c] = numeroAleatorio(min, max);
    }
  }

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

  return { numeros, sumasFilas, sumasColumnas };
}

function dibujarTablero(div, datos) {
  const { numeros, sumasFilas, sumasColumnas } = datos;
  const filas = numeros.length;
  const columnas = numeros[0].length;

  let html = "<table border='1' cellspacing='0' cellpadding='5'>";
  html += "<tr><td></td>";
  for (let c = 0; c < columnas; c++) {
    html += `<th>${sumasColumnas[c]}</th>`;
  }
  html += "</tr>";

  for (let f = 0; f < filas; f++) {
    html += "<tr>";
    for (let c = 0; c < columnas; c++) {
      html += `<td class='celda' data-activa='1'>${numeros[f][c]}</td>`;
    }
    html += `<th>${sumasFilas[f]}</th>`;
    html += "</tr>";
  }

  html += "</table>";
  div.innerHTML = html;

  // aqui agrego click
  const celdas = div.querySelectorAll(".celda");
  celdas.forEach(celda => {
    celda.addEventListener("click", () => {
      if (celda.dataset.activa === "1") {
        celda.style.background = "#ddd";
        celda.dataset.activa = "0";
      } else {
        celda.style.background = "";
        celda.dataset.activa = "1";
      }
    });
  });
}

function crearNuevoTablero() {
  const filas = parseInt(document.getElementById("filas").value);
  const columnas = parseInt(document.getElementById("columnas").value);
  const densidad = parseFloat(document.getElementById("dificultad").value);

  const rango = document.getElementById("rango").value.split("-");
  const min = parseInt(rango[0]);
  const max = parseInt(rango[1]);

  const datos = generarTablero(filas, columnas, min, max, densidad);
  const tableroDiv = document.getElementById("tablero");
  dibujarTablero(tableroDiv, datos);
}

document.getElementById("btnNuevo").addEventListener("click", crearNuevoTablero);

// iniciar uno 
crearNuevoTablero();
