'use strict';
/****************************************************************************************
             Работа со списками :
             List  - односторенние с фиктивными beg и end
             List1 - односторонние с beg, end реально указывающие на первый и последний
             List2 - двухсторонние

Список определяется указателями на первый - beg и последний - end его узел.
Сам узел, это структура { nm, prv, nxt }, хранящая имя узла nm (его может не быть)
и указатели prv - на предыдущий и nxt - на следующий узел.

                                          (с) 2016-nov steps: synset.com, absolutist.com
****************************************************************************************/

/****************************************************************************************
*
*                   Односторонние списки с фиктивными узлами beg, end
*
****************************************************************************************/
function List(nm) 
{
   this.end = { nm:null, nxt:null };              // фиктивный последний элемент списка
   this.beg = { nm:null, nxt:this.end };          // фиктивный первый элементы списка
   
   this.length =  0;                              // число узлов в списке (пустой)
   
   if(nm !== undefined)                           // если есть аргумент nm
      this.push(nm);                              // сразу вставляем первый элемент 
}
/****************************************************************************************
* Вывести список как строку (nm0, nm1, n2,...)
*/
List.prototype.toString = function ()
{
   let n = this.beg.nxt;                          // сразу за beg стоит первый узел
   let st = "(";
   while(n !== this.end){                         // пока нет  фиктивного последнего 
      st += n.nm + (n.nxt!== this.end ? "," : "");// выводим через запятую имена узлов
      n = n.nxt;                                  // переходим к следующему узлу
   }
   return st+")";
}
/****************************************************************************************
* Является ли список пустым
*/
List.prototype.empty = function ()
{
   return this.length === 0;
}
/****************************************************************************************
* Добавить узел с именем nm в конец списка
*/
List.prototype.push = function (nm)
{
   this.length++;                                 // увеличиваем число узлов
   
   this.end.nm = nm;                              // фиктивный end становится реальным
   this.end = this.end.nxt = { nm:null, nxt:null};// и затем снова фиктивным
}
/****************************************************************************************
* Добавить узел с именем nm в начало списка
*/
List.prototype.unshift = function (nm)
{
   this.length++;                                 // увеличиваем число узлов
   
   this.beg.nxt = {nm: nm, nxt:this.beg.nxt};     // вставляемый элемент следует за beg
}
/****************************************************************************************
* Функция меньше по умолчанию
*/
List.prototype.lt = function (a, b)
{
   return a < b;
}
/****************************************************************************************
* Добавить узел с именем nm с начала списка, выдерживая его упорядоченным (функция lt)  
*/
List.prototype.add = function (nm)
{      
   let n = this.beg;                             // бежим от начала
   while(n !== this.end && n.nxt.nm !==null && this.lt(n.nxt.nm,  nm) )
      n = n.nxt;
      
   this.length++;                                 // увеличиваем число узлов
   n.nxt = {nm: nm, nxt:n.nxt};                   // вставляемый элемент следует за n
}
/****************************************************************************************
* Получить поле nm последнего узла и убрать его из списка
*/
List.prototype.pop = function ()
{
   if(this.length === 0)
      return;                                     // список пуст - вернём undefined
   
   this.length--;                                 // уменьшаем число узлов
   
   let n = this.beg.nxt;                          // начиная с первого реального узла,
   while(n.nxt !== this.end)                      // ищем реальный последний узел
      n = n.nxt;                                  // переходя каждый раз к следующему
   
   this.end = n;                                  // фиктивный сдвигаем влево на один
   return n.nm;
}
/****************************************************************************************
* Получить поле nm первого узла и убрать его из списка
*/
List.prototype.shift = function ()
{
   if(this.length===0)
      return;                                     // список пуст - вернём undefined
   
   this.length--;                                 // уменьшаем число узлов  
   
   this.beg  = this.beg.nxt;                      // фиктивный beg ссылается на второй элемент 
   return this.beg.nm;
}
/****************************************************************************************
* Получить узел под номером pos в списке (начиная с нуля)
*/
List.prototype.node = function (pos)
{   
   let n = this.beg.nxt;                         // бежим от начала
   while(n !== this.end && pos-- > 0)
      n = n.nxt;                                 // переходим к следующему узлу
   return n;
}
/****************************************************************************************
* Поменять поле nm узла месте pos в списке (начиная с нуля)
*/
List.prototype.put = function (pos, nm)
{
   return this.node(pos).nm = nm;  
}
/****************************************************************************************
* Получить значение поля nm узла на месте pos в списке (начиная с нуля)
*/
List.prototype.get = function (pos)
{
   return this.node(pos).nm;  
}
/****************************************************************************************
* Добавить узел с именем nm на место pos в списке (начиная с нуля), сдвинув всё вправо
*/
List.prototype.insert = function (pos, nm)
{
   if(pos <= 0)                                   // добавляем в начало
      return this.unshift(nm);
   if(pos >= this.length)                         // добавляем в конец
      return this.push(nm);    
  
   this.length++;                                 // увеличиваем число узлов     
   let n = this.node(pos-1);                      // перед вставляемым узлом
   n.nxt = { nm:nm, prv:n, nxt:n.nxt};           
}
/****************************************************************************************
* Удалить узел на месте pos в списке (начиная с нуля) и вернуть его nm
*/
List.prototype.remove = function (pos)
{  
   if(pos <= 0)                                   // удаляем из начала
      return this.shift();
   if(pos+1 >= this.length)                       // удаляем из конца
      return this.pop();    

   this.length--;                                 // уменьшаем число узлов     
   let n = this.node(pos-1);                      // перед удаляемым узлом
   let nm = n.nxt.nm;
   n.nxt = n.nxt.nxt;      
   return nm;
}
/****************************************************************************************
* Перевернуть последовательность узлов в списке
*/
List.prototype.reverse = function ()
{  
   if(this.length < 2)
      return;

   let n = this.beg.nxt, prv = this.beg;  this.beg.nxt = null;
   while( true ){
      let nxt = n.nxt;
      n.nxt = prv;
      prv = n; 
      if( n == this.end)
         break;
      n = nxt;
   }
   prv = this.beg; this.beg = this.end; this.end = prv;
}
/****************************************************************************************
*
*                              Двухсторонние списки
*
****************************************************************************************/

