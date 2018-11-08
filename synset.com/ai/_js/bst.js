'use strict';
/****************************************************************************************
                                        Бинарные деревья

Узел бинарного дерева, это структура { nm, lf, rt }, хранящая имя узла nm
и указатели на левую ветку lf и правую ветку rt.
Ниже, на левой ветке находятся узлы со значением поля nm меньшим, чем у данного,
а на правой ветке - с большим.

                                          (с) 2016-dec steps: synset.com, absolutist.com
****************************************************************************************/

function BSTree()
{
   this.root = null;                              // кореневой узел дерева
   this.cnt  = 0;                                 // число узлов в дереве
}
/****************************************************************************************
* Является ли дерево пустым
*/
BSTree.prototype.empty = function ()
{
   return this.cnt === 0;
}
/****************************************************************************************
* Добавить на дерево пару ключ k - значение v, слева или справа, в зависимости ключа k
*/
BSTree.prototype.addDown = function(k, v)
{
   this.cnt++;                                    // увеличиваем число узлов
   let n = this.root;                             // начинаем с корня дерева
   while(n){      
      if(k < n.k){                                // ключ k меньше - идём налево,
         if(n.lf) n = n.lf;                       // если есть левая ветка, идём дальше 
         else{                                    // иначе создаём новый узел
            n.lf = { k:k, v:v, lf:null, rt:null }; 
            return;                               
         }
      }
      else if(k > n.k){                           // ключ k больше - идём направо,
         if(n.rt) n = n.rt;                       // если есть правая ветка, идём дальше 
         else{                                    // иначе создаём новый узел
            n.rt = { k:k, v:v, lf:null, rt:null }; 
            return;                               
         }
      }
      else{                                       // ключи совпадают,
         n.lf = { k:k, v:v, lf:n.lf, rt:null };   // вставляем после n
         return; 
      }         
   }
   this.root = { k:k, v:v, lf:null, rt:null };    // в дереве не было узлов - это корень
}
/****************************************************************************************
* Добавить имя на дерево в корень. Не корректно работает с повторяющимися ключами \todo
*/
BSTree.prototype.addRoot = function(k, v)
{
   if( !this.root ){                              // в дереве пока никого нет
      this.root = { k:k, v:v, lf:null, rt:null };
      this.cnt  = 1;
      return;
   }
   this.cnt++;
   this.addRootRec(this.root, k, v);              // вызываем рекурсивную функцию 
}

