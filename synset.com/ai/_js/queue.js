'use strict';
/****************************************************************************************
                                        Приоритетная очередь
                                        

                                          (с) 2017-jan steps: synset.com, absolutist.com
****************************************************************************************/

function Queue(maxLength, fix)
{
   if(!maxLength) maxLength = 1023;               // по умолчанию максимум очереди = 1023
   this.ar      = new Array(maxLength+1);         // массив, хранящий узлы очереди
   this.length  = 0;                              // число узлов в очереди
   this.fix     = fix;                            // фиксированный максимальный размер
}
/****************************************************************************************
* Является ли очередь пустой
*/
Queue.prototype.empty = function ()
{
   return this.length === 0;
}
/****************************************************************************************
* Очистить очередь (не освобождая памяти)
*/
Queue.prototype.clear = function ()
{
   this.length=0;
}
/****************************************************************************************
* Функция меньше для узлов дерева
*/
Queue.prototype.lt = function (a, b)
{
   return a < b;
}
/****************************************************************************************
* Перестановка i-го и j-го элементов массива ar
*/
Queue.prototype.swap = function (i, j)
{
   let a = this.ar[i]; this.ar[i] = this.ar[j]; this.ar[j] = a;
}
/****************************************************************************************
* Добавить на дерево узел n
*/
Queue.prototype.unshift = function(n)
{
   this.length++;
   if(this.fix && this.length >= this.ar.length)
      this.length = this.length >> 1;             // уменьшаем очередь

   this.ar[this.length] = n;                      // добавляем узел
   for(let i=this.length; i > 1 && this.lt(this.ar[i], this.ar[i >> 1]); i = i >> 1)
      this.swap(i, i >> 1);                       // движемся вверх к корню
}
/****************************************************************************************
* Вытолкнуть узел с минимальным ключём в виде структуры {k, v}
*/
Queue.prototype.shift = function()
{
   if(this.length===0)                            // очередь пустая
      return;                                     // вернём undefined
   
   this.swap(1, this.length);                     // переставляем корень в конец массива
   this.rebuild(1);                               // перестраиваем дерево
   return this.ar[this.length--];                 // уменьшаем число узлов
}
/****************************************************************************************
* Перестроить дерево от узла node, опустив его на правильное место
*/
Queue.prototype.rebuild = function(node)
{
   let lf = 2*node;                               // левый наследник узла node
   if(lf < this.length){                          // если он есть (игнорируя бывший корень)
      let rt = lf + 1;                            // это правый наследник node
      if(rt < this.length && this.lt(this.ar[rt], this.ar[lf]) )
         lf = rt;                                 // выбираем наименьший (если rt есть)
      if( this.lt(this.ar[lf], this.ar[node]) ){  // если он меньше node
         this.swap(node, lf);                     // переставляем их местами
         this.rebuild(lf);                        // и повторяем операцию
      }
   }   
}
/****************************************************************************************
* Получить дерево узлов 
*/
Queue.prototype.getTree = function(i)
{
   if(!i) i = 1;                                  // первый вызов
   if(i > this.length)
      return {nm:".", hide:true};
   if(i === this.length)
      return { nm: this.ar[i] };
   else 
      return { nm: this.ar[i], ar:[this.getTree(2*i), this.getTree(2*i+1)] };
}