# 🧩 Proyecto IA – Juego Rullo (Web Solver + Método Voraz)

Este proyecto implementa el **juego Rullo** con un **solucionador basado en estrategias de búsqueda** (particularmente el **método voraz / greedy**).  
El objetivo del juego es activar o desactivar números en un tablero de NxN hasta que **las sumas de filas y columnas coincidan con sus objetivos**.

> 💡 Desarrollado como parte de la asignatura **Inteligencia Artificial (IA)** — Universidad del Bío-Bío.

---

## 🚀 Descripción General

Rullo es un puzzle matemático donde se debe decidir qué números dejar activos para cumplir con las metas indicadas.  
Este sistema permite **ingresar un tablero manualmente**, elegir el tamaño (5×5, 6×6, 7×7 u 8×8) y **resolverlo automáticamente** usando distintos enfoques de búsqueda.

Se implementaron **tres tipos de estrategias**, descartando dos de ellas tras el análisis comparativo, y adoptando finalmente la **búsqueda voraz** como la más adecuada.

---

## 🧠 Métodos de Búsqueda Analizados

Durante el desarrollo se probaron tres estrategias diferentes de resolución:

1. **Búsqueda A\***  
   - Combina el costo real del camino \(g(n)\) con una estimación heurística \(h(n)\).  
   - Muy precisa, pero **excesivamente compleja y costosa** para tableros grandes.  
   - Requiere calcular y almacenar demasiados estados intermedios.  
   - ❌ **Descartada** por su alto tiempo de cómputo y consumo de memoria.

2. **Búsqueda en Profundidad (DFS)**  
   - Explora cada rama del árbol de estados hasta el final antes de retroceder.  
   - Puede encontrar soluciones, pero **sin garantía de optimalidad**.  
   - Tiende a caer en bucles o caminos innecesarios si no se controla la profundidad.  
   - ❌ **Descartada** por falta de eficiencia y precisión en este tipo de puzzles.

3. **Búsqueda Voraz (Greedy Search)** ✅  
   - Utiliza **solo la heurística h(n)**, que mide la diferencia entre las sumas actuales y los objetivos de filas y columnas.  
   - Selecciona siempre el estado que **minimiza h(n)** en cada paso.  
   - Es **rápida, simple y efectiva** para tableros entre 5×5 y 8×8.  
   - ✔️ **Método adoptado como mejor alternativa**, al equilibrar velocidad y buenos resultados empíricos.


---

## ⚙️ Algoritmo Voraz (Greedy)

El algoritmo evalúa los posibles estados del tablero (activaciones o desactivaciones de celdas) en función de **una heurística simple**:

\[
h(n) = \sum_{filas} |sumaFila - objetivoFila| + \sum_{columnas} |sumaColumna - objetivoColumna|
\]

**Procedimiento resumido:**
1. Cargar el tablero inicial (todas las celdas activas o estado base).
2. Calcular `h(n)` para ese estado.
3. Generar estados vecinos (alternando activación de celdas).
4. Elegir el estado con menor `h(n)`.
5. Repetir hasta que `h(n) = 0` o no haya mejora posible.

> 🧩 Cada celda tiene dos estados: **activa (1)** o **inactiva (0)**.  
> El objetivo global es lograr que las sumas de filas y columnas coincidan con las metas cargadas.

---

## 💻 Tecnologías Utilizadas

| Tecnología | Uso Principal |
|-------------|----------------|
| **HTML5** | Estructura de la interfaz y tablas del tablero. |
| **CSS3 (Tema Azul)** | Diseño responsivo, sombras suaves, degradados y estilo moderno. |
| **JavaScript (Vanilla)** | Lógica del juego, carga de datos, algoritmos de búsqueda y renderizado dinámico. |

---

## 🧩 Funcionalidades Principales

- 🎮 **Selector de tamaño:** 5×5, 6×6, 7×7 y 8×8.  
- ✏️ **Carga manual del tablero:** puedes ingresar todos los números y objetivos.  
- ⚙️ **Resolver automáticamente:** ejecuta la búsqueda voraz o backtracking simple.  
- 💡 **Modo interactivo:** activa o desactiva celdas con clic y verifica metas.  
- 📊 **Validación visual:** filas/columnas en verde cuando la suma coincide.  
- 🎨 **Tema azul moderno:** interfaz limpia, con efectos hover y sombras.

---
## 🕹️ Uso

1. Abre `index.html` en tu navegador.  
2. Elige el tamaño del tablero.  
3. Ingresa los valores y objetivos.  
4. Pulsa **Resolver** → ejecuta el método **voraz (greedy)**.  
5. Observa el tablero resuelto o usa “Cargar en juego” para probarlo manualmente.

---

## 🔬 Análisis de Costos

| Estrategia | Complejidad teórica | Observación |
|-------------|--------------------|--------------|
| BFS | O(b^d) | Explotación combinatoria muy alta. |
| A\* | O(b^d) con heurística y costo acumulado | Precisa, pero costosa. |
| Voraz (Greedy) | O(b × d) aprox. | Balancea tiempo y precisión; adecuada para este caso. |

> En pruebas empíricas, el método voraz logró resolver correctamente tableros 5×5 y 6×6 en menos de un segundo promedio.

---

## 🧪 Pruebas Recomendadas

- Tablero 5×5 con metas alcanzables (verifica rendimiento instantáneo).  
- Casos sin solución (el algoritmo debe detenerse sin bucle).  
- Comparación entre tamaños (5×5, 6×6, 7×7, 8×8).  

---
