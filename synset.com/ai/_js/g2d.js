'use strict';
/***************************************************************************************
*          Набор статических функций по работе с векторной и растровой графикой
* Описание библиотеки см. в ../graph/g2d.html
* 2D точка и вектор задаются структурами {x: координата, y: координата}
* Аналогично, окружность, это структура {x,y,r}
*                                                       (с) synset.com, absolutist.com
***************************************************************************************/
function G2D()
{
   this.ctx; // контекст рисования (присваивается извне: G2D.setCanvas)
   this.w;   // ширина канваса (присваивается извне: G2D.setCanvas)
   this.h;   // высота канваса (присваивается извне: G2D.setCanvas)
}

/****************************************************************************************
*                                Графические функции
****************************************************************************************/

/****************************************************************************************
* Получить контекст рисования ctx по canvas id и его ширину w, высоту h
*/
G2D.setCanvas = function(canvas_id)
{
   let canvas = document.getElementById(canvas_id);
   this.w   = canvas.width;
   this.h   = canvas.height;
   return this.ctx = canvas.getContext('2d');
}
/****************************************************************************************
* Нарисовать линию от точки p1:{x,y} к точке p2:{x,y}
*/
G2D.plotLine = function(p1, p2)
{
   this.ctx.beginPath();
   this.ctx.moveTo(p1.x, p1.y);
   this.ctx.lineTo(p2.x, p2.y);
   this.ctx.stroke();
}
/****************************************************************************************
* Нарисовать окружность с радиусом r и центром в точке p:{x,y}
*/
G2D.plotCircle = function(p, r)
{
   this.ctx.beginPath();
   this.ctx.arc(p.x, p.y, r, 0, Math.PI*2, true);
   this.ctx.stroke();
}
/****************************************************************************************
* Нарисовать "толстую" точку радиуса r с центром в точке p:{x,y} (fill circle)
*/
G2D.plotPoint = function(p, r)
{
   this.ctx.beginPath();
   this.ctx.arc(p.x, p.y, r, 0, Math.PI*2, true);
   this.ctx.fill();
}
/****************************************************************************************
* Нарисовать дугу из центра p радиуса r от угла a1 до угла a2 против часовой стрелке
*/
G2D.plotArc = function(p, r, a1, a2)
{
   this.ctx.beginPath();
   this.ctx.arc(p.x, p.y, r, a1, a2, true);
   this.ctx.stroke();
}
/****************************************************************************************
* Нарисовать текст txt в точке p. Чтобы он центроировался относительно точки, необходимо задать:
*  ctx.textAlign = "center"; ctx.textBaseline = "middle";
*/
G2D.plotText = function(txt, p)
{
   this.ctx.fillText(txt, p.x, p.y);
}
/****************************************************************************************
* Нарисовать окружности из массива crcls, сначала контуром цвета strokeStyle, а затем залить цветом fillStyle
* (получится кластер с обведенным контуром)
*/
G2D.plotCircles = function(crcls)
{
   for(let i=0; i<crcls.length; i++){
      let c = crcls[i];
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, c.r, 0, Math.PI*2, true);
      this.ctx.stroke();
   }
   for(let i=0; i<crcls.length; i++){
      let c = crcls[i];
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, c.r, 0, Math.PI*2, true);
      this.ctx.fill();
   }
}
/****************************************************************************************
* Нарисовать замкнутый полигон по точкам в массиве pnts =[ {x,y}, ...]
* Если полигон надо залить, после вызывается ctx.fill();
*/
G2D.plotPolygon = function(pnts)
{
   this.ctx.beginPath();
   this.ctx.moveTo(pnts[0].x, pnts[0].y);
   for(let i=1; i<pnts.length; i++)
      this.ctx.lineTo(pnts[i].x, pnts[i].y);
   this.ctx.closePath();
   this.ctx.stroke();
}
/****************************************************************************************
*                                Базовые операции с векторами
****************************************************************************************/
// a=b (присвоить координаты точки b в точку a)
G2D.setXY = function(a, b){
   a.x=b.x; a.y=b.y;
}
// a==b совпадают точки (true) или нет (false)
G2D.equiv = function(a, b){
   return (a.x===b.x) && (a.y===b.y);
}
// a==b совпадают точки (true) или нет (false) с точностью до одной десятичной цифры после запятой
G2D.equiv1 = function(a, b){
   return (Math.abs(Math.floor(10*(a.x-b.x))) < 1 ) && (Math.abs(Math.floor(10*(a.y-b.y))) < 1);
}
// a+b (сложить 2 вектора и вернуть результат)
G2D.add = function(a, b){
   return { x: a.x+b.x, y: a.y+b.y };
}
// a-b (вычесть 2 вектора и вернуть результат)
G2D.sub = function(a, b){
   return { x: a.x-b.x, y: a.y-b.y };
}
// c*v (умножить вектор v на число c и вернуть результат)
G2D.mult= function(c, v){
   return { x: c*v.x,   y: c*v.y };
}
// a*b (скалярное произведение векторов)
G2D.scalar= function(a, b){
   return a.x*b.x+a.y*b.y;
}
// Возвращает расстояние между двумя точками p1:{x,y} - p2:{x,y}
G2D.dist = function(p1, p2){
   let dx=p1.x-p2.x, dy=p1.y-p2.y;
   return Math.sqrt( dx*dx+dy*dy );
}
// Возвращает квадрат расстояния между двумя точками p1:{x,y} - p2:{x,y}
G2D.dist2 = function(p1, p2){
   let dx=p1.x-p2.x, dy=p1.y-p2.y;
   return dx*dx+dy*dy;
}
// Возвращает длину вектора v:{x,y}
G2D.len = function(v) {
   return Math.sqrt( v.x*v.x + v.y*v.y );
}
// Возвращает квадрат длины вектора v:{x,y}
G2D.norm = function(v) {
   return v.x*v.x + v.y*v.y;
}
// Возвращает единичный вектор в направлении v, не меняя v
G2D.unit = function(v) {
   let len = Math.sqrt( v.x*v.x + v.y*v.y );
   return {x: v.x/len, y: v.y/len };
}
// Нормирует вектор на единицу и возвращет его
G2D.normalize = function(v) {
   let len = Math.sqrt( v.x*v.x + v.y*v.y );
   v.x /= len; v.y /= len;
   return v;
}
// Угол между векторами
G2D.angle = function(a, b) {
   return Math.acos( (a.x*b.x+a.y*b.y)/ Math.sqrt( ( a.x*a.x + a.y*a.y)*( b.x*b.x + b.y*b.y) ) );
}
// Угол между векторами со знаком +, если b находится против  часовой стрелке от a
G2D.angleSign = function(a, b) {
   let d = a.x*b.y - a.y*b.x;
   d = (d>0)? -1: 1;
   return d*Math.acos( (a.x*b.x+a.y*b.y)/ Math.sqrt( ( a.x*a.x + a.y*a.y)*( b.x*b.x + b.y*b.y) ) );
}
// вернуть в виде строки координаты вектора
G2D.printXY = function(v){
   return "{x:"+v.x+", y:"+v.y+"}";
}
// вернуть в виде строки координаты вектора как строки, окуруглив до 1 цифры после запятой
G2D.print1XY = function(v){
   return "{x:"+Math.floor(10*v.x)/10+", y:"+Math.floor(10*v.y)/10+"}";
}
// вернуть в виде строки параметры окружности, окуруглив до 1 цифры после запятой
G2D.print1XYR = function(c){
   return "{x:"+Math.floor(10*c.x)/10+", y:"+Math.floor(10*c.y)/10+", r:"+Math.floor(10*c.r)/10+"}";
}
// c1=c2 (присвоить координаты и радиус окружности c2 в окружность c1)
G2D.setXYR = function(c1, c2){
   c1.x=c2.x; c1.y=c2.y; c1.r=c2.r;
}
/****************************************************************************************
*                                Геометрические функции
****************************************************************************************/