BSTree.prototype.addRootRec = function(n, k, v)
{      
   if( k <= n.k ){                                 // ключ меньше узла - вставляем влево
      if(k === n.k){
          n.lf = { k:k, v:v, lf:n.lf, rt:null };
          return;
      }   
      if(n.lf) this.addRootRec(n.lf, k, v);           
      else     n.lf = { k:k, v:v, lf:null, rt:null };   
      
      let lf=n.lf, rt=n.rt, nk=n.k, nv=n.v;       // сохраняем указатели
      n.k = lf.k; n.v = lf.v; n.lf = lf.lf;       // ротация влево (k с левой ветки)
      n.rt = { k:nk, v:nv, lf:lf.rt, rt:rt };               
   }  
   
   else if( k > n.k ){                            // ключ больше корня - вставляем вправо
      if(n.rt)  this.addRootRec(n.rt, k, v);           
      else      n.rt = { k:k, v:v, lf:null, rt:null }; 
      
      let lf=n.lf, rt=n.rt, nk=n.k, nv=n.v;       // сохраняем указатели
      n.k = rt.k; n.v = rt.v;  n.rt = rt.rt;      // ротация вправо (k с правой ветки)
      n.lf = { k:nk, v:nv, lf:lf, rt:rt.lf };         
   }

}
/****************************************************************************************
* Случайное добавление в корени или вниз
*/
BSTree.prototype.add = function(k, v, prob)
{  
   if(!prob) prob = 1/(this.cnt +1);
   
   if(Math.random() < prob)
      this.addRoot(k, v);
   else
      this.addDown(k, v); 
}
/****************************************************************************************
* Есть ли узел с таким значением?
*/
BSTree.prototype.has = function(k)
{
   let n = this.root;
   while(n){
      if(k < n.k)                                 // если он меньше, идём налево
         n = n.lf;
      else if(k > n.k)                            // если больше - направо
         n = n.rt;
      else                                        // иначе ключи совпадают
         return true;
   }
   return false;                                  // совпадения не нашли
}
/****************************************************************************************
* Минимальное  значение ключа k на дереве
*/
BSTree.prototype.min = function(n)
{ 
   if(!n) n = this.root; 
   return n.lf? this.min(n.lf): n.k;  
}
/****************************************************************************************
* Максимальное значение ключа k на дереве
*/
BSTree.prototype.max = function(n)
{ 
   if(!n) n = this.root; 
   return n.rt? this.max(n.rt): n.k;  
}
/****************************************************************************************
* Вернуть минмальное значение  в виде структуры {k, v} и удалить их из дерева
*/
BSTree.prototype.popMin = function()
{
   if(!this.root)                                 // дерево пустое,
      return;                                     // вернём undefined
   this.cnt--;                                    // уменьшаем число узлов
   
   let n = this.root;    
   if(!n.lf){                                     // нет левой ветви
      let res = {k:n.k, v:n.v};                   // вернём корень,
      this.root = n.rt;                           // а им сделаем правую ветвь
      return res;                          
   }   
   while(n.lf.lf)                                 // ищем предпоследний узел слева
      n=n.lf;
   let res = {k:n.lf.k, v:n.lf.v};                // последний узел вернём
   n.lf = n.lf.rt;                                // и удалим из памяти
   return res;
}
/****************************************************************************************
* Вернуть минмальное значение  в виде {k, v} и удалить их из дерева (для согласия с List)
*/
BSTree.prototype.shift = function()
{
   return popMin();
}
/****************************************************************************************
* Вернуть суммарную длину путей к каждому узлу
*/
BSTree.prototype.len = function(n, depth)
{
   if(!n) n = this.root; 
   if(depth === undefined) depth = 0;

   return depth + (n.lf? this.len(n.lf, depth+1):0) 
                + (n.rt? this.len(n.rt, depth+1):0);
}
/****************************************************************************************
* Вернуть число узлов в дереве 
*/
BSTree.prototype.count = function()
{
   return this.cnt;
}
/****************************************************************************************
* Степень сбалансированности дерева
*/
BSTree.prototype.balance = function()
{
   return ((this.cnt+1)*Math.log2(this.cnt+1)-2*this.cnt)/this.len();
}
/****************************************************************************************
* Вернуть дерево как SVG-кртинку
*/
BSTree.prototype.getSVG = function()
{
   return Tree.getSVG(this.getTree(this.root));
}
/****************************************************************************************
* Возвращает массив keys со всеми ключами на дереве
*/
BSTree.prototype.getKeys = function()
{
   let keys = [];
   if(!this.root) return keys;                    // пустое дерево, вернём пустой массив
   return this.getKeysRec(keys, this.root);       // рекурсивно вызываем от с корня
}

BSTree.prototype.getKeysRec = function(keys, n)
{
   if(n.lf) keys = this.getKeysRec(keys, n.lf);   // для левой ветви
   if(n.rt) keys = this.getKeysRec(keys, n.rt);   // для правой ветви
   keys.push(n.k);                                // собственно добавляем ключ в массив  
   return keys;
}
/****************************************************************************************
* Получить обычное дерево для рисования картинки
*/
BSTree.prototype.getTree = function(n)
{
   if(n === undefined)
      n = this.root;
   if(!n.lf && !n.rt)
      return { nm:n.k };
   if(!n.lf && n.rt)
         return { nm:n.k, ar:[{nm:".", hide:true}, this.getTree(n.rt)] };
   if(n.lf && !n.rt)
      return { nm:n.k, ar:[this.getTree(n.lf), {nm:".", hide:true}]};
   return { nm:n.k, ar:[this.getTree(n.lf), this.getTree(n.rt)]};      
}

/****************************************************************************************
                                        
Всё ниже написано для проверки быстродействия различных способов организации
бинарных деревьев. Эффективнее они себя не показали.

                                          (с) 2016-nov steps: synset.com, absolutist.com
****************************************************************************************/