function List2(nm) 
{
   this.end = { nm:null, prv:null, nxt:null };             // указатель на фиктивный последний элемент списка
   this.beg = { nm:null, prv:null, nxt:this.end }; // указатель на фиктивный первый элементы списка
   this.end.prv = this.beg;
   
   this.length = 0;             // число узлов в списке
   
   if(nm !== undefined)
      this.push(nm);   
}
/****************************************************************************************
* Распечатать список
*/
List2.prototype.toString = function ()
{
   let n = this.beg.nxt;                          // элемент, сразу за фиктивным первым
   let st = "(";
   while(n !== this.end){
      st += n.nm + (n.nxt!== this.end? ",":"");
      n = n.nxt;
   }
   return st+")";
}
/****************************************************************************************
* Добавить узел с именем nm в конец списка
*/
List2.prototype.push = function (nm)
{
   this.length++;                                 // увеличиваем число узлов   
   this.end.nm = nm;   
   this.end = this.end.nxt = { nm:null, prv:this.end, nxt:null };
}
/****************************************************************************************
* Добавить узел с именем nm в начало списка
*/
List2.prototype.unshift = function (nm)
{
   this.length++;                                 // увеличиваем число узлов
   this.beg.nxt = {nm: nm, prv:this.beg, nxt:this.beg.nxt};    
}
/****************************************************************************************
* Получить поле nm последнего узла и убрать его из списка
*/
List2.prototype.pop = function ()
{
   if(this.length===0)
      return;                                     // список пуст - возвращаем undefined
   this.length--;                                 // уменьшаем число узлов
      
   this.end = this.end.prv;
   return this.end.nm;
}
/****************************************************************************************
* Получить поле nm первого узла и убрать его из списка
*/
List2.prototype.shift = function ()
{
   if(this.length===0)
      return;                                     // список пуст - возвращаем undefined
   this.length--;                                 // уменьшаем число узлов
   
   this.beg = this.beg.nxt;
   return this.beg.nm;
}
/****************************************************************************************
* Получить узел под номером pos в списке (начиная с нуля)
*/
List2.prototype.node = function (pos)
{   
   let n;
   if(pos < this.length/2){                       // pos в первой половине списка:
      n = this.beg.nxt;                           // бежим от начала
      while(n != this.end && pos-- > 0)
         n = n.nxt;
   }
   else{                                          // pos во второй половине списка
      pos = this.length-pos-1;
      n = this.end.prv;                           // бежим от конца
      while(n != this.beg && pos-- > 0)
         n = n.prv;   
   }
   return n;
}
/****************************************************************************************
* Поменять поле nm узла месте pos в списке (начиная с нуля)
*/
List2.prototype.put = function (pos, nm)
{
   return this.node(pos).nm = nm;  
}
/****************************************************************************************
* Получить значение поля nm узла на месте pos в списке (начиная с нуля)
*/
List2.prototype.get = function (pos)
{
   return this.node(pos).nm;  
}
/****************************************************************************************
* Добавить узел с именем nm на место pos в списке (начиная с нуля), сдвинув всё вправо
*/
List2.prototype.insert = function (pos, nm)
{
   if(pos <= 0)                                   // добавляем в начало
      return this.unshift(nm);
   if(pos >= this.length)                         // добавляем в конец
      return this.push(nm);    
  
   let n = this.node(pos);
   this.length++;                                 // увеличиваем число узлов     
      
   let nn = { nm:nm, prv:n.prv, nxt:n};           // вставляем nn перед n
   n.prv = nn.prv.nxt = nn;                       // на него ссылается теперь n             
}
/****************************************************************************************
* Удалить узел на месте pos в списке (начиная с нуля) и вернуть его nm
*/
List2.prototype.remove = function (pos, nm)
{  
   if(pos <= 0)                                   // удаляем из начала
      return this.shift();
   if(pos+1 >= this.length)                       // удаляем из конца
      return this.pop();    

   let n = this.node(pos);                        // удаляемый узел
   this.length--;                                 // уменьшаем число узлов     
   n.prv.nxt = n.nxt;   
   n.nxt.prv = n.prv;
   return n.nm;
}
/****************************************************************************************
* Перевернуть последовательность узлов в списке
*/
List2.prototype.reverse = function ()
{  
   if(this.length < 2)
      return;

   let n = this.beg.nxt, prv = this.beg;  this.beg.nxt = null; this.beg.prv = n;
   while( true ){
      let nxt = n.nxt;
      n.prv = n.nxt;
      n.nxt = prv;
      prv = n; 
      if( n == this.end)
         break;
      n = nxt;
   }
   prv = this.beg; this.beg = this.end; this.end = prv;
}
/****************************************************************************************
* Рисуем список в svg-формате
*/
function ListShow(lst, draw)
{
   if(draw === undefined) draw = new Draw();
   draw.clear();
   let svg = ListShow.svg;
   let x = 1, y = 1;                        // левый верхний угол первого ящика
   let y1 = y+svg.arrY;                     // положение линий по y
   let y2 = y+svg.h-svg.arrY, h=svg.h; 
   draw.colorLine(svg.cLine);
   let n = lst.beg, i=0;
   while(n){
      draw.colorText(svg.cText);
      let txt = n===lst.beg? "beg": (n===lst.end? "end":n.nm);
      let w = Math.max(svg.w, svg.chW*(""+txt).length);   // ширина ящика      
      draw.colorFill(svg.cFill);                           // цвет заливки ящика
      draw.box (x+w/2,y+h/2, w, h, 3);
      draw.text(txt, x+w/2, y+h/2);
      draw.colorFill(svg.cLine);                           // цвет заливки точки     
      if(n.nxt && n != lst.end){ 
         let x1 = x+w-2*svg.r, x2 = x+w+svg.skpX-2;
         draw.line(x1, y1, x2,y1);                         // верхняя линия
         draw.point(x1, y1, svg.r);
         draw.line(x2,y1, x2-svg.arrW, y1-svg.arrH);       //стрелка вправо
         draw.line(x2,y1, x2-svg.arrW, y1+svg.arrH);
      }         
      if(n.prv && n != lst.beg){      
         let x1 = x+2*svg.r, x2 = x-svg.skpX+2;      
         draw.line  (x1, y2, x2, y2);                      // нижняя линия
         draw.point(x1, y2, svg.r);         
         draw.line(x2,y2, x2+svg.arrW, y2-svg.arrH);       //стрелка влево
         draw.line(x2,y2, x2+svg.arrW, y2+svg.arrH);    
      }    
      x += w + svg.skpX;
      if(n==lst.end)
         break;
      
      n = n.nxt;
      i++;
   } 
   
   if(lst.length===0 && svg.isBE){                        // пустой спискок
         draw.colorText("#000");
         draw.text("null", x+svg.w/2, y +y+h/2);
         draw.text("b,e", x+svg.w/2, y + h + svg.chW);
      }         
   
   return draw.getSVG(x-svg.skpX+2,  svg.h + 2 + (svg.isBE? 2*svg.chW: 0) );   
}
//------------------------------------------------------------------- элементы svg-файла:
ListShow.svg = {
   h    : 30,             // высота ящика для узла
   w    : 30,             // минимальная ширина ящика для узла
   chW  : 10,             // ширина буквы 
   skpX : 20,             // отступить от соседнего узла вправо
   arrY : 7,              // точка присоединения стрелки (сдвиг от края ящика)
   arrX : 7,
   arrW : 7,              // ширина стрелки 
   arrH : 3,              // половина высоты  стрелки 
   r    : 3,              // радиус кружочка
   cFill: "#FFC",         // цвет заливки
   cText: "blue",         // цвет текста
   cLine: "#CCC",         // цвет линий
};

