'use strict';
/****************************************************************************************
*                                  Построение графиков
****************************************************************************************/
function Plot(options)
{
   options = options || {};
   this.points = [];                              // массив точек   {x,y}
   this.series = [];                              // массив массивов точек {x,y}   
   this.width   = options.width  || 256;          // ширина картинки
   this.height  = options.height || 256;          // высота картинки

   this.colors  =     options.colors;
   this.widthLines =  options.widthLines;
   this.widthLine = options.widthLine || 1;       // толщина линии

   this.sPoint  = options.sPoint || 1;            // радиус точки
   this.mergTp = options.mergTp ||  0;            // отступ сверху области графика 
   this.mergBt = options.mergBt || 20;            // отступ снизу  области графика      
   this.mergLf = options.mergLf || 20;            // отступ слева  области графика      
   this.mergRt = options.mergRt || 10;            // отступ справа области графика    

   this.chW    = 4;                               // ширина буквы
   this.chH    = 8;                               // высота буквы
   this.fixX   = 0;                               // число знаков для подписи оси x
   this.fixY   = options.fixY ||  2;              // число знаков для подписи оси y
   
   this.xMin      = options.xMin;
   this.xMax      = options.xMax;   
   this.yMin      = options.yMin;
   this.yMax      = options.yMax;
   
   this.xMinShow  = options.xMinShow || false;    // показывать x для максимума
   this.xMaxShow  = options.xMaxShow || false;    // показывать x для максимума

   this.kind      = options.kind || "points";
   this.markers   = options.markers || 0;
   this.axisX     = false;                        // рисовать ли ось X
   this.maxDeltaX = options.maxDeltaX;            // макс. расстояние по X между точками

}
/****************************************************************************************
* Очистить
*/
Plot.prototype.clear = function (canvas_id)
{
   let draw = new Draw(canvas_id);
   this.show(draw);
}
/****************************************************************************************
* Вернуть график как svg-картинку
*/
Plot.prototype.getSVG = function (canvas_id)
{
   let draw = new Draw(canvas_id);
   this.show(draw);
   if(canvas_id===undefined)
      return draw.getSVG(this.width, this.height);    
}
/****************************************************************************************
* Нарисовать график 
*/
Plot.prototype.show = function (draw)
{
   draw.clear();
   
   if(this.points.length)                        // единственный ряд
      this.series.push(this.points);

   let xMin=Infinity, xMax=0, yMin=Infinity, yMax=0, vxMax;   
   for(let k=0; k < this.series.length; k++)
      for(let i = this.series[k].length; i--; ){  // находим минимум и максимум
         let p = this.series[k][i];
         if(p===undefined) continue;
         if(p.x > xMax) xMax = p.x;
         if(p.x < xMin) xMin = p.x;
         if(p.y > yMax) { yMax = p.y; vxMax = p.x; }
         if(p.y < yMin) yMin = p.y;      
      }
   if(this.xMin !== undefined) xMin = this.xMin;
   if(this.xMax !== undefined) xMax = this.xMax;
   if(this.yMin !== undefined) yMin = this.yMin;
   if(this.yMax !== undefined) yMax = this.yMax;

   let w = this.width  - this.mergLf-this.mergRt;
   let h = this.height - this.mergTp-this.mergBt;
   
//   if(this.maxDeltaX && w/(xMax-xMin) > this.series[0].length*this.maxDeltaX)
//      xMax = xMin + w;
      
   let ax = w/(xMax-xMin), ay = yMax !== yMin? h/(yMax-yMin): h;
   let x0 = this.mergLf, y0 = this.mergTp;
      
   if(this.kind==="lines"){
      for(let k=0; k < this.series.length; k++){
         if(this.widthLines)
            draw.widthLine(this.widthLines[k]);
         else
            draw.widthLine(this.widthLine);
         
         if(this.colors && this.colors.length > k)
            draw.colorLine(this.colors[k]);
         for(let i = 0; i < this.series[k].length-1; i++){
            let p1 = this.series[k][i], p2 = this.series[k][i+1];
            if(p1===undefined || p2===undefined) continue;
            draw.line(x0+(p1.x-xMin)*ax, y0+h-(p1.y-yMin)*ay,
                      x0+(p2.x-xMin)*ax, y0+h-(p2.y-yMin)*ay
                     );
         }
      }
   }
   if(this.kind==="points" || this.markers){      
      for(let k=0; k < this.series.length; k++)
         for(let i = 0; i < this.series[k].length; i++){
            let p = this.series[k][i];
            if(p===undefined) continue;
            draw.point(x0+(p.x-xMin)*ax, y0+h-(p.y-yMin)*ay, this.sPoint);
         }
   }
   draw.colorLine("#000");
   if(this.axisX){
      draw.widthLine(0.5);
      draw.line(x0, y0+h, x0+(xMax-xMin)*ax, y0+h);
   }
   draw.widthLine(0.5);   

   draw.sizeText(12);
   
   if(this.xMinShow)
      draw.text(xMin.toFixed(this.fixX), x0, y0+h + this.chH);    
   if(this.xMaxShow)
      draw.text(xMax.toFixed(this.fixX), x0+w-xMax.toFixed(this.fixX).length*this.chW, y0+h + this.chH );

   if(vxMax!==undefined && this.showMax)         // показывать x для максимума
      draw.text(vxMax.toFixed(this.fixX), x0+(vxMax-xMin)*ax, y0+h + this.chH);       
   
   draw.text(yMax.toFixed(this.fixY), x0- yMax.toFixed(this.fixY).length*this.chW, y0+ this.chH );
   draw.text(yMin.toFixed(this.fixY), x0- yMax.toFixed(this.fixY).length*this.chW, y0 + h - this.chH);
   
   draw.rect(x0+w/2, y0+h/2, w, h);
   
}