function BSTree1(nm)
{
   this.nm = nm === undefined? null: nm;          // значение ключа
   this.lf = null;                                // слева все узлы будут меньше nm 
   this.rt = null;                                // справа все узлы будут больше nm   
}
/****************************************************************************************
* Добавить имя на дерево, слева или справа, в зависимости ключа nm
*/
BSTree1.prototype.cmp = function(a, b)
{
   return a < b? -1: (a > b? 1: 0);
}
/****************************************************************************************
* Добавить имя на дерево, слева или справа, в зависимости ключа nm
*/
BSTree1.prototype.addDown = function(nm)
{
   if(this.nm  === null)                          // дерева ещё не было
      this.nm = nm;      
   else{
      let res = this.cmp(nm, this.nm);            // сравниваем имена
      
      if( res < 0 ){                              // узел должен быть слева
         if(this.lf) this.lf.addDown(nm);         // продолжаем вставку
         else        this.lf = new BST(nm);       // иначе создаем левую ветку
      }  
      
      else if( res > 0 ){                         // узел должен быть справа
         if(this.rt) this.rt.addDown(nm);         // продолжаем вставку
         else        this.rt = new BST(nm);       // иначе создаем правую ветку
      }
   }   
}
/****************************************************************************************
* Добавить имя на дерево в корень
*/
BSTree1.prototype.addRoot = function(nm)
{   
   if(this.nm === null)                           // от этого узла ни кто ещё не растёт 
      this.nm = nm;  
   else{
      let res = this.cmp(nm, this.nm);            // сравниваем имена
      
      if( res < 0 ){                              // ключ меньше корня - вставляем влево
         if(this.lf)  this.lf.addRoot(nm);           
         else         this.lf = new BST(nm);  

         let lf=this.lf, rt=this.rt; nm=this.nm;  // сохраняем указатели
         this.nm = lf.nm;                         // ротация влево (nm с левой ветки)
         this.lf = lf.lf;                         // и туда же ссылается новая левая ветка
         this.rt = new BST(nm);
         this.rt.lf=lf.rt; this.rt.rt=rt;                    
      }  
      
      else if( res > 0 ){                         // ключ больше корня - вставляем вправо
         if(this.rt)  this.rt.addRoot(nm);           
         else         this.rt = new BST(nm);  
           
         let lf=this.lf, rt=this.rt; nm=this.nm;  // сохраняем указатели
         this.nm = rt.nm;                         // ротация вправо (nm с правой ветки)
         this.rt = rt.rt;                         // и туда же ссылается новая правая ветка
         this.lf = new BST(nm);
         this.lf.lf=lf; this.lf.rt=rt.lf;          
      }
   }
}
/****************************************************************************************
* Случайное добавление в корени или низ
*/
BSTree1.prototype.add = function(nm, prob)
{
   if(prob === undefined) prob = 0.1;
   
   if(Math.random() < prob)
      this.addRoot(nm) 
   else
      this.addDown(nm) 
}
/****************************************************************************************
* Минимальное и максимальное значение поля nm на дереве
*/
BSTree1.prototype.min = function(){  return this.lf? this.lf.min(): this.nm;  }
BSTree1.prototype.max = function(){  return this.rt? this.rt.max(): this.nm;  }
/****************************************************************************************
* Есть ли узел с таким значением?
*/
BSTree1.prototype.has = function(nm)
{
   let res = this.cmp(nm, this.nm);               // сравниваем имена

   if( res < 0 )                                  // идём влево
      return this.lf? this.lf.has(nm): false;
      
   if( res > 0 )                                  // идём вправо
      return this.rt? this.rt.has(nm): false;
       
   return true;                                   // ключ nm в этом узле
}
/****************************************************************************************
* Вернуть суммарную длину путей к каждому узлу
*/
BSTree1.prototype.len = function(depth)
{
   if(depth === undefined) depth = 0;

   return depth + (this.lf? this.lf.len(depth+1):0) 
                + (this.rt? this.rt.len(depth+1):0);
}
/****************************************************************************************
* Вернуть число узлов в дереве 
*/
BSTree1.prototype.count = function()
{
   return 1 + (this.lf? this.lf.count():0) 
            + (this.rt? this.rt.count():0);
}
/****************************************************************************************
* Степень сбалансированности дерева
*/
BSTree1.prototype.balance = function()
{
   let cnt = this.count();
   return (2+(cnt+1)*Math.log2(0.25*(cnt+1)))/this.len();
}
/****************************************************************************************
* Вернуть дерево как SVG-кртинку
*/
BSTree1.prototype.getSVG = function()
{
   return Tree.getSVG(this.getTree());
}
/****************************************************************************************
* Получить обычное дерево для рисования картинки
*/
BSTree1.prototype.getTree = function()
{
   if(!this.lf && !this.rt)
      return { nm:this.nm };
  if(!this.lf && this.rt)
      return { nm:this.nm, ar:[{nm:".", hide:true}, this.rt.getTree()] };
  if(this.lf && !this.rt)
      return { nm:this.nm, ar:[this.lf.getTree(), {nm:".", hide:true}]};
   return { nm:this.nm, ar:[this.lf.getTree(), this.rt.getTree()]};   
}