/****************************************************************************************
*
*     Односторонние списки эквивалентные List, но без инициализации пустых указателей
*     Не использовать. В учебных целях. 
*
****************************************************************************************/
function List0(nm) 
{
   this.end = {  };             // указатель на фиктивный последний элемент списка
   this.beg = { nxt:this.end }; // указатель на фиктивный первый элементы списка
   
   this.length =  0;            // число узлов в списке (пустой)
   
   if(nm !== undefined)         // если есть аргумент nm
      this.push(nm);            // сразу вставляем первый элемент с именем nm фу-ей push
}

/****************************************************************************************
* Добавить узел с именем nm в конец списка
*/
List0.prototype.push = function (nm)
{
   this.length++;                                 // увеличиваем число узлов
   this.end.nm = nm;                              // фиктивный end становится реальным
   this.end = this.end.nxt = {  };                // и затем снова фиктивным
}
/****************************************************************************************
* Добавить узел с именем nm в начало списка
*/
List0.prototype.unshift = function (nm)
{
   this.length++;                                 // увеличиваем число узлов
   this.beg.nxt = {nm: nm, nxt:this.beg.nxt};     // вставляемый элемент следует за beg
}
/****************************************************************************************
* Получить поле nm последнего узла и убрать его из списка
*/
List0.prototype.pop = function ()
{
   if(this.length === 0)
      return;                                     // список пуст - вернём undefined
   this.length--;                                 // уменьшаем число узлов
   
   let n = this.beg.nxt;
   while(n.nxt !== this.end)                      // ищем реальный последний узел
      n = n.nxt;
   
   this.end = n;                                  // фиктивный сдвигает вправо на одни
   return n.nm;
}
/****************************************************************************************
* Получить поле nm первого узла и убрать его из списка
*/
List0.prototype.shift = function ()
{
   if(this.length===0)
      return;                                     // список пуст - вернём undefined
   
   this.length--;                                 // уменьшаем число узлов  
   this.beg  = this.beg.nxt;                      // фиктивный beg ссылается на второй элемент 
   return this.beg.nm;
}

