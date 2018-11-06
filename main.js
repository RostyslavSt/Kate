var dists = []; // матрица расстояний
var path = []; // путь (массив перестановок)
var minWay = [],
      minDist = Infinity,
      maxDist = 0; // лучший путь, его длина и максимальная длина
var countPath = 0; // число просмотренных путей
var countSol = 0; // число оптимальных решений
var timerPathID; // номер таймера
var timeTot, timeBest; // общее время и время до лучшего решения
var total; // число перестановок
var pos;
var ar;

function fac(n) {
      if (n == 1 || n == 0)
            return 1;
      return n * fac(n - 1);
}

function swap(ar, i, j) {
      var a = ar[i];
      ar[i] = ar[j];
      ar[j] = a;
}

function permNxt(ar, lf) {
      var rt = ar.length - 1,
            i = rt - 1;
      while (i >= lf && ar[i] >= ar[i + 1]) i--; // ищем справа ar[i] < ar[i+1]
      if (i < lf) // такого нет?
            return false; // перестановки окончены

      var j = rt; // ищем ar[j],
      while (ar[i] >= ar[j]) j--; // наименьший справа от ar[i]
      swap(ar, i, j); // переставляем их местами

      var lf = i + 1; // переворачиваем последовательность
      while (lf < rt)
            swap(ar, lf++, rt--);

      return true; // перестановки не закончились
}

var timerID; // номер таймера

function run(btn) {
      if (timerID === undefined) {
            timerID = setInterval(timer, 100); // создаём таймер на 100 ms, в timerID - его номер
            btn.value = "stop"; // меняем надпись на кнопке
      } else {
            timerID = clearInterval(timerID); // убиваем таймер, timerID будет undefined
            btn.value = "run"; // меняем надпись на кнопке
      }
}
var count = 0; // количество просмотренных перестановок

function timer() {
      var num = 1; // количество итераций за один "тик" таймера
      do {
            count++; // тут обрабатываем перестановку
            document.getElementById('outID').innerHTML = count + ": " + ar;
      }
      while (permNxt(ar, 1) && --num); // 0-город фиксирован, остальные меняем местами

      if (num) { // while был прерван permNxt
            timerID = clearInterval(timerID); // убиваем таймер, timerID будет undefined
            document.getElementById('btnID').value = "run" // меняем надпись на кнопке
      }
}

function rand(n) {
      return Math.floor(Math.random() * n);
}
var lcg = (function () {
      var z = 1,
            a = 1664525,
            b = 1013904223,
            m = 4294967296; // = 2^32
      return {
            seed: function (val) {
                  z = val || Math.round(Math.random() * m);
            },
            rand: function (bound) {
                  return (z = (a * z + b) % m) % bound;
            },
            random: function () {
                  return (z = (a * z + b) % m) / m;
            }
      };
}());
lcg.seed(10); // задаём seed 10
for (var i = 50; i--;) document.write(lcg.rand(10), ',');
document.write('<br>');
lcg.seed(); // задаём случайный seed
for (var i = 50; i--;) document.write(lcg.rand(10), ',');
// массив координат городов
function create() {
      var n = Number(document.getElementById('nID').value); // число городов
      var w = Number(document.getElementById('wID').value); // ширина карты
      var h = Number(document.getElementById('hID').value); // высота карты
      var seed = Number(document.getElementById('seedID').value); // номер случайной последовательности
      ar = new Array(n);
      for (var i = 0; i < n; i++)
            ar[i] = i;
      pos = new Array(n);
      lcg.seed(seed); // инициализируем случайную последовательность


      for (var j = 0; j < n; j++) // для каждого города
            pos[j] = {
                  x: lcg.rand(w),
                  y: lcg.rand(h)
            }; // задаём случайное положение

      dists = new Array(n); // массив расстояний
      for (var j = 0; j < n; j++)
            dists[j] = new Array(n); // расстояния к каждому городу от j-того

      for (var j = 0; j < n; j++) {
            dists[j][j] = -1; // диагональные элементы
            for (var i = 0; i < j; i++) {
                  var dx = pos[i].x - pos[j].x; // вычисляем евклидово расстояние
                  var dy = pos[i].y - pos[j].y;
                  dists[j][i] = dists[i][j] = Math.sqrt(dx * dx + dy * dy);
            }
      }

      minDist = Infinity;
      maxDist = 0; // наименьшая и наибольшая длина пути
      countPath = 0;
      countSol = 0; // число просмотренных путей и оптимальных решений

      path = new Array(dists.length); // собственно путь
      for (var i = 0; i < path.length; i++) path[i] = i; // 0,1,2,3,...

      timeTot = timeBest = 0; // общее время и время до лучшего решения
      total = fac(n - 1);
      show(pos, path, w, h)
      timerPath(); // число перестановок (n-1)! (Recursion.html)
}

