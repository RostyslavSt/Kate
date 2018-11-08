'use strict';
/****************************************************************************************
                              Решение головоломки Ханойские башни
                                Описание: Towers_of_Hanoi.html

                                           (с) 2016-nov steps: synset.com, absolutist.com
*****************************************************************************************/

function Hanoi(nDisks, nTowers)                     
{
   if(!nTowers) nTowers = 3;                      // три башни по умолчанию
   
   this.nDisks  = nDisks;                         // число дисков
   this.nTowers = nTowers;                        // число башен
   
   this.disks = new Array(nDisks);                // номер башни i-того диска
   
   for(let i=0; i < nDisks; i++) 
      this.disks[i] = 0;                          // все диски на нулевой башне 

   this.h     = 120;                              // высота стержня    
   
   this.dx    = 190;                              // шаг по x с которым идут стержни      
   this.diskH = 10;                               // высота диска
   this.setWidth(170, 10);
   this.fly  = this.flyDes =-1;                   // номер летящего диска и целевой башни
   this.flyV = 0.5;                               // скорость летящего диска в px/ms
}
/****************************************************************************************
* Задать ширину основания и стержня, вычислив ширину минимального диска
*/
Hanoi.prototype.setWidth = function (baseW, stickW)
{
   if(!stickW) stickW=10;
   this.w     = stickW;                           // толщина стержня 
   this.baseW = baseW;                            // ширина основания (подставка)      
   this.diskW = this.baseW*0.9/this.nDisks;       // ширина самого маленького диска   
   if(this.diskW  < this.w) this.diskW=1.5*this.w;   
}
/****************************************************************************************
* Вернуть массив disks как строку
*/
Hanoi.prototype.toString = function ()
{
   let res = "";
   for(let i=0; i < this.nDisks; i++)      
      res += this.disks[i];
   return res;
}
/****************************************************************************************
* Определить диск disk на башню tower
*/
Hanoi.prototype.set = function (disk, tower)
{
   if(tower === undefined){                       // задаём по строке
      let len = Math.min(disk.length, this.nDisks);
      for(let i=0; i < len; i++)
         this.disks[i] = Number(disk.charAt(i));
   }
   else
      this.disks[disk] = tower;
   return this;
}
/****************************************************************************************
* Задать башни по массиву дисков
*/
Hanoi.prototype.clone = function (disks)
{
   this.disks = new Array(disks.length);
   for(let i=0; i < disks.length; i++)
      this.disks[i] = disks[i];
   return this;
}
/****************************************************************************************
* Возвращает номер диаметра (с нуля) верхнего диска на башне tower (если пустая, то -1)
*/
Hanoi.prototype.top = function (tower)
{
   for(let i=0; i < this.nDisks; i++)                    
      if(this.disks[i]===tower)                   // сверху самый маленький
         return i;
   return -1;                                     // башня пустая
}
/****************************************************************************************
* Возвращает положение снизу (от нуля) диска на его башне (номер снизу в стопке)  
*/
Hanoi.prototype.pos = function (disk)
{
   let tower = this.disks[disk], id=0;            // башня, где лежит диск   
   for(let i=this.nDisks-1; i > disk ; i--)       // начинаем с более толстых (снизу)
      if(this.disks[i]===tower)   
         id++;
   return id;   
}
/****************************************************************************************
* Переложить верхний диск с башни src на башню des без проверки соблюдения правил
*/
Hanoi.prototype.move = function (src, des)
{
   let s = this.top(src);                         // номер верхнего диска на башне src
   if(s >= 0)                                     // если башня не пустая
      this.disks[s] = des;                        // "переносим" с неё диск
}
/****************************************************************************************
* Убрать диск из башни tower, вернуть его номер
*/
Hanoi.prototype.get = function (tower)
{
   let f = this.top(tower);                       // верхний диск на башне src         
   if(f < 0)
      return -1;                                  // нельзя взять, башня пустая
      
   this.flyX = this.baseW/2+this.disks[f]*this.dx;// диска поднимаем над башней
   this.flyY = this.h + 2*this.diskH - this.h - this.diskH;     
   
   this.disks[f]   = -1;                          // "убираем" (висит в воздухе)   
   return this.fly = f;                           // запоминаем координату взятого
}
/****************************************************************************************
* Задать назначение полёта
*/
Hanoi.prototype.throw = function(des) 
{
   this.flyDes = des;                             // башня назначения
   this.flyD = this.baseW/2+des*this.dx-this.flyX;// это расстояние надо пролетель
   this.flyV = this.flyD>0? Math.abs(this.flyV):  // направление скорости полёта
                           -Math.abs(this.flyV); 
   this.flyD = Math.abs(this.flyD);               // расстояние всегда положительно
}
/****************************************************************************************
* Положить диск с номером disk на башню tower
*/
Hanoi.prototype.put = function (disk, tower)
{
   if(disk >= 0){                                 // если башня не пустая
      this.disks[disk] = tower;                   // "переносим" с неё диск
      if(this.nMoves === undefined) this.nMoves = 0;
      this.nMoves++;
   }
   this.fly = this.flyDes = -1;
}
/****************************************************************************************
* Можно ли переместить диск с башни src на башню des. 
*/
Hanoi.prototype.canMove = function(src, des)
{
   let s = this.top(src), d = this.top(des);
   if(s < 0)
      return false;
   if(d < 0)
      return true;   
   return s < d;
}
/****************************************************************************************
* Можно ли взять с башни tower диск:
*/
Hanoi.prototype.canGet = function(tower) 
{
   return this.top(tower) >= 0;
}
/****************************************************************************************
* Можно ли положить на башню tower диск диаметра disk:
*/
Hanoi.prototype.canPut = function(tower, disk) 
{
   let d = this.top(tower);
   return d < 0 ||  disk < d;
}
/****************************************************************************************
* Нарисовать башни и перекладываемый диск на объекте draw.
* scale - во сколько раз сжать, 
* noFly=true - не выделять над башнями место под летяший диск
* onlyDisks - рисовать только диски, без стержней
* Аргументы могут отсутствовать
*/
Hanoi.prototype.getSVG = function(scale, noFly, onlyDisks)               
{
   if(!scale) scale = 1;
   let draw = new Draw();
   this.show(draw, noFly, onlyDisks);
   let w = (this.nTowers-1)*this.dx+this.baseW, 
       h = (onlyDisks? this.nDisks*this.diskH : this.h) + ((onlyDisks?0:0.25)+(noFly?0:2))*this.diskH;       
   //draw.rect(w/2, h/2, w, h);
   draw.transformAll(1, 1,   0, scale, scale); // 
   return draw.getSVG(scale*w+2, scale*h+2); 
}
/****************************************************************************************
* Нарисовать башни и перекладываемый диск на объекте draw
*/
Hanoi.prototype.show = function(draw, noFly, onlyDisks)               
{
   if(!draw) draw = this.draw;
    
   draw.clear();                                  // очистка области рисования
   
   let x0 = this.baseW/2;                         // координаты основания первого стержня
   let y0 = (onlyDisks? this.nDisks*this.diskH : this.h ) + (noFly?0: 2*this.diskH);
 
   if(!onlyDisks)
   for(let i=0; i < this.nTowers; i++){           // рисуем nTowers башeнь
      draw.colorFill("#555");                     // рисуем стержень и подставку серым:
      draw.box(x0+i*this.dx, y0-this.h/2,        this.w,  this.h, 3);
      draw.box(x0+i*this.dx, y0+this.diskH/4-1,  this.baseW,  0.5*this.diskH, 3);     
   }
   
   draw.colorFill("#069");                        // рисуем диски синим:
   for(let k=0; k < this.nDisks; k++){
      let twr = this.disks[k];
      if(twr >= 0)
         draw.box(x0+twr*this.dx, y0-this.diskH*(this.pos(k)+(onlyDisks? 0: 0.5) ) -2, 
                  this.diskW*(k+1), this.diskH, 3);      
   }
       
   if(this.fly >= 0)                              // анимируем летящий диск (если он есть)
      draw.box(this.flyX, this.flyY, (this.fly+1)*this.diskW, this.diskH, 3);
}
/****************************************************************************************
* Анимация полёта переставляемого диска и вычислений (если они есть)
*/
Hanoi.prototype.timer = function()
{
   if(this.lastTime === undefined) this.lastTime = new Date(); 
   let dt = new Date() - this.lastTime;
   
   if(this.fly>=0 && this.flyDes >= 0){           // подняли диск и определили назначение
      let d = this.flyV *dt;
      this.flyX += d; 
      this.flyD -= Math.abs(d);
      if(this.flyD < 0)                           // закончили лететь
         this.put(this.fly, this.flyDes);
   }
   else if(this.solve)                            // процесс размышлений (задаём извне)
      this.solve(dt);
  
   this.show(this.draw);                          // перерисовываем
   this.lastTime = new Date();
}
/****************************************************************************************
* В точке x,y канваса размерами w,h нотжата кнопка мыши (человек перекладывает)
*/
Hanoi.prototype.mouseUp = function (x,y)
{
   let twr = Math.floor(2*x/(this.baseW+this.dx));// номер башни на которой был клик              
   twr = twr<0? twr=0: (twr>=this.nTowers? this.nTowers-1: twr); 
   
   if(this.fly < 0){                              // ещё не брали, попробуем:
      if(this.canGet(twr))
         this.get(twr);                           // берём
      else
         alert("Вы не можете взять диск с этой башни");         
   }         
   else if(this.flyDes < 0) {                     // можем указать куда
      if(this.canPut(twr, this.fly))              // если можно положить на башню twr
         this.throw(twr);                         // кидаем в неё
      else
         alert("Вы не можете положить диск на эту башню");         
   }
   this.show();
}
/****************************************************************************************
* Вывести последовательность maxMoves решений в документ в текстовом виде
*/
Hanoi.prototype.solveTXT = function(maxMoves)
{     
   let s = this.disks.length%2? 1: -1;            // направление сдвига
   while(maxMoves-- > 0){
      let p = this.disks[0] + s; 
      p = p < 0? 2: (p > 2? 0: p);                // проверка, попадания в границы [0...2]      
      this.disks[0] = p;                          // перекладываем самый маленький
      document.write((s>0?" +":" -")+0);          // и выводим
      
      let p1 = p > 0? p-1: 2;                     // слева  по циклу от маленького      
      let p2 = p < 2? p+1: 0;                     // справа по циклу от маленького      
      let d1 = this.top(p1);                      // верхний на стержне p1 
      let d2 = this.top(p2);                      // верхний на стержне p2 
      
      if(p===1 && d1 < 0 && d2 < 0)               // маленький на месте, слева, справа - никого
         break;                                   // задача решена
         
      if(d2 < 0 || (d1 >= 0 && d1 < d2)){         // перекладывем c p1 на p2
         this.disks[d1] = p2;
         document.write(p1 < p1?" +":" -",d1);    // и выводим
      }
      if(d1 < 0 || (d2>=0 && d2 < d1)){           // перекладывем c p2 на p1
         this.disks[d2] = p1;
         document.write(p2 < p1?" +":" -",d2);    // и выводим
      }            
   }
}
/****************************************************************************************
* Сформировать одно решение
*/
Hanoi.prototype.solveRec = function()
{  
   if(this.state === undefined) this.state = 0; 
   let s = this.disks.length%2? 1: -1;            // направление сдвига
   
   switch(this.state){
      case 0:            
         let p = this.disks[0] + s; 
         p = p < 0? 2: (p > 2? 0: p);             // проверка, попадания в границы [0...2]               
         this.get(this.disks[0]);                 // берём самый маленький
         this.throw(p);                           // кидаем его
         this.last  = p;                          // запоминаем для следующего этапа         
         this.state = 1;         
         break;
      case 1:
         let p1 = this.last > 0? this.last-1: 2;  // слева  по циклу от маленького      
         let p2 = this.last < 2? this.last+1: 0;  // справа по циклу от маленького      
         let d1 = this.top(p1);                   // верхний на стержне p1 
         let d2 = this.top(p2);                   // верхний на стержне p2 
         
         if(p===1 && d1 < 0 && d2 < 0){           // маленький на месте, слева, справа - никого
            return;                               // задача решена
         }
            
         if(d2 < 0 || (d1 >= 0 && d1 < d2)){      // перекладывем c p1 на p2
            this.get(this.disks[d1])
            this.throw(p2);            
         }
         if(d1 < 0 || (d2>=0 && d2 < d1)){        // перекладывем c p2 на p1
            this.get(this.disks[d2])           
            this.throw(p1);
         }   
         this.state = 0;                          // опять маленький
         break;         
    }
}
/****************************************************************************************
* Возвращает массив верхних дисков на каждой баше 
*/
Hanoi.prototype.tops = function()
{
   let towers = new Array(this.nTowers);          // массив верхних дисков на каждой башне
   for(let i=0; i < this.nTowers; i++)
      towers[i] = -1;                             // -1 : башня пустая

   for(let i=0; i < this.nDisks; i++){            // от маленьких к большим
      let twr = this.disks[i];                    // номер башни на которой лежит i-й диск
      if( twr >= 0 &&  towers[twr] < 0 )          // диск лежит и такой башни ещё не было
         towers[twr] = i;
   }
   
   return towers;      
}
/****************************************************************************************
* Возвращает массив разрешённых ходов (в виде строк положений дисков на башнях)
*/
Hanoi.prototype.moves = function()
{
   let mvs = [];
   let towers = this.tops();                      // массив верхних дисков на каждой башне
   for(let i=0; i < towers.length; i++){
      if(towers[i] < 0)
         continue;                                // взять с башни нечего, она пустая
      for(let j=0; j < towers.length; j++)        // бежим по всем остальным дискам
         if(i !== j && ( towers[j] < 0 || towers[i] < towers[j])){ // можно переложить
            let st = "";            
            for(let k=0; k < this.nDisks; k++)    // формируем строку нового состояния 
               st += towers[i]===k? j: this.disks[k];            
            mvs.push(st);                         // добавляем в массив соседних состояний
         }
   }
   return mvs;                                    // возвращаем массив соседних состояний 
}
/****************************************************************************************
* Возвращает дерево всех неповторяющихся переходов из текущего состояния
*/
Hanoi.prototype.treeMoves = function()
{
   let lstWas = {};                               // состояния в которых уже были
   let lstNxt = [];                               // состояния для построения переходов   
   let han    = new Hanoi(this.nDisks, this.nTowers);   
   
   let tree = { }, root = tree;                   // в корне дерева root
   tree.nm = this.toString();                     // помещаем текущее соостояние как строку 
   
   lstNxt.push({ st:tree.nm, tr:tree } );         // и вместе с узлом дерева сохраняем
   lstWas[tree.nm] = "";                          // помечаем, что тут уже были

   while(lstNxt.length){                          // пока очередь не пуста
      let state = lstNxt.shift();                 // берём из её начала состояние
      tree = state.tr;                            // это узел дерева этого состояния
      han.set(state.st);                          // по строке задаём диски 
      let mvs = han.moves();                      // генерим все ходы из этого состояния
      for(let i=0; i < mvs.length; i++)
         if(lstWas[mvs[i]] === undefined){        // если такого ещё не было:
            if(!tree.ar)  tree.ar = [];           // добавляем в дерево:
            tree.ar.push( { nm:mvs[i] } );        
            
            lstWas[mvs[i]] = state.st;            // запоминаем и помещаем в конец списка:
            lstNxt.push( { st:mvs[i], tr:tree.ar[tree.ar.length-1] } );         
         }
   }
   return root;                                   // возвращаем корень дерева
}