/****************************************************************************************
* Возвращает индекс в массиве points = [{x,y}, ...], соответствующий ближайшей точки к точке p:{x,y}
*/
G2D.nearestPoint = function(p, points)
{
   let iBst = -1, dBst=Infinity;
   for(let i=0; i<points.length; i++){
      let d = G2D.dist2(p, points[i]);
      if(d<dBst){
          iBst = i;
          dBst = d;
       }
   }
   return iBst;
}
/****************************************************************************************
* Возвращает индекс в массиве points = [{x,y}, ...], соответствующий самой удалёной точки к точке p:{x,y}
*/
G2D.farthestPoint = function(p, points)
{
   let iBst = -1, dBst=0;
   for(let i=0; i<points.length; i++){
      let d = G2D.dist2(p, points[i]);
      if(d>dBst){
        iBst = i;
        dBst = d;
      }
   }
   return iBst;
}
/****************************************************************************************
* Возвращает центр масс массива точек points = [{x,y}, ...]
*/
G2D.centerPoints = function(points)
{
   let x=0, y=0;
   for(let i=0; i<points.length; i++){
      x+=points[i].x;
      y+=points[i].y;
   }
   return {x: x/points.length, y: y/points.length};
}
/****************************************************************************************
* Возвращает единичный  вектор вдоль медианы треугольника p1, p0, p2 для угла из точки p0
*/
G2D.medianVec = function(p1, p0, p2)
{
   return this.unit(this.add(this.unit(this.sub(p1,p0)), this.unit(this.sub(p2,p0))));
}
/****************************************************************************************
* Возвращает true, если сегмент между точками b1 to e1 и сегмент между точками b2 to e2 пересекаются.
* Если это происходит, point равна точке пересечения.
*/
G2D.intersectSegments = function (b1, e1, b2, e2, point)
{
   let len1X = e1.x-b1.x, len1Y = e1.y-b1.y;
   let len2X = e2.x-b2.x, len2Y = e2.y-b2.y;
   let d = len1X*len2Y - len1Y*len2X;
   if(d==0)
      return false;
   let t1 =  ( (b2.x-b1.x)*len2Y - (b2.y-b1.y)*len2X )/d;
   if(t1 < 0 || t1 > 1)
      return false;
   let t2 =  -( (b1.x-b2.x)*len1Y - (b1.y-b2.y)*len1X )/d;
   if(t2 < 0 || t2 > 1)
      return false;
   point.x = b1.x+t1*(e1.x-b1.x);
   point.y = b1.y+t1*(e1.y-b1.y);
   return true;
}
/****************************************************************************************
* Возвращает знак +1, если точка p лежит справа от прямой, проходящей через p1, p2 и -1, слева
* и 0, если лежит на прямой с точностью до 1/100.
*/
G2D.sideFromLine = function(p1, p2, p)
{
   let k = G2D.sub(p2, p1);        // вектор вдоль прямой
   let s = G2D.sub(p,  p1);        // вектор к точке p от точки p1
   let sgn = s.x*k.y - s.y*k.x;    // скалярное произведение s и нормали к k
   if(Math.floor(100*sgn)==0) return 0;
   return (sgn>0)?  1: -1;
}
/****************************************************************************************
* Возвращает положение нормали к отрезку p1:{x,y}-p2:{x,y} из точки p0
* (или краевые точки, если нормаль лежит вне отрезка)
*/
G2D.fromPointToSegment = function(p0, p1, p2)
{
   let d21 = G2D.sub(p2,p1)
   let t = G2D.scalar(G2D.sub(p0,p1), d21)/G2D.norm(d21);
   if(t<0) t=0;
   if(t>1) t=1;
   return G2D.add(p1, G2D.mult(t, d21));
}
/****************************************************************************************
* Возвращает положение параметра t к нормали к отрезку p1:{x,y}-p2:{x,y} из точки p0
* (или краевые точки, если нормаль лежит вне отрезка)
*/
G2D.fromPointToSegmentParam = function(p0, p1, p2)
{
   let d21 = G2D.sub(p2,p1)
   return G2D.scalar(G2D.sub(p0,p1), d21)/G2D.norm(d21);
}
/****************************************************************************************
* Возвращает true, если окружность c1 = {x, y, r} находится внутри другой окружности c2
*/
G2D.circleInCircle = function(c1, c2)
{
   let d = c1.r+c2.r;
   return G2D.dist2(c1, c2) < d*d;
}
/****************************************************************************************
* возвращает true, если окружность c = {x, y, r} находится внутри одной из окружностей из массива crcls
*/
G2D.circleInCircles = function(c, crcls)
{
   for(let i=0; i<crcls.length; i++){
      let d = c.r+crcls[i].r;
      if(G2D.dist2(c, crcls[i]) < d*d )
         return true;
   }
   return false;
}
/****************************************************************************************
* Площадь пересечения двух кругов с1 = {x, y, r} и с2 = {x, y, r}
*/
G2D.squareIntersectTwoCircles = function(c1, c2)
{
   let D = G2D.dist(c1, c2);       // расстояние между центрами
   if(D > c1.r+c2.r)
      return 0;                     // не пересекаются
   if(D+c1.r<c2.r)
      return Math.PI*c1.r*c1.r;     // с1 поглощена окружностью с2
   if(D+c2.r<c1.r)
      return Math.PI*c2.r*c2.r;     // с2 поглощена окружностью с1

   let a1 = 2*Math.acos((c1.r*c1.r-c2.r*c2.r+D*D)/(2*D*c1.r)); // теорема косинусов
   let a2 = 2*Math.acos((c2.r*c2.r-c1.r*c1.r+D*D)/(2*D*c2.r)); // теорема косинусов

   return 0.5*( c1.r*c1.r*(a1-Math.sin(a1)) + c2.r*c2.r*(a2-Math.sin(a2)) );
}
/*******************************************************************************
* Нормализация угла к интервалу [-PI..PI]
*/
G2D.normAng = function(a)
{
   if(a>Math.PI)
      return a-2*Math.PI;
   if(a<-Math.PI)
      return 2*Math.PI+a;
   return a;                    // всё нормально
}
/*******************************************************************************
* Сравнивает углы a1,a2 при отсчете от оси x; углы нормированы на [-PI..PI]
* -1, если a1<a2, +1 если a1>a2 и 0 если равны \todo
*/
G2D.angCmp = function(a1,a2)
{
   if(a1>=0){
     if(a2>=0)
        return (a1<a2)? -1: ( (a1>a2)? 1: 0 );
     return 1;
   }
   if(a2<0)
     return (a1<a2)? -1: ( (a1>a2)? 1: 0 );
   return  -1;
}
/****************************************************************************************
*                                 Работа с кластерарами
* кластер - это множество окружностей из массива crcls с параметрами {x,y,r}
****************************************************************************************/