function show(pos, path, w, h) {
      console.log('qwqw');
      var canvas = document.getElementById('canID'); // получаем объект канваса
      var ctx = canvas.getContext('2d'); // у него есть свойство - контекст рисования
      var x0 = 10,
            y0 = 10; // положение левого верхнего угла карты
      canvas.width = w + 2 * x0;
      canvas.height = h + 2 * y0; // меняем размеры канваса (чуть больше, чем w x h)

      ctx.beginPath(); // начало рисования ломаной линии
      ctx.moveTo(x0 + pos[path[0]].x, y0 + pos[path[0]].y) // переходим на 0-й город
      for (var i = 1; i < path.length; i++) // рисуем отрезки пути к i-тому городу
            ctx.lineTo(x0 + pos[path[i]].x, y0 + pos[path[i]].y);
      ctx.closePath(); // соединяем последнюю и первую точку
      ctx.stroke(); // собственно рисуем линию

      ctx.fillStyle = '#FFA'; // цвет заливки круга
      for (var i = 0; i < pos.length; i++) {
            ctx.beginPath();
            ctx.arc(x0 + pos[i].x, y0 + pos[i].y, 10, 0, Math.PI * 2, true);
            ctx.stroke(); // рисуем окружность
            ctx.fill(); // рисуем круг
      }

      ctx.font = "12pt Consolas"; // моноширинный шрифт
      ctx.textAlign = "center"; // текст центрован по горизонтали
      ctx.textBaseline = "middle"; // и по вертикали
      ctx.fillStyle = '#000'; // цвет текста
      for (var i = 0; i < pos.length; i++)
            ctx.fillText(i, x0 + pos[i].x, y0 + pos[i].y); // выводим текст (номер города)
}
// show(pos, path, w, h)

function dist(ar, dists) {
      var d = dists[0][ar[0]] + dists[ar[ar.length - 1]][0]; // начало и конец
      for (var i = 1; i < ar.length; i++)
            d += dists[ar[i - 1]][ar[i]]; // между ar[i-1] и ar[i]
      return d; // длина пути перестановки ar
}

function copy(des, src) {
      if (des.length !== src.length)
            des = new Array(src.length);
      for (var i = 0; i < src.length; i++)
            des[i] = src[i];
      return des;
}
minWay = copy(minWay, path);

function timerPath() {
      var time = window.performance.now(); // время в начале функции
      var num = 1000000; // количество итераций за один "тик" таймера
      do {
            countPath++; // тут обрабатываем перестановку
            var d = dist(path, dists); // вычисляем длину пути

            if (d === minDist) countSol++; // число оптимальных решений
            if (d < minDist) { // нашли более короткий путь
                  minDist = d; // запоминаем кратчайшее расстояние
                  minWay = copy(minWay, path); // запоминаем путь


                  countSol = 1; // первое оптимальное решение
                  timeBest = timeTot; // время до этого решения
            }
            if (d > maxDist) maxDist = d; // запоминаем максимальное расстояние
      }
      while (permNxt(path, 1) && --num); // пока есть перестановки и итерации
      timeTot += window.performance.now() - time; // время вычислений

      document.getElementById('outPathID').innerHTML = "minDist: " + minDist.toFixed(2) +
            ", path: " + minWay +
            "<br>time: " + timeBest.toFixed(0) + " ms, " +
            "maxDist = " + maxDist.toFixed(2) +
            ", countSol = " + countSol +
            ", total: " + timeTot.toFixed(0) + " ms, " +
            "iters: " + (100 * countPath / total).toFixed(2) + "%";

      if (num) { // while был прерван permNxt
            timerPathID = clearInterval(timerPathID); // убиваем таймер, timerPathID будет undefined
            document.getElementById('btnPathID').value = "run";
      }

}