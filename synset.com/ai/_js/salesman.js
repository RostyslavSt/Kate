'use strict';
/****************************************************************************************
*                                     Задача коммивояжёра.
* Реализованы  методы:
*    + Полный перебор                      + Жадный алгоритм    
*    + Жадный алгоритм с возвратом         + Алгоритм шнурка
*    + Направленный поиск                  + Эвристики переворотов
*    + Метод ветвей и границ
*                                        (с) 2017-jan steps: synset.com, absolutist.com
****************************************************************************************/
function Salesman(n)
{
   this.N      = n;                               // число городов
   this.minWay = new Array(this.N);               // лучший путь (массив номеров городов)
   this.minLen = Infinity;                        // лучшее расстояние

   this.dists = new Array(this.N);                // двумерная матрица расстояний
   for(let j=0; j < this.N; j++)                  // размерности N x N
      this.dists[j] = new Array(this.N);

   this.pos = new Array(this.N);                  // положение {x,y} городов на плоскости
   this.way = new Array(this.N);                  // временный путь для алгоритма перебора
   this.was = new Array(this.N);                  // города, где были
   this.nxt = new Array(this.N);                  // города, где не были

   this.method = "perm";                          // метод поиска пути  ( см. init() )
   this.timerPeriod = 10;                         // период (ms) вызова из таймера
   this.loops   = 1;                              // число повторов алгоритма в таймере
   this.timeTot = this.timeMin = 0;               // время общее и до лучшего решения
   this.scale   = 1;                              // изменение масштаба при выводе svg
}
/****************************************************************************************
*                                   Статические методы
/****************************************************************************************
* Копирование в массив des массива src, вызывать des = copy(des, src);
*/
Salesman.copy = function (des, src)
{
   if(des.length !== src.length)                  // не совпадает длина массивов
      des = new Array(src.length);                // пересоздаём
   for(let i=0; i < src.length; i++)              // копируем
      des[i] = src[i];
   return des;                                    // указатель на память (возможно новую!)
}
/****************************************************************************************
* Возвращает true, если val есть в массиве ar, иначе - false
*/
Salesman.isInArray = function(ar, val)
{
   for(let k=0; k < ar.length; k++)
      if(ar[k] === val)
         return true;
   return false;
}
/****************************************************************************************
* Перестановка ar[i] и ar[j] местами
*/
Salesman.swap = function(ar, i, j)
{
   let a = ar[i]; ar[i]=ar[j]; ar[j]=a;
}
/****************************************************************************************
* Факториал числа
*/
Salesman.factorial = function(n)
{
   if(n < 2) return 1;
   return n*Salesman.factorial(n-1);              // рекурсия n! = n * (n-1)!
}
/****************************************************************************************
* Получение следующей перестановки в массиве ar = [0,1,...,n-1] в диапазоне [lf ... rt]
*/
Salesman.permNxt = function(ar, lf, rt)
{
   let i=rt-1;
   while( i >= lf && ar[i] >= ar[i+1]) i--;       // ищем справа ar[i] < ar[i+1]
   if(i < lf)                                     // такого нет?
      return false;                               // перестановки окончены

   let j = rt;                                    // ищем ar[j],
   while(ar[i] >= ar[j]) j--;                     // наименьший справа от ar[i]
   Salesman.swap(ar, i, j);                       // переставляем их местами

   let lf = i+1;                                  // переворачиваем последовательность
   while(lf < rt)
      Salesman.swap(ar, lf++, rt--);

   return true;                                   // перестановки не закончились
}
/****************************************************************************************
*                                   Динамические методы
/****************************************************************************************
* Создать города и матрицу расстояний между ними по карте размером w x h
* Генератор rnd "встряхивается" номером случайной последовательности seed
*/
Salesman.prototype.create = function (w, h, seed, rnd, round)
{
   this.w = w;  this.h = h;                       // ширина и высота карты с городами

   rnd.seed(seed);                                // номер случайной последовательности
   for(let k=0; k < this.N; k++)
      this.pos[k] = {x:rnd.rand(w),y:rnd.rand(h)};// случайное положение городов

   this.setDists(round);                          // вычисляем матрицу расстояний
}
/****************************************************************************************
* Города на сетке
* http://azspcs.com/Contest/PolygonalAreas
*/
Salesman.prototype.createGrid = function (w, h, seed, rnd)
{
   this.w = w;  this.h = h;                       // ширина и высота карты с городами

   rnd.seed(seed);                                // номер случайной последовательности
   for(let i=0; i < this.N; i++)
      this.way[i] = i;
   for(let i=0; i < 1000; i++)
      Salesman.swap(this.way, rnd.rand(this.N), rnd.rand(this.N));
   let dx = w/this.N, dy = h/this.N;
   for(let k=0; k < this.N; k++)
      this.pos[k] = {x:k*dx,y:this.way[k]*dy};  // случайное положение городов

   this.setDists();                             // вычисляем матрицу расстояний
}
/****************************************************************************************
* Вычислить матрицу расстояний по координатам ранее заданных городов
* Если round==true - расстояния округляются до целых
*/
Salesman.prototype.setDists = function (round)
{
   for(let j=0; j < this.N; j++){                 // вычисляем попарные расстояния
      this.dists[j][j] = -1;                      // сам с собой город дорогой не связан
      for(let i=0; i < j; i++){
         let dx = this.pos[i].x - this.pos[j].x;
         let dy = this.pos[i].y - this.pos[j].y;  // евклидово расстояние:
         let d  = Math.sqrt(dx*dx+dy*dy);
         this.dists[j][i] = this.dists[i][j] = round? Math.round(d): d;
      }
   }

   for(let i=0; i < this.N; i++)
      this.minWay[i] = this.way[i] = i;           // пока лучший путь 0,1,2,...,N-1
   this.minLen = this.distance(this.minWay);      // пока лучшее расстояние
}
/****************************************************************************************
* Длина пути маршрута way
*/
Salesman.prototype.distance = function (way)
{
   let d = 0, i = 1;
   for(; i < way.length; i++)
      d += this.dists[way[i-1]][way[i]];          // из города way[i-1] в город way[i]
   return d + this.dists[way[i-1]][way[0]];       // замыкающее расстояние в город way[0]
}
/****************************************************************************************
* Вернуть сдвинутый и отмасштабированный массив координат.
* В объекте rect = {w, h} будут помещены ширина и высота карты.
*/
Salesman.prototype.getMap = function (rect)
{
   let min = {x:Infinity, y:Infinity}, max = {x:0, y:0};
   for(let i=0; i < this.pos.length; i++){        // минимальные и максимальные координаты
      let p = this.pos[i];
      if(p.x < min.x) min.x = p.x;  if(p.x > max.x) max.x = p.x;
      if(p.y < min.y) min.y = p.y;  if(p.y > max.y) max.y = p.y;
   }

   let pos = new Array(this.pos.length);          // сдвинутые и сжатые координаты
   for(let i=0; i < pos.length; i++)
      pos[i] = {x: (this.pos[i].x-min.x)*this.scale,
                y: (this.pos[i].y-min.y)*this.scale};
   rect.w = (max.x-min.x)*this.scale;  rect.h = (max.y-min.y)*this.scale;
   return pos;
}
/****************************************************************************************
* Нарисовать города и путь way
*/
Salesman.prototype.getSVG = function (way)
{
   if(!way) way = this.minWay;                    // по умолчанию минимальный путь
   let draw = new Draw(), rect = {};              // объект рисования из draw.js
   let pos  = this.getMap(rect);                  // отмасштабированный массив координат

   if(this.circles){
      draw.colorFill('#aff');                     // цвет заливки города
      for(let i=0; i < this.N; i++)
         draw.circleFill(pos[i], this.circles[i]*this.scale);  
   }
   
   if(!this.noWay)
      draw.polygon(pos, false, way);              // рисуем замкнутый полигон пути way

   let r = this.N <= 50 ? 8: (this.N <= 100? 6:3);// выбираем радиус узла
   if(this.noNames) r = 3;                        // не будем выводить имя города
   if(this.radius !== undefined) r = this.radius; // радиус задан извне
   draw.colorFill('#ffa');                        // цвет заливки города
   if(r > 0 && !this.noCites) 
      for(let j=0; j < this.N; j++)               // точки городов с координатами {x,y}
          draw.circleFill(pos[j], r);             // окружность с жёлтой сердцевиной

   if(!this.noNames && r > 3){                    // выводим номера городов вдоль пути!
      draw.colorText('#00a');                     // цвет текста
      draw.sizeText(r===8 ? 12 : 8);              // размер шрифта
      for(let i=0; i < way.length; i++)
         draw.text(way[i], pos[way[i]].x, pos[way[i]].y+1);
   }

   draw.transformAll(2*r, 2*r);                   // возвращаем рисунок как svg - текст:
   return draw.getSVG(rect.w+4*r, rect.h+4*r);
}
/****************************************************************************************
* Создать города и матрицу расстояний между ними по карте размером w x h
* Генератор rnd "встряхивается" номером случайной последовательности seed
*/
Salesman.prototype.randomWay = function ()
{
   for(let i=0; i < this.N; i++)
      this.way[i] = i;
   for(let k=0; k < 1000; k++)
      Salesman.swap(this.way, Math.floor(Math.random()*this.N), 
                              Math.floor(Math.random()*this.N));
   for(let i=0; i < this.N; i++)
      this.minWay[i] = this.way[i];                              

   this.minLen = this.distance(this.minWay);      
}
/****************************************************************************************
* Создание дерева различных путей (для демоцелей). Вызов: let tr = {}; sm.getTree(tr);
*/
Salesman.prototype.getTree = function (tr, ar, n, len, prv)
{
   if(!ar){                                       // начальный запуск
      n = this.N-1; len = 0; prv = -1;
      ar = new Array(this.N);
      for(let i=0; i < ar.length; i++) ar[i]=-1;
      tr.nm = "";  tr.ar = [];
   }
   if(n < 0){                                     // перестановки окончены
      tr.ar.push( {nm:this.distance(ar).toFixed(0) } );
      return;
   }

   for(let i=0; i < ar.length; i++ )              // бежим по элементам массива с конца
      if(ar[i] < 0){                              // если место не занято
         tr.ar.push( {nm:i, ar:[] } );
         ar[i] = n;                               // ставим на него число
         this.getTree(tr.ar[tr.ar.length-1], ar, n-1, len+prv>=0?this.dists[prv][i]:0, i);
         ar[i] = -1;                              // убираем (поставим на новое место)
      }
}
/****************************************************************************************
* Жадный алгоритм быстро находит (возможно не оптимальные) minWay и minLen
* Перебераем все города, как кандидата на стартовый
*/
Salesman.prototype.greedy = function (out)
{
   this.minLen = Infinity;
   for(let j=0; j < this.N; j++){                 // выбираем лучший стартовый город
      for(let i=0; i < this.N; i++ )
         this.way[i] = i;                         // все города
      Salesman.swap(this.way, 0, j);              // j-тый город ставим первым

      let last = j, lf = 1, d = 0;                // last - последний посещённый город
      while(lf < this.N){                         // пока не перебрали оставшиеся города
         let minD = this.dists[last][this.way[lf]];
         for(let i=lf+1; i < this.N; i++)         // ищем ближайший к last город
            if(this.dists[last][this.way[i]] < minD){
               minD = this.dists[last][this.way[i]];
               Salesman.swap(this.way, lf, i);    // ближайший переносим в начало
            }
         d += minD;                               // суммируем общую длину пути
         last = this.way[lf++];                   // берём "первый" как ближайший
      }
      d +=  this.dists[last][j];                  // финальный отрезок

      if(out)
         document.write('<div style="display:inline-block;">length:',d.toFixed(2),
                        '<br>way:',this.way,'<br>',this.getSVG(this.way),'</div>');

      if(this.minLen > d){                        // если длина пути лучшая,
         this.minLen = d;                         // запоминаем её и путь:
         this.minWay = Salesman.copy(this.minWay, this.way);
      }
   }
}
/****************************************************************************************
* Жадный алгоритм к части пути из n городов. В way, начиная с n, находятся новые города
* Возвращаем длину оставшегося пути, включая возврат к стартовому городу
*/
Salesman.prototype.greedyWay = function (way, n)
{
   let last = way[n-1], d = 0                     // last - последний посещённый город
   while(n < way.length){                         // пока не перебрали оставшиеся города
      let minD = this.dists[last][way[n]];
      for(let i=n+1; i < way.length; i++)         // ищем ближайший к last город
         if(this.dists[last][way[i]] < minD){
            minD = this.dists[last][way[i]];
            Salesman.swap(way, n, i);             // ближайший переносим в начало
         }
      d += minD;                                  // суммируем общую длину пути
      last =  way[n++];                           // новый жадный город
   }
   return d + this.dists[last][way[0]];           // + финальное расстояние к началу
}
/****************************************************************************************
* Переворот пар узлов
*/
Salesman.prototype.turn = function ()
{
   let beg=0, end=1, nxt=2, prv=this.N-1, cnt=0, totCnt=0; 
   while(true){                                 // длина до переворота и после:
      let oldD = this.dists[this.minWay[prv]][this.minWay[beg]]
               + this.dists[this.minWay[beg]][this.minWay[end]]
               + this.dists[this.minWay[end]][this.minWay[nxt]];
      let newD = this.dists[this.minWay[prv]][this.minWay[end]]
               + this.dists[this.minWay[end]][this.minWay[beg]]
               + this.dists[this.minWay[beg]][this.minWay[nxt]];               
      if(oldD > newD){                          // длина пути уменьшилась
         Salesman.swap(this.minWay, beg, end);  // меняем местами
         this.minLen -= oldD-newD;              // уменьшаем длину пути
         cnt++; totCnt++;                       // переворотов на круге и всего
      }
      prv = beg;  beg = end;  end = nxt;  nxt = this.next(nxt);

      if(beg===0){                              // сделали полный круг
         if(!cnt)                               // не было ни одного переворота
            break;                              // оканчиваем работу
         cnt = 0;                               // иначе делаем ещё один круг
      }
   }
   this.outInfo(" cnt:"+totCnt);                // дополнительно выводим число переворотов
}
/****************************************************************************************
* Вызываем из кнопки "run(this);" для запуска или остановки
*/
Salesman.prototype.run = function(btn)
{
   if(this.timerID === undefined){                // создаём таймер:
      this.timerID = setInterval(this.timer.bind(this), this.timerPeriod);
      btn.value = "stop";                         // меняем надпись на кнопке
      this.btn  =  btn;                           // запоминаем кнопку
      this.init();                                // функция инициализации
      this.timer();                               // сразу запускаем вычисление
   }
   else
      this.stop();                                // таймер уже запущен, убиваем  его
}
/****************************************************************************************
* Вызываем для остановки таймера
*/
Salesman.prototype.stop = function()
{
   this.timerID = clearInterval(this.timerID);    // убиваем  таймер, timerID=undefined
   this.btn.value = "run";                        // меняем надпись на кнопке
}
/****************************************************************************************
* Подготовка к вычислениям
*/
Salesman.prototype.init = function()
{
   this.cntWays  = 0;                             // число просмотренных путей
   this.cntNode  = 0;                             // число сформированных узлов
   this.cntCuts  = 0;                             // число отсечений неподходящих веток
   this.timeTot  = this.timeMin = 0;              // общее время и время до минимума

   if(this.minWay.length !== this.N){             // на всякий случай, иначе не меняем
      this.minWay   = new Array(this.N);          // лучший путь
      this.way      = new Array(this.N);          // вспомогательный путь
      for(let i=0; i < this.N; i++)               // заполняем их
         this.minWay[i] = this.way[i] = i;        // начальным порядком 0,1,2,...
      this.minLen = this.distance(this.minWay);   // вычисляем длину этого пути
   }
   this.maxLen  = 0;                              // максимальное расстояние
   
   switch(this.method){                           // инициализируем конкретный метод
      case "lace":  this.laceInit();    break;    // метод шнурка
      case "perm":  this.permInit();    break;    // полный перебор
      case "grdy":  this.greedyInit();  break;    // простой жадный алгоритм в таймере
      case "swap":  this.swapInit();    break;    // эвристика переворота пар рёбер
      case "move":  this.moveInit();    break;    // скользящие перестановки      
      case "back":  this.backInit();    break;    // жадный алгоритм с возвратом      
      case "srch":  this.searchInit();  break;    // направленный поиск
      case "bound": this.boundInit();   break;    // метод ветвей и границ
   }
}
/****************************************************************************************
* Таймерная функция
*/
Salesman.prototype.timer = function()
{
   switch(this.method){
      case "lace":  this.laceTimer();    break;   // метод шнурка
      case "perm":  this.permTimer();    break;   // полный перебор
      case "grdy":  this.greedyTimer();  break;   // простой жадный алгоритм в таймере
      case "swap":  this.swapTimer();    break;   // эвристика переворота пар рёбер
      case "move":  this.moveTimer();    break;   // скользящие перестановки
      case "back":  this.backTimer();    break;   // жадный алгоритм с возвратом
      case "srch":  this.searchTimer();  break;   // направленный поиск
      case "bound": this.boundTimer();   break;   // метод ветвей и границ
   }
}
/****************************************************************************************
* Вывести текущие результаты
*/
Salesman.prototype.outInfo = function(st)
{
   if(this.outTXT)
      this.outTXT.innerHTML =  "len: "+this.minLen.toFixed(2)+"<br>"+this.minWay
         + "<br>ms min,tot:" + this.timeMin.toFixed(0)
         + " " + this.timeTot.toFixed(0) + " "
         + (this.maxLen? "maxDist = " + this.maxLen.toFixed(2): "")
         + (this.cntWays? ", ways: "  + this.cntWays
         + (this.total? " ("+(100*this.cntWays/this.total).toFixed(2) + "%)":"") :"")
         + (this.cntNode? ", nodes: " + this.cntNode: "")
         + (this.cntCuts? ", cuts: " + this.cntCuts: "")
         + (st? st:"");

   if(this.outSVG)
      this.outSVG.innerHTML = this.getSVG();
}
/****************************************************************************************
* Подготовка к перебору перестановок
*/
Salesman.prototype.permInit = function()
{
   this.cntSol  = 0;                              // число оптимальных решений   
   this.total = Salesman.factorial(this.N-1);     // число необходимых перестановок
   for(let i=0; i < this.N; i++) this.way[i] = i; // все города для перестановок
}
/****************************************************************************************
* Таймерный вызов перебора перестановок
*/
Salesman.prototype.permTimer = function()
{
   let num = this.loops;                          // итераций за один "тик" таймера
   let time = window.performance.now();           // время в начале функции
   do{
      this.cntWays++;                             // число просмотренных путей
      let len = this.distance(this.way);          // вычисляем длину пути
      if(len === this.minLen) this.cntSol++;      // число оптимальных решений
      if(len < this.minLen){                      // нашли более короткий путь
         this.minLen = len;                       // запоминаем кратчайшее растояние
         this.minWay = Salesman.copy(this.minWay, this.way);
         this.cntSol = 1;                         // первое оптимальное решение
         this.timeMin = this.timeTot + (window.performance.now() - time);
      }
      if(len > this.maxLen) this.maxLen=len;      // запоминаем максимальное расстояние

   }
   while(Salesman.permNxt(this.way, 1, this.N-1) && --num);
   this.timeTot += window.performance.now() - time;

   if(num)                                        // while был прерван permNxt
      this.stop();                                // убиваем таймер (перестановки окончены)
      
   this.outInfo(", countSol = " + this.cntSol);   // выводим результаты  
}
/****************************************************************************************
* Простой жадный алгоритм greedy(), реализованный в таймере - подготовка к нему
*/
Salesman.prototype.greedyInit = function()
{
   this.greedyJ = this.last = 0; this.left = 1; 
   for(let i=0; i < this.N; i++ ) 
      this.minWay[i] = this.way[i] = i;           // все города
   this.minLen = this.distance(this.way[i]);
}
/****************************************************************************************
* Простой жадный алгоритм greedy(), реализованный в таймере
*/
Salesman.prototype.greedyTimer = function()
{
   let num = this.loops;                          // итераций за один "тик" таймера
   let time = window.performance.now();           // время в начале функции
   do{      
      if(this.left < this.N){                     // пока не перебрали оставшиеся города
         let min = this.dists[this.last][this.way[this.left]];
         for(let i=this.left+1; i < this.N; i++)  // ищем ближайший к last город
            if(this.dists[this.last][this.way[i]] < min){
               min = this.dists[this.last][this.way[i]];
               Salesman.swap(this.way,this.left,i);// ближайший переносим в начало
            }
         this.greedyD += min;                     // суммируем общую длину пути
         this.last = this.way[this.left++];       // берём "первый" как ближайший
      }
      else{
         this.greedyD += this.dists[this.last][this.greedyJ];// финальный отрезок            
         if(this.minLen > this.greedyD){          // если длина пути лучшая,
            this.minLen = this.greedyD;           // запоминаем её и путь:
            this.minWay = Salesman.copy(this.minWay, this.way);
         }
         if( ++this.greedyJ >= this.N ){          // закончили перебор стартовых городов
            this.stop();                          // убиваем таймер
            break;                                // прекращаем итерации
         }
         for(let i=0; i < this.N; i++ )           // иначе продолжаем
            this.way[i] = i;                      // все города
         Salesman.swap(this.way, 0, this.greedyJ);// j-тый город ставим первым 
         this.last = this.greedyJ;                // последний посещённый город
         this.left = 1; this.greedyD = 0;                         
      }      

   } while(--num);
   this.timeTot += (window.performance.now() - time);
   this.outInfo(" start: "+this.greedyJ+" left: "+this.left);
}
/****************************************************************************************
* Эвристика перестановки узлов
*/
Salesman.prototype.swapInit = function()
{
   this.beg1 = 0; this.beg2 = 1;                 // первый сегмент пути
   this.end1 = 2; this.end2 = 3;                 // второй сегмент пути
   this.cntSwaps = this.totSwaps = 0;            // число перестановок на круге и всего
   this.ok = false;
}
/****************************************************************************************
* Переход к следущему и предыдущему узлу "по кругу"
*/
Salesman.prototype.next = function(i) {  return ++i >= this.N ? 0: i;        } 
Salesman.prototype.prev = function(i) {  return --i <  0      ? this.N-1: i; } 
/****************************************************************************************
* Эвристика перестановки узлов
*/
Salesman.prototype.swapTimer = function()
{
   let num = this.loops;                          // итераций за один "тик" таймера
   let time = window.performance.now();           // время в начале функции
   do{         
      let oldL = this.dists[this.minWay[this.beg1]][this.minWay[this.beg2]]
               + this.dists[this.minWay[this.end1]][this.minWay[this.end2]];
      let newL = this.dists[this.minWay[this.beg1]][this.minWay[this.end1]]
               + this.dists[this.minWay[this.beg2]][this.minWay[this.end2]];
      if(oldL > newL){                            // надо их переставлять местами          
         let lf = this.beg2, rt = this.end1;
         while(true){                             // переворачиваем их последовательность
            Salesman.swap(this.minWay, lf, rt);
            if( (lf=this.next(lf)) === rt || (rt=this.prev(rt)) === lf ) 
               break;
         }
         this.minLen -= oldL - newL;
         this.cntSwaps++; this.totSwaps++;
      }
          
      this.end1 = this.end2;                      // сдвигаем второй сегмент
      this.end2 = this.next(this.end1);   
      this.ok = true;      
      if(this.end2 === this.beg1){                // он обошел круг
         if(this.cntSwaps){                       // были перестановки
            this.cntSwaps = 0;                    // ещё раз обойдём
            this.ok = false;
         }
         else{                                    // иначе сдвигаем первый сегмент
            this.beg1 = this.beg2;            
            this.beg2 = this.next(this.beg1);
         }
         this.end1 = this.next(this.beg2);        // второй сегмент ставим после первого
         this.end2 = this.next(this.end1); 
      }
      if(this.beg1 === 0 && this.end1 === 2 && this.cntSwaps === 0 && this.ok){  
         this.stop();                             // обошли круг без перестановок
         break;
      }                      
      
   } while(--num);
   this.timeTot += (window.performance.now() - time);
   this.outInfo(" beg:"+this.beg1+" end:"+this.end1+" swaps: "+this.totSwaps);
}
/****************************************************************************************
* Эвристика перестановки узлов
*/
Salesman.prototype.moveInit = function()
{
   if(!this.permN) this.permN = 4;               // количество перестановок
   this.subWay = new Array(this.permN+2);        // массив перестановок                     
   this.beg=0; this.end = this.permN+1;          // индексы, окружающие массив перестановок   
   this.cntSwaps = this.totSwaps = 0;            // число перестановок на круге и всего
}
/****************************************************************************************
* Длина подпути без замыкающего расстояния
*/
Salesman.prototype.subDistance = function(way, n)
{
   if(n === undefined) n = way.length;
   let d=0;
   for(let i=1; i < n; i++)
      d += this.dists[way[i-1]][way[i]];
   return d;
}
/****************************************************************************************
* Перестановки элементов массив
*/
Salesman.prototype.permutation = function(lf, rt, time)
{
   if(lf >= rt){                                  // перестановки окончены
      let d = this.subDistance(this.subWay);
      if(d < this.subLen){                        // этот вариант лучше - сохраняем его
         this.minLen -=  (this.subLen - d);
         this.subLen = d;
         for(let i=0, k = this.beg; i < this.subWay.length; i++){ 
            this.minWay[k] = this.subWay[i];
            k = this.next(k);
         }
         this.cntSwaps++; this.totSwaps++;
         this.timeMin = this.timeTot + (window.performance.now() - time);
      }
      return;
   }
    
   this.permutation(lf+1, rt, time);              // перестановки элементов справа от lf
   for(let i=lf+1; i < rt; i++){                  // теперь каждый элемент ar[i], i > lf
      Salesman.swap(this.subWay, lf, i);          // меняем местами с ar[lf]
      this.permutation(lf+1, rt, time);           // и снова переставляем всё справа
      Salesman.swap(this.subWay, lf, i);          // возвращаем элемент ar[i] назад
   }
}
/****************************************************************************************
* Эвристика перестановки узлов
*/
Salesman.prototype.moveTimer = function()
{
   let num = this.loops;                          // итераций за один "тик" таймера
   let time = window.performance.now();           // время в начале функции
   do{          
      for(let i=0, k = this.beg; i < this.subWay.length; i++){ 
         this.subWay[i] = this.minWay[k];
         k = this.next(k);
      }  
      this.subLen = this.subDistance(this.subWay);
      
      this.permutation(1, this.subWay.length-1, time);      
      this.beg = this.next(this.beg);         
      this.end = this.next(this.end);
      if(this.beg === 0){                         // круг оконочен
         if(!this.cntSwaps){
            this.stop();                          // обошли круг без перестановок
            break;
         }
         this.cntSwaps = 0;                       // ещё раз пройдёмся
      }
   } while(--num);
   this.timeTot += (window.performance.now() - time);
   this.outInfo('beg:'+this.beg+' swap:'+this.totSwaps);
}
/****************************************************************************************
* Охватываем точки на плоскости выпуклым полигоном при помощи алгоритма Джарвиса
* Сначала ищем самую верхнюю из самых левых точек cur (верхний левый угол - ось y вниз!)
* Она лежит на охватывающем полигоне. Затем находим ближайшую к ней точку nxt, такую,
* что вектор в  остальные точки лежит справа от вектора проходящей через nxt - cur.
* Это проверяется знаком векторного произведения (nxt - cur) x (i - cur) > 0
* Этот nxt делаем cur и повторяем (против часовой стрелки), пока не вернёмся к исходной
*/
Salesman.prototype.laceInit = function()
{
   let time = window.performance.now();           // время в начале функции
   let p = this.pos;                              // точки на плоскости
   this.minWay = [];                              // номера точек, образующих полигон

   let beg = 0;                                   // номер самой верхней из самых левых
   for (let i = 1; i < p.length; i++)
      if (p[i].x < p[beg].x || (p[i].x === p[beg].x && p[i].y < p[beg].y))
         beg = i;

   let cur = beg, prv=-1;                         // cur-текущая точка на полигоне
   do{
      this.minWay.push(cur);                      // добавляем точку в полигон
      let nxt = cur > 0? cur-1: 1;                // любая, отличная от cur
      for (let i = 0; i < p.length; i++)          // ищем следующую точку
         if ( i!==prv ){
            let nx = p[nxt].x - p[cur].x, ny = p[nxt].y - p[cur].y;
            let ix = p[i].x   - p[cur].x, iy = p[i].y   - p[cur].y;
            let s = nx*iy - ny*ix;                // векторное произведение n x i
            if(s === 0 && Salesman.isInArray(this.minWay, i))
               continue;                          // cur, nxt, i на одной линии и i была
            if (s > 0 || (s === 0 && ix*ix+iy*iy < nx*nx+ny*ny) )
               nxt = i;                           // справа или ближайшая
         }
      prv = cur;
      cur = nxt;
   }
   while (cur !== beg);                           // пока не вернулись в начало

   this.was = new Array(this.N);                  // пройден путь через точку или нет
   for(let i=0; i < this.minWay.length; i++)
      this.was[this.minWay[i]] = true;
   this.minLen = this.distance(this.minWay);      // длина контура будет расти

   this.timeTot = window.performance.now() - time;// время вычислений
   this.outInfo();
}
/****************************************************************************************
* Таймерный вызов метода шнурка
89,91,53,34,58,48,96,52,24,64,80,94,73,38,35,76,85,49,87
*/
Salesman.prototype.laceTimer = function()
{
   let num = this.loops;                          // итераций за один "тик" таймера
   let time = window.performance.now();           // время в начале функции
   do{
      if(this.minWay.length === this.N ){         // все города уже в пути
         this.stop();                             // убиваем таймер
         break;                                   // прекращаем итерации
      }

      let minD = Infinity, minI1, minI2, minI;
      for(let i1=0;i1 < this.minWay.length; i1++){// бежим по уже существующим сегментам
         let i2 = (i1+1 < this.minWay.length)? i1+1: 0;
         let d12 = this.dists[this.minWay[i1]][this.minWay[i2]];
         for(let i=0; i < this.N; i++){           // перебераем все города,
            if(this.was[i])                       // которые не попали пока в путь
               continue;
            let d = this.dists[this.minWay[i1]][i]// на сколько изменится длина пути
                  + this.dists[i][this.minWay[i2]]// при добавлении города i в сегмент
                  - d12  ;
            if( d < minD ){                       // наименьшее изменение запоминаем
               minD = d;
               minI1 = i1; minI2 = i2; minI = i;
            }
            if(minD === 0)                        // точка i лежит на прямой i1-i2
               break;
         }
      }
      this.was[minI] = true;                      // помечаем, что в этом городе были
      this.minWay.splice(minI2, 0, minI);         // вставляем перед minI2

   } while(--num);
   this.timeTot += window.performance.now() - time;

   this.minLen = this.distance(this.minWay);
   this.outInfo(", N: "+this.minWay.length);
}
/****************************************************************************************
* Подготовка к поиску жадным алгоритмом с возвратами
* n  - сколько городов в массиве way были посещены
* len - длина накопленного пути (массив p)
*/
Salesman.prototype.backInit = function()
{
   this.close = new List();                       // менеджер памяти узлов
   this.cntN1 = 0;                                // число узлов на глубине 1
   this.cntCircleBest= 0;                        // когда больше граница по кругам
   this.cntMatrixBest = 0;                        // когда больше граница по матрице

   this.open  = new List();                       // список узлов для анализа
   for(let i=1; i < this.N; i++)                  // помещаем лучший путь и его варианты
      for(let j = this.N-1; j>i; j--){            // спереди будет лучший путь
         let n = {n:i+1, way:Salesman.copy([],this.minWay), len:0 };
         Salesman.swap(n.way, i, j);
         n.len = this.subDistance(n.way, n.n);
         this.open.unshift(n);                    // помещаем в очередь
         if(n.n === 2) this.cntN1++;              // число узлов глубины 1 
      }
}
/****************************************************************************************
* Таймерный вызов жадным алгоритмом с возвратами
*/
Salesman.prototype.backTimer = function()
{
   let num = this.loops;                          // итераций за один "тик" таймера
   let time = window.performance.now();           // время в начале функции
   do{
      if( this.open.empty() ){                    // очередь пустая
         this.stop();                             // убиваем таймер
         break;
      }
      let n = this.open.shift();                  // берём узел из начала списка
      if(n.n === 2) this.cntN1--;
      if(n.len + this.supDistance(n.way, n.n) >= this.minLen){                    
         this.cntCuts++;                          // уже есть путь короче
         if(this.close.length < 1000) 
            this.close.push(n.way);
         continue;                                // обрываем ветку !!!
      }

      if(n.n === this.N){                         // сформировали полный путь
         this.cntWays++;
         let len = n.len + this.dists[n.way[n.n-1]][n.way[0]];
         if( len < this.minLen){
            this.minLen = len;                    // запоминаем кратчайшее расстояние
            this.minWay = Salesman.copy(this.minWay, n.way);
            this.timeMin = this.timeTot + (window.performance.now() - time);
         }
         continue;                                // новых потомков не будет
      }

      let ar = new Array(this.N-n.n);             // создаём новых потомков:
      for(let i = 0; i < ar.length; i++){        
         let way = Salesman.copy(this.close.length? this.close.shift():[], n.way);
         Salesman.swap(way, n.n, n.n+i);
         ar[i] = {  n  : n.n+1,  way: way,
                    len: n.len + this.dists[n.way[n.n-1]][way[n.n]] 
                 };
      }                                           // и сортируем их:
      ar.sort( function(a,b){ return a.len < b.len? -1:(a.len > b.len)? 1:0 });

      for(let i=ar.length; i--; ) {               // помещаем в open новых потомков
         this.cntNode++;
         this.open.unshift( ar[i] );        
      }
      if(n.n===1)      
         this.cntN1 += ar.length;                 // сколько добавили узов глубины 1

   } while(--num);
   this.timeTot += window.performance.now() - time;
   this.outInfo(", open: " + this.open.length+' n1:'+this.cntN1
     + " c: "+this.cntCircleBest + " m: "+ +this.cntMatrixBest
   );
}
/****************************************************************************************
* Вычисление нижней границы оставшегося оптимального пути после участка way, длиной n
*/
Salesman.prototype.createCircles = function()
{
   let obj = "x1";
   for(let i=1; i < this.N; i++)   
      obj += "+x"+(i+1);
   let cons = new Array(this.N*(this.N-1)/2), k=0;
   for(let j=0; j < this.N; j++)
      for(let i=0; i < j; i++)
         cons[k++] = "x"+(j+1) + "+x"+(i+1) + "<="+this.dists[j][i];
   
   let output = YASMIJ.solve( {type: "maximize", objective : obj, constraints: cons} );   
   this.circles = new Array(this.N);
   for(let i=0; i < this.N; i++)
      this.circles[i] = output.result["x"+(i+1)];
}
/****************************************************************************************
* Вычисление нижней границы оставшегося оптимального пути после участка way, длиной n
*/
Salesman.prototype.circlesLen = function()
{
   if(!this.circles)
      return 0;
   let len = 0;
   for(let i=0; i < this.N; i++)   
      len += this.circles[i];
   return 2*len;
}
/****************************************************************************************
* Вычисление нижней границы оставшегося оптимального пути после участка way, длиной n
* используя радиусы окружностей вокруг городов
*/
Salesman.prototype.supDistanceCircle = function(way, n)
{
   if(!this.circles || this.circles.length !== this.N) 
      return 0;                                   // нет окружностей

   let sum = 0;
   for(let k = n; k < this.N; k++)
      sum += this.circles[way[k]];
   return 2*sum + this.circles[way[0]] + this.circles[way[n-1]];
}
/****************************************************************************************
* Вычисление нижней границы оставшегося оптимального пути после участка way, длиной n
* используя матрицу расстояний
*/
Salesman.prototype.supDistanceMatrix = function(way, n)
{
   if(!this.src || this.src.length !== this.N){   // один раз выделяем память под массивы
      this.src = new Array(this.N);               // можно ли из i-го города перейти
      this.des = new Array(this.N);               // можно ли в  i-й  город  перейти
      this.mat = new Array(this.N);               // временная матрица расстояний
      for(let i=0; i < this.N; i++) this.mat[i] = new Array(this.N);
      for(let i=0; i < this.N; i++) this.mat[i][i] = -1;
   }
   
   for(let i=0; i < this.N; i++) this.src[i]=this.des[i]=true;
   for(let i=0; i < n-1; i++) this.src[way[i]] = false;
   for(let i=1; i < n;   i++) this.des[way[i]] = false;   
   
   for(let j=0; j < this.N; j++)                  // заполняем матрицу расстояний
      if(this.src[j])
         for(let i=0; i < this.N; i++)
            if(i!==j && this.des[i])
               this.mat[j][i] = this.dists[j][i];
   this.mat[way[n-1]][way[0]] = -1;               // нельзя вернуться в начало не закончив
   
   let sum = 0;                                   // сумма всех минимумов
   for(let j=0; j < this.N; j++)                  // бежим по строкам
      if(this.src[j]){                            // из которых разрешены переходы
         let min = Infinity;                      // ищем минимум в строке
         for(let i=0; i < this.N; i++)
            if(i!==j && this.des[i] && this.mat[j][i] >= 0 && min > this.mat[j][i])
               min = this.mat[j][i];
         if( 0 < min && min < Infinity ){
            sum += min;                           // добавляем минимум в оцену границы
            for(let i=0; i < this.N; i++)         // вычитаем минимум из строки
               if(i!==j && this.des[i] && this.mat[j][i] > 0)
                  this.mat[j][i] -= min;            
         }
      }
      
   for(let i=0; i < this.N; i++)                  // бежим по колонкам
      if(this.des[i]){                            // в которые разрешены переходы
         let min = Infinity;                      // ищем минимум в колонке
         for(let j=0; j < this.N; j++)
            if(i!==j && this.src[j] && this.mat[j][i] >= 0 && min > this.mat[j][i])
               min = this.mat[j][i];
         if( 0 < min && min < Infinity )
            sum += min;                           // добавляем минимум в оцену границы
      } 

   return sum;                                    // возвращаем нижнюю границу пути
}
/****************************************************************************************
* Вычисление нижней границы оставшегося оптимального пути после участка way, длиной n
*/
Salesman.prototype.supDistance = function(way, n)
{
   if(n >= this.N) return 0;
   
   let dc = this.supDistanceCircle(way, n);
   let dm = this.supDistanceMatrix(way, n);
   if(dc > dm) {
      this.cntCircleBest++;
      return dc;
   }
   if(dm > dc) 
      this.cntMatrixBest++;
   return dm;
}
/****************************************************************************************
* Подготовка к направленному поиску
* dp - длина накопленного пути (массив p)
* dg - длина оставшегося пути жадным алгоритмом ( dp+dg = длина всего пути)
*/
Salesman.prototype.searchInit = function()
{
   this.greedy();                                 // стартовый город жадным алгоритмом
   this.open = new Queue();
   this.open.lt = function(a,b){return a.v < b.v;}// сортировка узлов
   this.open.unshift( { v:0, dp:0, dg:this.minLen, p:[this.minWay[0]] } );
   this.total = Salesman.factorial(this.N-1);     // число необходимых перестановок
}
/****************************************************************************************
* Таймерный вызов направленного алгоритма
*/
Salesman.prototype.searchTimer = function()
{
   let num = this.loops;                          // итераций за один "тик" таймера
   let time = window.performance.now();           // время в начале функции
   do{
      if( this.open.empty() ){                    // очередь пустая
         this.stop();                             // убиваем таймер
         break;                                   // выходим из цикла для вывода
      }

      let n = this.open.shift();                  // берём узел из начала списка
      if(n.dp >= this.minLen){                    // уже есть путь короче
         this.cntCuts++;                          // количество обрывов веток
         continue;                                // обрываем ветку !!!
      }

      for(let i=0; i < this.N; i++) this.was[i]=false;
      for(let i=0; i < n.p.length; i++){
         this.was[n.p[i]] = true;                 // города где были
         this.way[i] = n.p[i];                    // в начале way - где уже побывали
      }
      let k = n.p.length;
      for(let i = 0; i < this.N; i++)
         if(!this.was[i]) this.way[k++] = i;      // в конце - где ещё не были

      if(n.p.length + 1 === this.N){              // сформировали полный путь
         this.cntWays++;                          // сколько раз дошли до дна
         let i = this.way[this.N-1];              // последний город
         let d = n.dp + this.dists[n.p[this.N-2]][i]+this.dists[i][n.p[0]];
         if( d < this.minLen){
            this.minLen = d;                      // запоминаем кратчайшее расстояние
            this.minWay = Salesman.copy(this.minWay, this.way);
            this.timeMin = this.timeTot + (window.performance.now() - time);
         }
         continue;                                // новых потомков не будет
      }


      let d = n.dp, lf=n.p.length;                // помещаем в open новые узлы
      n.p.push(-1);                               // будет ещё один город
      for(let i = lf; i < this.N; i++){
         Salesman.swap(this.way, lf, i);          // очередной город на начало
         n.p[lf] = this.way[lf];
         n.dp = d + this.dists[this.way[lf-1]][this.way[lf]];
         //n.dg = this.greedyWay(n.p);
         this.cntNode++;
         this.open.unshift( {v:n.dp/lf, dp:n.dp, dg:n.dg, p:Salesman.copy([], n.p) } );
         //this.open.unshift( {v:n.dp+n.dg, dp:n.dp, dg:n.dg, p:Salesman.copy([], n.p) } );
      }

   } while(--num);
   this.timeTot += window.performance.now() - time;
   this.outInfo(", open: " + this.open.length);
}
/****************************************************************************************
* Подготовка к методу ветвей и границ
*/
Salesman.prototype.boundInit = function()
{
   let root = new Salesway(this.N, this.N);       // корневой узел дерева
   root.init(this.dists);                         // помещаем в него исходную матрицу
   root.calcBound();                              // вычисляем нижнюю границу
   this.open = new Queue();                       // приоритетная очередь
   this.open.lt = function(a,b) { return a.value < b.value };
   this.open.unshift(root);                       // помещаем в неё корень
}
/****************************************************************************************
* Таймерный вызов перебора всех перестановок
*/
Salesman.prototype.boundTimer = function()
{
   let log = false;                               // выводим или нет отладку
   let num = this.loops;                          // итераций за один "тик" таймера
   let time = window.performance.now();   
   do{
      if( this.open.empty() ){                    // очередь пустая
         this.stop();                             // убиваем таймер
         break;
      }

      let rt = this.open.shift();                 // берём узел из начала списка
      if(log) rt.printLog("boundTimer:"+" minDist="+this.minLen);

      if(rt.boundLen >= this.minLen){             // уже есть путь лучше
         this.cntCuts++;                          // число отсечений
         continue;
      }

      let lf = new Salesway(rt.num-1, this.N);    // левая ветвь дерева
      let res = rt.selectPair();                  // ищем максимальный прирост оценки
      lf.setWay(rt, res.jj, res.ii);              // копируем, исключая res.jj, res.ii
      lf.calcBound();                             // вычисляем нижнюю границу длины пути

      rt.boundLen += res.max;                     // уточняем границу снизу
      if(rt.boundLen < this.minLen){              // сначала правую ветку
         rt.blockWay(res);                        // блокируем путь res.jj - res.ii
         rt.value = rt.boundLen/(this.N+1-rt.num);// по value сортируем очередь
         this.open.unshift(rt);                   // запихиваем в неё правую ветвь
         this.cntNode++;                          // число сформированных узлов
      }
      if(log) lf.printLog();
      if(lf.num===1){                             // дошли до конца
         this.cntWays++;
         if(log) console.log("---------------------------------")
         if(lf.boundLen < this.minLen){           // и это путь лучший (? финал)
            this.minLen = lf.boundLen;            // запоминаем его
            this.minWay = lf.getPath()[0];        // получаем массив пути
            this.timeMin = this.timeTot + (window.performance.now() - time);
            if(log) console.log("!!!"+"len="+this.minLen.toFixed(2)+" way"+this.minWay)
         }
      }
      else if(lf.boundLen < this.minLen){         // оценка снизу меньше минимальной
         lf.value = lf.boundLen/(this.N+1-lf.num);
         this.open.unshift(lf);                   // помещаем узел левой ветки
         this.cntNode++;                          // число сформированных узлов
      }
      else
         this.cntCuts++;                          // число отчечений
   } while(--num);                                // крутимся loops раз
   this.timeTot += window.performance.now() - time;

   this.outInfo(", open: "+this.open.length);     // выводим текущие результаты
}
/****************************************************************************************
* Частично сформированный путь и отставшиеся элементы матрицы расстояний
* Используется в методе ветвей и границ
****************************************************************************************/