/****************************************************************************************
*
*     Односторонние списки с beg, end реально указывающие на первый и последний
*     Не использовать. В учебных целях. ListShow работает некорректно
*
****************************************************************************************/

function List1(nm) 
{
   this.beg = null;             // указатель на первый    элемент списка (пока в никуда)
   this.end = null;             // указатель на последний элемент списка (пока в никуда)
   
   this.length =  0;            // число узлов в списке

   if(nm !== undefined)         // если есть аргумент nm
      this.push(nm);            // сразу вставляем первый элемент с именем nm фу-ей push   
 }
/****************************************************************************************
* Распечатать список
*/
List1.prototype.toString = function ()
{
   let n = this.beg;
   let st = "(";
   while(n){
      st += n.nm + (n.nxt? ",":"");
      n = n.nxt;
   }
   return st+")";
}
/****************************************************************************************
* Добавить узел с именем nm в конец списка
*/
List1.prototype.push = function (nm)
{
   if(this.length===0){
      this.beg = this.end = { nm: nm, nxt:null }; 
      this.length= 1;
      return;   
   }   
   this.length++;                                 // увеличиваем число узлов
   this.end = this.end.nxt = {nm: nm, nxt:null};
}
/****************************************************************************************
* Добавить узел с именем nm в начало списка
*/
List1.prototype.unshift = function (nm)
{
   if(this.length===0){
      this.beg = this.end = { nm: nm, nxt:null }; 
      this.length= 1;
      return;   
   }   
   this.length++;                                 // увеличиваем число узлов
   this.beg = {nm: nm, nxt:this.beg};
}
/****************************************************************************************
* Получить поле nm последнего узла и убрать его из списка
*/
List1.prototype.pop = function ()
{
   if(this.length < 2){
      if(this.length===0)
         return;                                  // список пуст - возвращаем undefined
      let nm = this.end.nm;                       // возвращаемое значение                                           
      this.beg = this.end = null;                 // был один элемент
      return nm;                                  // был один элемент
   }
   this.length--;                                 // уменьшаем число узлов
 
   let nm = this.end.nm;                          // возвращаемое значение
   
   let n = this.beg;
   while(n.nxt && n.nxt.nxt)                      // ищем предпоследний узел
      n = n.nxt;
      
   n.nxt = undefined;
   this.end = n;
   return nm;
}
/****************************************************************************************
* Получить поле nm первого узла и убрать его из списка
*/
List1.prototype.shift = function ()
{
   if(this.length===0)
      return;    
   
   this.length--;                                 // уменьшаем число узлов
   let nm   = this.beg.nm;                        // возвращаемое значение 
   this.beg = this.beg.nxt;
   return nm;
}
/****************************************************************************************
* Получить узел под номером pos в списке (начиная с нуля)
*/
List1.prototype.node = function (pos)
{   
   let n = this.beg;                              // бежим от начала
   while(n && pos-- > 0)
      n = n.nxt;
   return n;
}
/****************************************************************************************
* Поменять поле nm узла месте pos в списке (начиная с нуля)
*/
List1.prototype.put = function (pos, nm)
{
   return this.node(pos).nm = nm;  
}
/****************************************************************************************
* Получить значение поля nm узла на месте pos в списке (начиная с нуля)
*/
List1.prototype.get = function (pos)
{
   return this.node(pos).nm;  
}
/****************************************************************************************
* Добавить узел с именем nm на место pos в списке (начиная с нуля), сдвинув всё вправо
*/
List1.prototype.insert = function (pos, nm)
{
   if(pos <= 0)                                   // добавляем в начало
      return this.unshift(nm);
   if(pos >= this.length)                         // добавляем в конец
      return this.push(nm);    
  
   this.length++;                                 // увеличиваем число узлов     
   let n = this.node(pos-1);                      // перед вставляемым узлом
   n.nxt = { nm:nm, nxt:n.nxt};           
}
/****************************************************************************************
* Удалить узел на месте pos в списке (начиная с нуля) и вернуть его nm
*/
List1.prototype.remove = function (pos, nm)
{  
   if(pos <= 0)                                   // удаляем из начала
      return this.shift();
   if(pos+1 >= this.length)                       // удаляем из конца
      return this.pop();    

   this.length--;                                 // уменьшаем число узлов     
   let n = this.node(pos-1);                      // перед удаляемым узлом
   let nm = n.nxt.nm;
   n.nxt = n.nxt.nxt;   
   return nm;
}