/***************************************************************************************
*          Бинарное дерево без null (для учебных целей, проверка быстродействия)
****************************************************************************************/
function BSTree0(nm)
{
   this.nm = nm;          // значение ключа
}
/****************************************************************************************
* Добавить имя на дерево, слева или справа, в зависимости ключа nm
*/
BSTree0.prototype.addDown = function(nm)
{
   if(this.nm  === undefined)                     // дерева ещё не было
      this.nm = nm;
      
   else if( nm < this.nm ){                       // узел должен быть слева
      if(this.lf) this.lf.addDown(nm);            // продолжаем вставку
      else        this.lf = new BSTree0(nm);         // иначе создаем левую ветку
   }
   
   else if( nm > this.nm ){                       // узел должен быть справа
      if(this.rt) this.rt.addDown(nm);            // продолжаем вставку
      else        this.rt = new BSTree0(nm);         // иначе создаем правую ветку
   }   
}
/****************************************************************************************
* Добавить имя на дерево в корень
*/
BSTree0.prototype.addRoot = function(nm)
{   
   if(this.nm === undefined)                       // от этого узла ни кто ещё не растёт 
      this.nm = nm; 
      
   else if( nm < this.nm ){                       // ключ меньше корня - вставляем влево
      if(this.lf)  this.lf.addRoot(nm);           
      else         this.lf = new BSTree0(nm);  

      let lf=this.lf, rt = this.rt; nm=this.nm;   // сохраняем указатели
      this.nm = lf.nm;                            // ротация влево (nm с левой ветки)
      this.lf = lf.lf;                            // и туда же ссылается новая левая ветка
      this.rt = new BST(nm);
      this.rt.lf=lf.rt; this.rt.rt=rt;                    
   }
   
   else if( nm >  this.nm ){                      // ключ больше корня - вставляем вправо
      if(this.rt)  this.rt.addRoot(nm);           
      else         this.rt = new BSTree0(nm);  
           
      let lf=this.lf, rt = this.rt; nm = this.nm; // сохраняем указатели
      this.nm = rt.nm;                            // ротация вправо (nm с правой ветки)
      this.rt = rt.rt;                            // и туда же ссылается новая правая ветка
      this.lf = new BST(nm);
      this.lf.lf=lf; this.lf.rt=rt.lf;          
   }
}
/****************************************************************************************
* Случайное добавление в корени или низ
*/
BSTree0.prototype.add = function(nm, prob)
{
   if(prob === undefined) prob = 0.1;
   
   if(Math.random() < prob)
      this.addRoot(nm) 
   else
      this.addDown(nm) 
}
/***************************************************************************************
*          Бинарное дерево со статическими функциями (проверка быстродействия)
****************************************************************************************/
function BSTree2() 
{
   this.bst = {};               // бинарное дерево
   this.cnt = 0;                // число узлов на дереве
}
/****************************************************************************************
* Добавить имя на дерево, слева или справа, в зависимости ключа nm
*/
BSTree2.prototype.add = function(nm)
{
   if(Math.random() < 1/(this.cnt+1)){
      if(BSTree2.addRoot(this.bst, nm))  
         this.cnt++;   
   }
   else{
      if(BSTree2.addDown(this.bst, nm)) 
         this.cnt++; 
   }
}
/****************************************************************************************
* Добавить имя на дерево, слева или справа, в зависимости ключа nm
*/
BSTree2.prototype.addDown = function(nm)
{
   if(BSTree2.addDown(this.bst, nm)){
      this.cnt++; 
      return true;
   }
   return false;
}
/****************************************************************************************
* Добавить имя на дерево, слева или справа, в зависимости ключа nm
*/
BSTree2.prototype.addRoot = function(nm)
{
   if(BSTree2.addRoot(this.bst, nm)){
      this.cnt++; 
      return true;
   }
   return false;
}
/****************************************************************************************
* вернуть суммарную длину путей к каждому узлу
*/
BSTree2.prototype.len = function()
{
   return (this.bst.lf? BSTree2.len(this.bst.lf, 1):0) 
        + (this.bst.rt? BSTree2.len(this.bst.rt, 1):0);
}
/****************************************************************************************
* Вернуть дерево как SVG-кртинку
*/
BSTree2.prototype.getSVG = function()
{
   return Tree.getSVG(BSTree2.getTree(this.bst));
}
/****************************************************************************************
* Есть ли имя nm на дереве
*/
BSTree2.has = function(bst, nm)
{
   if( nm < bst.nm )                              // идём влево
      return bst.lf? BSTree2.has(bst.lf, nm): false;
      
   if( nm > bst.nm )                              // идём вправо
      return bst.rt? BSTree2.has(bst.rt, nm): false;
      
   return true;                                   // ключ nm в этом узле
}
/****************************************************************************************
* Вернуть узел на дереве с именем nm, если его нет - undefined
*/
BSTree2.get = function(bst, nm)
{
   if( nm < bst.nm )                              // идём влево
      return bst.lf? BSTree2.get(bst.lf, nm): undefined;
      
   if( nm > bst.nm )                              // идём вправо
      return bst.rt? BSTree2.get(bst.rt, nm): undefined;
      
   return bst;                                    // ключ nm в этом узле
}
/****************************************************************************************
* Установить значения par:val для узла с именнем nm
*/
BSTree2.set = function(bst, nm,  par, val)
{
   let n = BSTree2.get(bst, nm);
   if(n !== undefined){
      n[par] = val;
      return true;
   }
   return false;   
}
/****************************************************************************************
* вернуть узел с минимальным значением ключа
*/
BSTree2.min = function(bst)
{
   return bst.lf? BSTree2.min(bst.lf): bst
}
/****************************************************************************************
* вернуть узел с максимальным значением ключа
*/
BSTree2.max = function(bst)
{
   return bst.rt? BSTree2.max(bst.rt): bst;
}
/****************************************************************************************
* вернуть суммарную длину путей к каждому узлу, вызывать как BSTree2.len(bst, 0)
*/
BSTree2.len = function(bst, depth)
{
   return depth + (bst.lf? BSTree2.len(bst.lf, depth+1):0) + (bst.rt? BSTree2.len(bst.rt, depth+1):0);
}
/****************************************************************************************
* Добавить имя на дерево, слева или справа, в зависимости ключа nm
*/
BSTree2.addDown = function(bst, nm)
{
   if(bst.nm === undefined)                      // от этого узла ни кто ещё не растёт 
      bst.nm = nm; 
   else if( nm < bst.nm ){                             // ключ меньше корня - вставляем влево
      if(bst.lf !== undefined)               
         return BSTree2.addDown(bst.lf, nm);          // ниже от текущего
      bst.lf = { nm:nm };                         // ниже пока ничего не
   }
   else if( nm > bst.nm ){                        // ключ больше корня - вставляем вправо
      if(bst.rt !== undefined)
         return BSTree2.addDown(bst.rt, nm);          // ниже от текущего
      bst.rt = { nm:nm };                         // ниже пока ничего нет;
   }
}
/****************************************************************************************
* Добавить имя на дерево ближе к корню, слева или справа, в зависимости ключа nm
* Ротация вправо делает старый корень правым поддеровом нового корня
*/
BSTree2.addRoot = function(bst, nm)
{   
   if(bst.nm === undefined){                      // от этого узла ни кто ещё не растёт 
      bst.nm = nm;
      return true;
   }

   let res = true;
   if( nm < bst.nm ){                             // ключ меньше корня - вставляем влево
      if(bst.lf !== undefined)
         res = BSTree2.addRoot(bst.lf, nm);           
      else
         bst.lf = { nm:nm };  

      let n = bst.nm, lf=bst.lf, rt = bst.rt;     // ротация влево
      bst.nm = lf.nm;   
      bst.lf = lf.lf;
      bst.rt = {nm:n, lf:lf.rt, rt:rt};                    
      return res;          
   }
   else if( nm > bst.nm ){                        // ключ больше корня - вставляем вправо
      if(bst.rt !== undefined)
          res = BSTree2.addRoot(bst.rt, nm);
      else
          bst.rt = {nm:nm};      
          
      let n = bst.nm, lf=bst.lf, rt = bst.rt;     // ротация вправо
      bst.nm = rt.nm;   
      bst.rt = rt.rt;
      bst.lf = {nm:n, lf:lf, rt:rt.lf};          
      return res;    
   }
   return false;
}
/****************************************************************************************
* Вернуть дерево в виде Tree из bst
*/
BSTree2.getTree = function(bst)
{
   let node = Object.assign({}, bst);      // клонируем объект
   if(bst.lf && bst.rt)
      node.ar = [BSTree2.getTree(bst.lf), BSTree2.getTree(bst.rt)];
   if(bst.lf && !bst.rt)
      node.ar = [BSTree2.getTree(bst.lf), {nm:".", hide:true}];
   if(!bst.lf && bst.rt)
      node.ar = [{nm:".", hide:true}, BSTree2.getTree(bst.rt)];   
   return node;
}