function Salesway(num, cities)
{
   this.num   = num;                              // размерность матриц расстояний
   this.dists = new Array(num*num);               // оставшиеся варианты расстояний
   this.src   = new Array(num);                   // города из которых можно ещё перейти
   this.des   = new Array(num);                   // города в которые можно ещё перейти
   this.frw   = new Array(cities);                // участки пути в одну сторону
   this.rev   = new Array(cities);                // участки пути в обратную сторону
}
/****************************************************************************************
* Начальная инициализация пути по исходной матрицы расстояний
*/
Salesway.prototype.init = function (dists)
{
   for(let j=0, k=0; j < dists.length; j++){
      for(let i=0; i < dists.length;  i++)
         this.dists[k++] = dists[j][i];           // квадратная матрица в линейном массиве
      this.src[j] = this.des[j] = j;              // в именах строк и колонок все города
      this.frw[j] = this.rev[j] = -1;             // пока нет участков пути
   }
   this.boundLen = this.value = 0;                // накопленная оценка снизу и её ценность
}
/****************************************************************************************
* Найти минимальное значение в i-й строке или i-й колонке (если col=true)
*/
Salesway.prototype.getMin = function (i, col)
{
   let min = Infinity;                            // минимум разрешённых расстояний
   for(let j=0; j < this.num; j++){                
      let m = col? this.dists[j*this.num+i]: this.dists[i*this.num+j];
      if(m===0) return 0;                         // меньше 0 быть не может
      if(m > 0 && m < min) min = m;               // только не отрицательные расстояния
   }
   return min;
}
/****************************************************************************************
* Найти наиболее подходящий путь для очередного перехода в левой ветви дерева
*/
Salesway.prototype.selectPair = function ()
{
   let ii=0, jj=1, minI, minJ, max=-1;
   for(let j=0; j < this.num; j++)
      for(let i=0; i < this.num; i++){            // бежим по всем ячейкам матрицы,
         if(this.dists[j*this.num+i]) continue;   // которые равны нулю
         this.dists[j*this.num+i]=-1;             // временно блокируем этот переход
         let mJ = this.getMin(j);                 // получаем минимум в строке j
         let mI = this.getMin(i,true);            // и в колонке i
         this.dists[j*this.num+i]=0;              // убираем блокировку
         if(mI+mJ > max){ max=mI+mJ; ii=i; jj=j; minI=mI; minJ=mJ; }
      }
    return {max:max, minI:minI, minJ:minJ, ii:ii, jj:jj};
}
/****************************************************************************************
* Блокируем путь res.jj - res.ii
*/
Salesway.prototype.blockWay = function (res)
{
   this.dists[res.jj*this.num+res.ii] = -1;     // блокируем путь jj-ii
   if(res.minJ)                                 // если минимум в строке не нулевой 
      for(let i=0; i < this.num; i++) if(this.dists[res.jj*this.num+i] > 0)
         this.dists[res.jj*this.num+i] -= res.minJ;
   if(res.minI)                                 // если минимум в колонке не нулевой
      for(let j=0; j < this.num; j++) if(this.dists[j*this.num+res.ii] > 0)
         this.dists[j*this.num+res.ii] -= res.minI;
}
/****************************************************************************************
* Сжать расстояния по строкам
*/
Salesway.prototype.minimizeRows = function ()
{
   let sum = 0;
   for(let j=0; j < this.num; j++){
      let min = this.getMin(j);                  // ищем минимум в строке
      if(min < Infinity){
         sum += min;
         for(let i=0; i < this.num; i++)         // вычитаем его из элементов строки
            if( this.dists[j*this.num+i] >=0 )
               this.dists[j*this.num+i] -= min;
       }
   }
   return sum;
}
/****************************************************************************************
* Сжать расстояния по столбцам
*/
Salesway.prototype.minimizeCols = function ()
{
   let sum = 0;
   for(let i=0; i < this.num; i++){
      let min = this.getMin(i, true);             // ищем минимум в колонке
      if(min < Infinity){
         sum += min;
         for(let j=0; j < this.num; j++)          // вычитаем его из элементов столбика
            if( this.dists[j*this.num+i] >=0 )
               this.dists[j*this.num+i] -= min;
      }
   }
   return sum;
}
/****************************************************************************************
* Сжать расстояния по строкам и столбцам
*/
Salesway.prototype.calcBound = function ()
{
   this.boundLen += this.minimizeRows() + this.minimizeCols();
   this.value = this.boundLen;
   return this.boundLen;
}
/****************************************************************************************
* Скопировать массивы пути way исключая строку  wj и колонку wi
*/
Salesway.prototype.copyWay = function (way, wj, wi)
{
   for(let j=0, k=0; j < way.num; j++)            // копируем заголовки строчек
      if(j!==wj) this.src[k++] = way.src[j];

   for(let i=0, k=0; i < way.num; i++)            // копируем заголовки колонок
      if(i!==wi) this.des[k++] = way.des[i];

   for(let j=0, k=0; j < way.num; j++)            // копируем матрицу расстояний
      if(j!==wj)                                  // удаляем строку wj
         for(let i=0; i < way.num; i++)
           if(i!==wi)                             // удаляем столбец wi
              this.dists[k++] = way.dists[j*way.num+i];

   for(let k=0; k < way.frw.length; k++){         // копируем участки пути
      this.frw[k] = way.frw[k];
      this.rev[k] = way.rev[k];
   }
   this.boundLen = way.boundLen;
}
/****************************************************************************************
* Установить путь wj -> wi, где wj,wi положение в оставшейся матрице расстояний
*/
Salesway.prototype.setWay = function (way, wj, wi)
{
   this.copyWay(way, wj, wi);                     // копируем way, исключая строку,столбец

   let cityJ = way.src[wj], cityI = way.des[wi];  // города перехода  cityJ -> cityI
   let backJ, backI;                              // обратный переход backI -> backJ
   for(let k=0; k < this.num; k++)                // находим его индексы в массиве
      if(this.src[k]===cityI){ backJ=k; break; }  // src
   for(let k=0; k < this.num; k++)                // и в массиве
      if(this.des[k]===cityJ){ backI=k; break; }  // des
   this.dists[backJ*this.num+backI] = -1;         // блокируем переход cityI -> cityJ

   this.frw[cityJ] = cityI;                       // ставим переход из cityJ -> cityI
   let end = cityI;                               // и ищем конец этой цепочки переходов
   while( this.frw[end] >=0 )
      end = this.frw[end];

   this.rev[cityI] = cityJ;                       // запоминаем обратный переход
   let beg = cityJ;                               // и ищем начало этой цепочки переходов
   while( this.rev[beg] >=0 )
      beg = this.rev[beg];

   let kJ=0, kI=0;                                // блокируем end -> beg в матрице
   for(; kJ < this.num; kJ++)                     // для этого ищем индекс kJ конца end
      if(this.src[kJ]===end) break;               // в строках src
   for(; kI < this.num; kI++)                     // и индекс kI 
      if(this.des[kI]===beg) break;               // в колонках des
   this.dists[kJ*this.num+kI] = -1;               // и блокируем его 
}
/****************************************************************************************
* Вернуть участки сформированного пути
*/
Salesway.prototype.getPath = function ()
{
   let list = [];                                 // результирующий массив массивов
                
   for(let k=0; k < this.rev.length; k++){        // по массиву с обратными путями
      if(this.rev[k] >= 0 || this.frw[k] < 0)
         continue;                                // ищем начало последовательности

      let ar = [k], n = k;                        // массив участком пути
      while( this.frw[n] >= 0 ){                  // заполняем его
         n = this.frw[n];
         ar.push(n);
      }
      list.push(ar);                              // добавляем участок в общий список
   }
   return list;
}
/****************************************************************************************
* Вывести таблицу расстояний в таблицу
*/
Salesway.prototype.setTable  = function (tbl, digits)
{
   if(digits===undefined) digits = 2;
   tbl.innerHTML="";                              // очищаем таблицу
   for(let i=0; i <= this.num; i++){              // создаём таблицу (num+1)x(nim+1)
      tbl.appendChild(document.createElement('tr'));
      for(let j=0; j <= this.num; j++)
         tbl.rows[i].appendChild(document.createElement(j && i? 'th' : 'td' ));
   }

   for(let k=1; k <= this.num; k++)              // первая строка (заголовок)
      tbl.rows[0].cells[k].innerHTML = this.des[k-1];

   for(let j=1; j <= this.num; j++){
      tbl.rows[j].cells[0].innerHTML=this.src[j-1];// первая колонка и её стиль
      for(let i = 1; i <= this.num; i++){           // собственно расстояния
         let d = this.dists[(j-1)*this.num+i-1];
         tbl.rows[j].cells[i].innerHTML = d >=0 ?
          ((d==0?'<b class="red">':"")+d.toFixed(digits)+(d==0?'</b>':"")): "-";
      }
   }
}
/****************************************************************************************
* Покрасить ячейки вдоль пути way в матрице расстояний в цвет color
*/
Salesway.prototype.setPathInTable  = function (tbl, way, color)
{
   let i=1;
   for(; i < way.length; i++)
      tbl.rows[way[i-1]+1].cells[way[i]+1].style = "color:"+color;
   tbl.rows[way[i-1]+1].cells[way[0]+1].style = "color:"+color;
}
/****************************************************************************************
* Напечатать матрицу расстояний в логе
*/
Salesway.prototype.printLog = function (st)
{
   if(st) console.log(st);
   console.log(JSON.stringify(this.getPath())+" len = " + this.boundLen);
   console.log("_|"+this.des+"_");
   for(let j=0; j < this.num; j++){
      let st = this.src[j]+"|";
      for(let i=0; i < this.num; i++)
         st += (this.dists[j*this.num+i]>=0? this.dists[j*this.num+i]: "-")+" ";
      console.log(st);
   }
}
