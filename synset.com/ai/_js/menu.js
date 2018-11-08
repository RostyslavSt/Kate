if(!window.performance.now)
   window.performance.now = function() { return new Date(); }

let mathjaxConfig = {
   tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]},
   TeX: {
      equationNumbers: { autoNumber: "AMS" },
      Macros: {
         sh:  "\\mathrm{sh\\,}",
         ch:  "\\mathrm{ch\\,}",
         th:  "\\mathrm{th\\,}",
         ash: "\\mathrm{ash\\,}",
         ach: "\\mathrm{ach\\,}",
         ath: "\\mathrm{ath\\,}",
      }
   }
}

let hor_nav_menu = [
   ["Данные", "", 1],
      ["ИИ на JavaScript",               "ai/ru/data/AI_JavaScript.html", 2],
      ["Рекурсия",                       "ai/ru/data/Recursion.html", 2],
      ["Грубая сила",                    "ai/ru/data/Force.html", 2],
      ["Списки",                         "ai/ru/data/Lists.html", 2],
      ["Бинарные деревья",               "ai/ru/data/BST.html", 2],
      ["Приоритетная очередь",           "ai/ru/data/Queue.html", 2],
      ["Деревья",                        "ai/ru/data/Trees.html", 2],
      ["Графы",                          "ai/ru/data/Graphs.html", 2],
      ["Редактор графов",                "ai/ru/data/graph_editor.html", 2],
      ["Длительные вычисления",          "ai/ru/data/LongCalc.html", 2],
   ["Поиск", "search/index.html", 1],
      ["Пространство состояний",         "ai/ru/search/States.html", 2],
      ["Поиск на деревьях",              "ai/ru/search/Trees_search.html", 2],
      ["Поиск на графах",                "ai/ru/search/Graphs_search.html", 2],
      ["Эвристики в пятнашках",          "ai/ru/search/Fifteen_heuristics.html", 2],
      ["Пятнашки",                       "ai/ru/search/Fifteen.html", 2],
      ["Ханойские башни",                "ai/ru/search/Towers_of_Hanoi.html", 2],
   ["TSP", "tsp/index.html", 1],
      ["Задача коммивояжёра",            "ai/ru/tsp/Salesman_Intro.html", 2],
      ["Класс Salesman",                 "ai/ru/tsp/Salesman_Class.html", 2],
      ["Эвристики",                      "ai/ru/tsp/Salesman_Heuristics.html", 2],
      ["Нижняя граница длины пути",      "ai/ru/tsp/Salesman_Bounds.html", 2],
      ["Поиск с возвратом",              "ai/ru/tsp/Salesman_Back.html", 2],
      ["Метод ветвей и границ",          "ai/ru/tsp/Salesman_Branch_And_Bound.html", 2],
      ["Тестирование методов",           "ai/ru/tsp/Salesman.html", 2],
      ["Площадь полигонов",              "ai/ru/tsp/Polygonal_Areas_Task.html", 2],
      ["Поиск оптимальных полигонов",    "ai/ru/tsp/Polygonal_Areas.html", 2],
   ["Распознавание", "", 1],
      ["Многомерные пространства",       "ai/ru/recognition/Recognition_Space.html", 2],
      ["Расстояние и близость",          "ai/ru/recognition/Recognition_Distance.html", 2],
      ["Метод главных компонент",        "ai/ru/recognition/Recognition_PCA.html", 2],
      ["Многомерное шкалирование",       "ai/ru/recognition/Recognition_Scaling.html", 2],
      ["Методы эталонов",                "ai/ru/recognition/Recognition_01_Etalons.html", 2],
      ["Разделяющие поверхности",        "ai/ru/recognition/Recognition_02_Surface.html", 2],
      ["Вероятностные методы",           "ai/ru/recognition/Recognition_03_Probability.html", 2],
      ["Решающие деревья",               "ai/ru/recognition/Recognition_04_Decision_Tree.html", 2],
      ["Тестирование и композиция методов",               "ai/ru/recognition/Recognition_05_Boosting.html", 2],
   ["Нейронные сети", "", 1],
      ["Введение",                       "ai/ru/nn/NeuralNet_01_Intro.html", 2],
      ["Разделяющие поверхности",        "ai/ru/nn/NeuralNet_02_Surface.html", 2],
      ["Обучение",                       "ai/ru/nn/NeuralNet_03_Learn.html", 2],
      ["Пример для 2D",                  "ai/ru/nn/NeuroNet2D.html", 2],
   ["Логика", "logic/index.html", 1],
      ["Введение в логику",              "logic/ru/intro/00_logic_intro.html", 2],
      ["Исчисления",                     "logic/ru/propositions/Proofs.html", 2],
      ["Отношения",                      "", 2],
   ["Графика", "", 1],
      ["Canvas и SVG (draw.js)",         "comp/ru/draw/draw.html", 2],
      ["Алгоритмы (g2d.js)",             "comp/ru/draw/g2d.html", 2],
      ["Упаковка кластеров",             "comp/ru/draw/pack.html", 2],
   ["Справка", "cab/index.html", 1],
      ["JavaScript",                     "comp/ru/cab/js.html", 2],
      ["JavaScript Canvas",              "comp/ru/cab/js_canvas.html", 2],
      ["JavaScript Worker",              "comp/ru/cab/worker.html", 2],
      ["CSS",                            "comp/ru/cab/css.html", 2],
];

//---------------------------------------------------------------------------------------
function writeHorNavMenu(page)
{
   if(page.search("file://") ===0 )                  // локальный файл
       page = "file:///C:/!/!Synset/";
   else                                              // интернет
     page = "http://synset.com/";

   let txt = '<nav id="primary_nav_wrap"><ul>';
   txt += '<li><a href="http://synset.com">Home</a></li>';
   for(let i=0; i<hor_nav_menu.length; i++){
      let m = hor_nav_menu[i];
      txt += '<li><a href="'+page+m[1]+'">'+m[0]+'</a>';
      if(i+1===hor_nav_menu.length){                  // конец меню
         txt += '</li>';
         break;
      }
      let m1 = hor_nav_menu[i+1];
      if(m1[2]===m[2])                                // подменю
         txt += '</li>';
      else if (m1[2] > m[2])
         txt += '<ul>';
      else if (m1[2] < m[2]){
         let n = m[2]-m1[2];
         for(let k=0; k<n; k++)
            txt += '</ul></li>';
      }
   }
   txt += '</ul></nav>';
   document.write(txt);
}
//---------------------------------------------------------------------------------------
function writePrevNextMenu(prev, prev_url, next, next_url)
{
  document.write('<div style="width:97%; height:1.2em;  padding: 1% 1% 1% 1%; border: 2px solid #AAF; border-radius: 10px; margin: auto; ">');
  if(prev.length>0)
     document.write('<div style="float:left; vertical-align:middle;"> <a href="'+prev_url+'">'+prev+'</a> &lt;</div>');
  if(next.length>0)
     document.write('<div style="float:right; vertical-align:middle;"> &gt; <a href="'+next_url+'">'+next+'</a></div>');
  document.write('</div>');
}
//---------------------------------------------------------------------------------------
function writeFooter(page)
{
  document.write("<div align='right'>2017 (c) synset.com</div>");
}
//---------------------------------------------------------------------------------------