/****************************************************************************************
*
*     Двухсторонние списки с нефиктивными указателями
*     Не использовать. В учебных целях. ListShow работает некорректно
*
****************************************************************************************/

function List3(nm) 
{
   this.beg = null;             // указатель на первый элемент списка
   this.end = null;             // указатель на последний элемент списка
   this.length = 0;             // число узлов в списке
   
   if(nm !== undefined)
      this.push(nm);   
}
/****************************************************************************************
* Распечатать список
*/
List3.prototype.toString = function ()
{
   let n = this.beg;
   let st = "(";
   while(n){
      st += n.nm + (n.nxt? ",":"");
      n = n.nxt;
   }
   return st+")";
}
/****************************************************************************************
* Добавить узел с именем nm в конец списка
*/
List3.prototype.push = function (nm)
{
   if(this.length===0){
      this.beg = this.end = { nm:nm }; 
      this.length= 1;
      return;   
   }      
   this.length++;                                 // увеличиваем число узлов
   
   this.end = this.end.nxt = {nm:nm, prv:this.end};
}
/****************************************************************************************
* Добавить узел с именем nm в начало списка
*/
List3.prototype.unshift = function (nm)
{
  if(this.length===0){
      this.beg = this.end = { nm:nm }; 
      this.length= 1;
      return;   
   }   
   this.length++;                                 // увеличиваем число узлов
   let n = {nm:nm, nxt:this.beg};                 // это новый узел
   this.beg.prv = n;
   this.beg = n;
}
/****************************************************************************************
* Получить поле nm последнего узла и убрать его из списка
*/
List3.prototype.pop = function ()
{
   if(this.length===0)
      return;                                     // список пуст - возвращаем undefined
   this.length--;                                    // уменьшаем число узлов
   
   let nm = this.end.nm;
   if(this.length===0){                              // список исчерпался      
      delete this.beg;
      delete this.end;                            
   }
   else{
      this.end = this.end.prv;
      delete this.end.nxt;
   }
   return nm;
}
/****************************************************************************************
* Получить поле nm первого узла и убрать его из списка
*/
List3.prototype.shift = function ()
{
   if(this.length===0)
      return;                                     // список пуст - возвращаем undefined
   this.length--;                                 // уменьшаем число узлов
   
   let nm = this.beg.nm;
   if(this.length===0){                           // список исчерпался      
      delete this.beg;
      delete this.end;                            
   }
   else{
      this.beg = this.beg.nxt;
      delete this.beg.prv;
   }
   return nm;
}
/****************************************************************************************
* Получить узел под номером pos в списке (начиная с нуля)
*/
List3.prototype.node = function (pos)
{   
   let n;
   if(pos < this.length/2){                       // pos в первой половине списка:
      n = this.beg;                               // бежим от начала
      while(n && pos-- > 0)
         n = n.nxt;
   }
   else{                                          // pos во второй половине списка
      pos = this.length-pos-1;
      n = this.end;                               // бежим от конца
      while(n && pos-- > 0)
         n = n.prv;   
   }
   return n;
}
/****************************************************************************************
* Поменять поле nm узла месте pos в списке (начиная с нуля)
*/
List3.prototype.put = function (pos, nm)
{
   return this.node(pos).nm = nm;  
}
/****************************************************************************************
* Получить значение поля nm узла на месте pos в списке (начиная с нуля)
*/
List3.prototype.get = function (pos)
{
   return this.node(pos).nm;  
}
/****************************************************************************************
* Добавить узел с именем nm на место pos в списке (начиная с нуля), сдвинув всё вправо
*/
List3.prototype.insert = function (pos, nm)
{
   if(pos <= 0)                                   // добавляем в начало
      return this.unshift(nm);
   if(pos >= this.length)                         // добавляем в конец
      return this.push(nm);    
  
   let n = this.node(pos);
   this.length++;                                 // увеличиваем число узлов     
      
   let nn = { nm:nm, prv:n.prv, nxt:n};           // вставляем nn перед n
   n.prv = nn.prv.nxt = nn;                       // на него ссылается теперь n             
}
/****************************************************************************************
* Удалить узел на месте pos в списке (начиная с нуля) и вернуть его nm
*/
List3.prototype.remove = function (pos, nm)
{  
   if(pos <= 0)                                   // удаляем из начала
      return this.shift();
   if(pos+1 >= this.length)                       // удаляем из конца
      return this.pop();    

   let n = this.node(pos);                        // удаляемый узел
   this.length--;                                 // уменьшаем число узлов     
   n.prv.nxt = n.nxt;   
   n.nxt.prv = n.prv;
   return n.nm;
}