/****************************************************************************************
* Возвращает центр масс массива окружностей crcls = [{x,y,r}, ...]
*/
G2D.centerCircles = function(crcls)
{
   let x=0, y=0, tot=0;
   for(let i=0; i<crcls.length; i++){
      let c = crcls[i];
      let s = c.r*c.r;
      tot += s;
      x+=c.x*s;
      y+=c.y*s;
   }
   return {x: x/tot, y: y/tot};
}
/****************************************************************************************
* Возвращает радиус окружности, с центром в точке p, охватывающей все окружности из массива crcls = [{x,y,r}, ...]
*/
G2D.radiusCircles = function(crcls, p)
{
   let rMax = 0;
   for(let i=0; i<crcls.length; i++){
      let r = this.dist(crcls[i], p) + crcls[i].r;
      if(r>rMax)
         rMax=r;
   }
   return rMax;
}
/****************************************************************************************
* Площадь поверхности, покрываемой кругами из массива crcls (с учётом их пересечений)
*/
G2D.squareCircles = function(crcls)
{
   let s = 0;
   for(let i=0; i<crcls.length; i++)
      s+=crcls[i].r*crcls[i].r;
   s *= Math.PI;                       // суммарная площадь всех кругов

   for(let i=0; i<crcls.length; i++)   // убираем из неё площади пересечений кругов
      for(let j=i+1; j<crcls.length; j++)
         s -= G2D.squareIntersectTwoCircles(crcls[i], crcls[j]);

   return s;
}
/****************************************************************************************
* Измененить масштаб в scale раз набора окружностей crcls в их системе координат
*/
G2D.scaleCircles = function(crcls, scale)
{
   for(let i=0; i<crcls.length; i++){
      let c = crcls[i];
      c.x *= scale;  c.y *= scale; c.r *= scale;
   }
}
/****************************************************************************************
* Сдвинуть все координаты окружностей на вектор p
*/
G2D.translateCircles = function(crcls, p)
{
   for(let i=0; i<crcls.length; i++){
       crcls[i].x += p.x;  crcls[i].y += p.y;
   }
}
/****************************************************************************************
* Повернуть  все координаты окружностей на угол a относительно точки p
*/
G2D.rotateCircles = function(crcls, a, p)
{
   let co = Math.cos(a), si = Math.sin(a);
   for(let i=0; i<crcls.length; i++){
      let x = crcls[i].x - p.x, y = crcls[i].y - p.y;
      crcls[i].x = p.x + x*co + y*si;
      crcls[i].y = p.y - x*si + y*co;
   }
}
/****************************************************************************************
* crcls1 = crcls2: присвоить координаты и радиусы окружностей crcls2 в crcls1
*/
G2D.setCircles = function (crcls1, crcls2)
{
   if(crcls1.length === undefined || crcls1.length != crcls2.length){
      crcls1 = new Array(crcls2.length);
   }
   for(let i=0; i<crcls2.length; i++){
      let  c2 = crcls2[i];
      crcls1[i] = {x: c2.x, y:c2.y, r: c2.r};
   }
}
/****************************************************************************************
* возвращает true, если сферы массива crcls1, которые окруражет сфера c1={x,y,r}
  пересекаются с сферами массива crcls2, которые окружает сфера c2={x,y,r}
*/
G2D.clasterInСlaster = function (crcls1, c1, crcls2, c2)
{
   let d = c1.r+c2.r;
   if( G2D.dist2(c1, c2) > d*d )           // ограничивающие сферы далеко
      return false;

   for(let i=0; i<crcls1.length; i++){
      let d = crcls1[i].r + c2.r;
      if(G2D.dist2(crcls1[i], c2) > d*d)
         continue;
      for(let j=0; j<crcls2.length; j++){
         let d = crcls1[i].r+crcls2[j].r;
         if(G2D.dist2(crcls1[i], crcls2[j]) < d*d)
            return true;                             // пересеклись
      }
   }
   return false;
}
/*******************************************************************************
* Вычислить дуги невидимых частей огружностей при их пересечении в массиве окружностей
* В каждую окружность добавляется массив angs: [ [a1,a2],...] из интервалов (массивы двух чисел)
* углов невидимых из-за пересечения дуг окружностей
*/
G2D.calcCrossCircles = function(crcls)
{
   if(crcls.length<2)
      return;
   for(let i=0; i<crcls.length; i++)           // обнуляем массив сегментов
      crcls[i].angs =[];

   for(let i=0; i<crcls.length; i++){          //  вычисляем все пересечения
      let R = crcls[i].r;
      for(let j=0; j<crcls.length; j++){
         if(i===j)
            continue;                          // одна и таже сфера

         let d = G2D.sub(crcls[j], crcls[i]);  // направление между центрами сфер
         let dLen = G2D.len(d);
         let r = crcls[j].r;
         if(dLen > R+r)
            continue;                          // сферы далеко

         let a = Math.acos((R*R+dLen*dLen-r*r)/(2*R*dLen)); // теорема косинусов
         let delta = Math.atan2(d.y, d.x);                  // угол направления с осью x (минус - выше x, плюс - ниже)
         let a1 = G2D.normAng(delta-a);            // нормализуем в [-PI..PI]
         let a2 = G2D.normAng(delta+a);
         crcls[i].angs.push( [a1 , a2] );
         //console.log("a=",a*180/Math.PI," delta=",delta*180/Math.PI," cos=",cos," r=",crcls[j].r," R=",crcls[i].r," D=",dLen);
      }
   }
   //compressCrossCircles(c);                   // убираем пересекающиеся сегменты \todo
}
/*******************************************************************************
* убираем пересекающиеся сегменты невидимых частей окружностей \todo
*/
G2D.compressCrossCircles = function(crcls)
{
}
/****************************************************************************************
*                                 Работа с полигонами
****************************************************************************************/

/****************************************************************************************
* Возвращает true, если полигон, заданный точками pnts - выпуклый
* У выпуклого полигона все углы (pnts[i], pnts[i+1], pnts[i+2]) одного знака
*/
G2D.polygonConvex = function(pnts)
{
   let sgn = G2D.sideFromLine(pnts[pnts.length-1], pnts[0], pnts[1]);
   for(let i=1; i<pnts.length; i++){
      let iNxt = (i+1==pnts.length)? 0 :i+1;
      let s = G2D.sideFromLine(pnts[i-1], pnts[i],pnts[iNxt]);
      if(s!=sgn)
         return false;
   }
   return true;
}
/****************************************************************************************
* Возвращает true, если полигон, заданный точками pnts является не самопересекающимся
*/
G2D.polygonGood = function(pnts)
{
   for(let i=0; i<pnts.length; i++){
      let i2 = (i+1) % pnts.length;
      for(let j=0; j<pnts.length-2; j++){
         let j1 = (i+2+j)% pnts.length;
         let j2 = (j1+1) % pnts.length;
         let s1 = G2D.sideFromLine(pnts[i], pnts[i2], pnts[j1])*G2D.sideFromLine(pnts[i], pnts[i2], pnts[j2]);
         let s2 = G2D.sideFromLine(pnts[j1],pnts[j2], pnts[i] )*G2D.sideFromLine(pnts[j1],pnts[j2], pnts[i2]);
         if(s1<0 && s2<0)
            return false;
      }
   }
   return true;
}
/****************************************************************************************
* Возвращает площадь полигона
*/
G2D.polygonSquare = function(pnts)
{
   let s = 0;
   for(let i=0; i<pnts.length; i++){
      let i2 = (i+1) % pnts.length;
      s+= (pnts[i].x+pnts[i2].x)*(pnts[i].y-pnts[i2].y);
   }
   return s<0? -s/2: s/2;
}
/****************************************************************************************
* Возвращает периметр полигона
*/
G2D.polygonPerimeter = function(pnts)
{
   let s = 0;
   for(let i=0; i<pnts.length; i++)
      s += G2D.dist(pnts[i], pnts[(i+1) % pnts.length]);
   return s;
}
/****************************************************************************************
* Возвращает прямоугольник {x, y, w, h}, окужающий полигон
*/
G2D.polygonRect = function(pnts)
{
   let x1=Infinity, y1=Infinity, x2=-Infinity, y2=-Infinity;
   for(let i=0; i<pnts.length; i++){
      let p = pnts[i];
      if(x1>p.x) x1=p.x;
      if(y1>p.y) y1=p.y;
      if(x2<p.x) x2=p.x;
      if(y2<p.y) y2=p.y;
   }
   return { x:x1, y:y1, w: x2-x1, h: y2-y1};
}
/*****************************************pointInPolygon***********************************************
* Возвращает положение ближайшей на полигоне pnts точки к точке p
*/
G2D.pointToPolygon = function(p, pnts)
{
   let mBest = {x:0, y:0}, d2Best=Infinity;
   for(let i=0; i<pnts.length; i++){
      let i2 = (i+1) % pnts.length;
      let m = G2D.fromPointToSegment(p, pnts[i], pnts[i2]);
      let d2 = G2D.dist2(p,m);
      if(d2<d2Best){
         d2Best = d2;
         G2D.setXY(mBest,m);
      }
   }
   return mBest;
}
/****************************************************************************************
* Возвращает true, если точка p находится внутри полигона pnts
*/
G2D.pointInPolygon = function(p, pnts)
{
   let a=0;
   for(let i=0; i<pnts.length; i++){
      let i2 = (i+1) % pnts.length;
      a += G2D.angleSign(G2D.sub(pnts[i],  p), G2D.sub(pnts[i2], p));
   }
   return (Math.abs(a)>0.1);
}
/****************************************************************************************
* Возвращает true, если сфера c = {x,y,r} находится внутри полигона pnts
*/
G2D.circleInPolygon = function(c, pnts)
{
   if(!G2D.pointInPolygon(c, pnts))
      return false;
   if(G2D.dist2(c, G2D.pointToPolygon(c, pnts)) < c.r*c.r)
      return false;
   return true;
}
/****************************************************************************************
* Возвращает true, если сферы массива crcls, которые окруражет сфера c={x,y,r} находится внутри полигона pnts
*/
G2D.clasterInPolygon = function(crcls, c, pnts)
{
   if(G2D.circleInPolygon(c, pnts))
      return true;                     // всё помещается, дальше не проверяем

   for(let i=0; i<crcls.length; i++)
      if(!G2D.circleInPolygon(crcls[i], pnts))
         return false;

   return true;
}