'use strict';
/*Generador de mazmorras
Descripción del algoritmo:
Se usa una matriz para contener salas cuadradas con cuatro puertas posibles
en las direcciones cardinales, y dos vectores, uno de salas sin procesar y
otra con las salas ya procesadas.

Primero se crea la sala inicial que siempre tiene una puerta abajo, y se
añade al vector de salas sin visitar la sala que estaría debajo de esta.

El bucle principal de la generación de la mazmorra crea las salas pendientes
en el vector de salas sin procesar.
Para crear una sala, comprueba que no existan salas adyacentes a sus 4 direcciones.
Asigna aleatoriamente una de las direcciones posibles, crea su puerta, y mete en la
sala siguiente en el vector de salas sin procesar.
Cuando se crea una sala se decide aleatoriamente cuántas puertas de salida tendrá.

El bucle principal se ejecuta hasta que el vector de salas sin procesar se vacíe y
se hayan creado el número máximo de salas.

Una vez creada la estructura, se ejecuta un método que "cierra" las puertas que se
han quedado abiertas y no tienen una sala adyacente.
Después se buscan las salas que solo tienen una puerta (callejones sin salida), y
se asignan a estas siempre un boss, una tienda, y tesoros.

Si llega a haber un caso en el caso no hay suficientes callejones sin salida
porque se ha creado un mapa circular, entonces se vuelve a generar otra estructura distinta
para evitar errores.

Finalmente, se superponen sprites sobre los elementos de la matriz según las direcciones
que tiene la sala determinada.
*/
var PlayScene = {};
PlayScene.preload = function()
{
        this.game.load.image("FirstRoom", 'images/firstRoom.png',50,50)
        this.game.load.image('UDLR', 'images/roomUDLR.png', 50, 50);
        this.game.load.image('UDL', 'images/roomUDL.png', 50, 50);
        this.game.load.image('UDR', 'images/roomUDR.png', 50, 50);
        this.game.load.image('ULR', 'images/roomULR.png', 50, 50);
        this.game.load.image('UD', 'images/roomUD1.png', 50, 50);
        this.game.load.image('UL', 'images/roomUL.png', 50, 50);
        this.game.load.image('UR', 'images/roomUR.png', 50, 50);
        this.game.load.image('U', 'images/roomU.png', 50, 50);
        this.game.load.image('DLR', 'images/roomDLR.png', 50, 50);
        this.game.load.image('DL', 'images/roomLD1.png', 50, 50);
        this.game.load.image('DR', 'images/roomRD1.png', 50, 50);
        this.game.load.image('D', 'images/roomD.png', 50, 50);
        this.game.load.image('L', 'images/roomL.png', 50, 50);
        this.game.load.image('R', 'images/roomR.png', 50, 50);
        this.game.load.image('LR', 'images/roomLR1.png', 50, 50);
        this.game.load.image('BU', 'images/roomBossU.png', 50, 50);
        this.game.load.image('BR', 'images/roomBossR.png', 50, 50);
        this.game.load.image('BL', 'images/roomBossL.png', 50, 50);
        this.game.load.image('BD', 'images/roomBossD.png', 50, 50);
        this.game.load.image('SU', 'images/roomShopU.png', 50, 50);
        this.game.load.image('SR', 'images/roomShopR.png', 50, 50);
        this.game.load.image('SL', 'images/roomShopL.png', 50, 50);
        this.game.load.image('SD', 'images/roomShopD.png', 50, 50);
        this.game.load.image('CU', 'images/roomChestU.png', 50, 50);
        this.game.load.image('CR', 'images/roomChestR.png', 50, 50);
        this.game.load.image('CL', 'images/roomChestL.png', 50, 50);
        this.game.load.image('CD', 'images/roomChestD.png', 50, 50);
    },

PlayScene.create = function() {
        this.mapWidth=16;
        this.mapHeight=12;
        this.maxRooms=25;
        do {
          this.ClearMap();
          this.GenerateDungeon();
          this.FixDoors();//Cierra las puertas que se han quedado abiertas sin salas contiguas
          this.FindDeadEnds();
        }while(this.deadEnds.length<2)//Si se crea un mapa circular no valido, entonces se genera otro mapa

        this.CreateSpecialRooms();
        this.DrawDungeon();

},
PlayScene.ClearMap = function(){//Inicialización del mapa
      this.posibleDirections = [];//Vector con las direcciones posibles para las puertas de las salas
      this.visitedRooms = [];//Vector que contiene las salas que ya han sido procesadas
      this.unvisitedRooms = [];//Salas sin procesar
      this.roomsLeft=this.maxRooms;
      this.Dungeon = [];
      for (var i = 0; i < this.mapHeight; i++)
      {
        this.Dungeon[i] = [];
          for (var j = 0; j < this.mapWidth; j++)
          {
              this.Dungeon[i][j] = new Room();
              this.Dungeon[i][j].x = j;
              this.Dungeon[i][j].y = i;
              this.Dungeon[i][j].upDoor = false;
              this.Dungeon[i][j].rightDoor = false;
              this.Dungeon[i][j].downDoor = false;
              this.Dungeon[i][j].leftDoor = false;
              this.Dungeon[i][j].visited = false;
              this.Dungeon[i][j].boss = false;
              this.Dungeon[i][j].chest = false;
              this.Dungeon[i][j].shop = false;
          }
      }
}
PlayScene.FindDeadEnds = function(){//Busca las salas que solo tienen una puerta
  this.deadEnds = [];//Vector que contiene las salas con una sola puerta
  for(var i=0;i<this.visitedRooms.length;i++){
    var doorCount=0;
    if(this.visitedRooms[i].upDoor){
      doorCount++;
    }
    if(this.visitedRooms[i].downDoor){
      doorCount++;
    }
    if(this.visitedRooms[i].rightDoor){
      doorCount++;
    }
    if(this.visitedRooms[i].leftDoor){
      doorCount++;
    }
    if(doorCount==1){
      this.deadEnds.push(this.visitedRooms[i]);
    }
  }
}

PlayScene.CreateSpecialRooms = function(){//Asigna las salas especiales (Boss, tienda y tesoro)
  this.FindDeadEnds();
  var deadEndsnum = this.deadEnds.length;
  var bossRooms=1;
  var shopRooms=1;
  //var shopRooms = Math.floor((deadEndsnum-1)/4);//Un tercio de las salas sin salida son tiendas
  var chestRooms = Math.floor((deadEndsnum-2)/2);//Un tercio de las salas sin salida son tesoros
  var rnd = this.game.rnd.integerInRange(0,this.deadEnds.length-1);//la colocación de salas es aleatoria
  this.deadEnds[rnd].boss=true;
  this.deadEnds.splice(rnd,1);
  var rnd = this.game.rnd.integerInRange(0,this.deadEnds.length-1);//la colocación de salas es aleatoria
  this.deadEnds[rnd].shop=true;
  this.deadEnds.splice(rnd,1);

  for(var i=0; i<chestRooms;i++){
    var rnd = this.game.rnd.integerInRange(0,this.deadEnds.length-1);//la colocación de salas es aleatoria
    this.deadEnds[rnd].chest=true;
    this.deadEnds.splice(rnd,1);
  }

}
PlayScene.AddFirstRoom = function(){
      var midWidth=Math.floor(this.mapWidth/2);
      var midHeight=Math.floor(this.mapHeight/2);
      this.Dungeon[midHeight][midWidth].visited = true;//Crea la primera sala en la mitad de la matriz

      var room = this.game.add.sprite(midWidth*50,midHeight*50,'FirstRoom' );

      this.unvisitedRooms.push(this.Dungeon[midHeight+1][midWidth]);//Añade la sala de abajo al vector de salas sin visitar

      this.setEntryDoor(midWidth,midHeight+1, 'Up');
}
PlayScene.CheckDirections=function( x,  y){//Comprueba las direcciones disponibles para crear otra sala
      this.posibleDirections = [];
       if (this.AvailableCell(x, y-1))//Mira si hay sala arriba
       {
           this.posibleDirections.push('Up');
       }
       if (this.AvailableCell(x, y + 1))//Mira si hay sala abajo
       {
           this.posibleDirections.push('Down');
       }
       if (this.AvailableCell(x + 1 , y))//Mira si hay sala a la derecha
       {
           this.posibleDirections.push('Right');
       }
       if (this.AvailableCell(x - 1, y))//Mira si hay sala a la izquierda
       {
           this.posibleDirections.push('Left');
       }
}
PlayScene.GenerateDungeon = function (){
  this.AddFirstRoom();//Crea la sala principal
  while (this.unvisitedRooms.length>0 && this.roomsLeft > 0)//Va creando salas hasta que no quedan más por procesar
       {
         var maxExitRooms=0;//Define el número máximo de puertas de salida que podrá tener una sala

         if(this.roomsLeft>2){
           maxExitRooms=3;
         }
         else if(this.roomsLeft>1){
           maxExitRooms=2;
         }
         else if(this.roomsLeft>0){
           maxExitRooms=1;
         }
         var rnd = this.game.rnd.integerInRange(1,maxExitRooms);//Define si se va a crear una sala de 1,2 o 3 salidas
         if(maxExitRooms>0){
           if(rnd==1){//Crea 1 salida
             this.CreateRoom(this.unvisitedRooms[0].x, this.unvisitedRooms[0].y);//Crea la primera sala del vector de salas sin procesar
             this.roomsLeft--;
           }
           else if(rnd==2){//Crea 2 salidas
             this.CreateRoom(this.unvisitedRooms[0].x, this.unvisitedRooms[0].y);//Crea la primera sala del vector de salas sin procesar
             this.CreateRoom(this.unvisitedRooms[0].x, this.unvisitedRooms[0].y);//Crea la primera sala del vector de salas sin procesar
             this.roomsLeft--;
           }
           else if(rnd==3){//Crea 3 salidas
             this.CreateRoom(this.unvisitedRooms[0].x, this.unvisitedRooms[0].y);//Crea la primera sala del vector de salas sin procesar
             this.CreateRoom(this.unvisitedRooms[0].x, this.unvisitedRooms[0].y);//Crea la primera sala del vector de salas sin procesar
             this.CreateRoom(this.unvisitedRooms[0].x, this.unvisitedRooms[0].y);//Crea la primera sala del vector de salas sin procesar
             this.roomsLeft--;
           }
         }
         this.Dungeon[this.unvisitedRooms[0].y] [this.unvisitedRooms[0].x].visited = true;
         this.visitedRooms.push(this.Dungeon[this.unvisitedRooms[0].y][this.unvisitedRooms[0].x]);
         this.unvisitedRooms.shift();//Borra la sala actual de las salas sin visitar


       }
}
PlayScene.CreateRoom = function(x, y){

  this.CheckDirections(x, y);//Crea una lista de direcciones posibles
  var rnd = this.game.rnd.integerInRange(0,this.posibleDirections.length-1)//Selecciona una dirección aleatoriamente
  var direction = this.posibleDirections[rnd];
  this.SetRoomDirections(direction, x, y);//Añade la sala contigua a las salas sin visitar

}
PlayScene.FixDoors = function(){//Cierra las puertas que se han quedado abiertas y no tienen salas contiguas
  for(var i=0;i<this.visitedRooms.length;i++){
    var x = this.visitedRooms[i].x;
    var y = this.visitedRooms[i].y;
    if(this.CellInsideBounds(x+1,y) && this.AvailableCell(x+1,y)){//Si no hay celda a la derecha dentro de los límites del mapa
      this.Dungeon[y][x].rightDoor=false;
      this.Dungeon[y][x+1].leftDoor=false;
    }
    if(this.CellInsideBounds(x-1,y) && this.AvailableCell(x-1,y)){//Si no hay celda a la izquierda dentro de los límites del mapa
      this.Dungeon[y][x].leftDoor=false;
      this.Dungeon[y][x-1].rightDoor=false;
    }
    if(this.CellInsideBounds(x,y+1) && this.AvailableCell(x,y+1)){//Si no hay celda abajo dentro de los límites del mapa
      this.Dungeon[y][x].downDoor=false;
      this.Dungeon[y+1][x].upDoor=false;
    }
    if(this.CellInsideBounds(x,y-1) && this.AvailableCell(x,y-1)){//Si no hay celda arriba dentro de los límites del mapa
      this.Dungeon[y][x].upDoor=false;
      this.Dungeon[y-1][x].downDoor=false;
    }
  }
}
PlayScene.SetRoomDirections =function( direction, x, y){
  if (direction == 'Up')
        {
            this.Dungeon[y][x].upDoor = true;


            this.setEntryDoor(x,y-1,'Down');//Asigna la puerta de entrada de la sala de arriba
            var aux = this.posibleDirections.indexOf(direction);//Quita la propia dirección del vector de direcciones disponibles
            this.posibleDirections.splice(aux,1);
            var indexU = this.unvisitedRooms.indexOf(this.Dungeon[y-1][x]);
            var indexV= this.visitedRooms.indexOf(this.Dungeon[y-1][x]);
            if(indexU==-1 && indexV==-1){
              this.unvisitedRooms.push(this.Dungeon[y-1][x]);//Añade la sala de arriba a las salas sin visitar
            }

        }
        else if (direction == 'Down')
        {
            this.Dungeon[y][x].downDoor = true;


            this.setEntryDoor(x,y+1,'Up');
            var aux = this.posibleDirections.indexOf(direction);//Quita la propia dirección del vector de direcciones disponibles
            this.posibleDirections.splice(aux,1);
            var indexU = this.unvisitedRooms.indexOf(this.Dungeon[y+1][x]);
            var indexV= this.visitedRooms.indexOf(this.Dungeon[y+1][x]);
            if(indexU==-1 && indexV==-1){
              this.unvisitedRooms.push(this.Dungeon[y+1][x]);//Añade la sala de arriba a las salas sin visitar
            }

        }
        else if (direction == 'Right')
        {
            this.Dungeon[y][x].rightDoor = true;


            this.setEntryDoor(x+1,y,'Left');
            var aux = this.posibleDirections.indexOf(direction);//Quita la propia dirección del vector de direcciones disponibles
            this.posibleDirections.splice(aux,1);

            var indexU = this.unvisitedRooms.indexOf(this.Dungeon[y][x+1]);
            var indexV= this.visitedRooms.indexOf(this.Dungeon[y][x+1]);
            if(indexU==-1 && indexV==-1){
              this.unvisitedRooms.push(this.Dungeon[y][x+1]);//Añade la sala de arriba a las salas sin visitar
            }

        }
        else if (direction == 'Left')
        {
            this.Dungeon[y][x].leftDoor = true;


            this.setEntryDoor(x-1,y,'Right');
            var aux = this.posibleDirections.indexOf(direction);//Quita la propia dirección del vector de direcciones disponibles
            this.posibleDirections.splice(aux,1);

            var indexU = this.unvisitedRooms.indexOf(this.Dungeon[y][x-1]);
            var indexV= this.visitedRooms.indexOf(this.Dungeon[y][x-1]);
            if(indexU==-1 && indexV==-1){
              this.unvisitedRooms.push(this.Dungeon[y][x-1]);//Añade la sala de arriba a las salas sin visitar
            }

        }

}
PlayScene.setEntryDoor = function(x,y,direction){//Asigna dónde está la puerta de entrada de la sala
  if(direction=='Up'){
    this.Dungeon[y][x].upDoor = true;
  }
  else if(direction=='Down'){
    this.Dungeon[y][x].downDoor = true;
  }
  else if(direction=='Right'){
    this.Dungeon[y][x].rightDoor = true;
  }
  else if(direction=='Left'){
    this.Dungeon[y][x].leftDoor = true;
  }
}


PlayScene.CellInsideBounds = function ( x, y)//Comprueba si la celda accedida está dentro de los límites del mapa
    {
        if (x < 0 || x >= this.mapWidth || y<0 || y>=this.mapHeight)
        {
            return false;
        }
        else
        {
            return true;
        }
    }
PlayScene.AvailableCell = function(x, y)//Comprueba que la celda no haya sido visitada ya
    {
        if (this.CellInsideBounds(x, y) && !this.Dungeon[y][x].visited)
        {
            return true;
        }

        else return false;
    }

PlayScene.DrawDungeon = function(){//Dependiendo de las entradas abiertas, crea una sala u otra
  for(var i = 0; i < this.visitedRooms.length; i++)
       {
           if (this.visitedRooms[i].upDoor && this.visitedRooms[i].downDoor && this.visitedRooms[i].leftDoor && this.visitedRooms[i].rightDoor)//UDLR
           {
              var room = this.game.add.sprite(this.visitedRooms[i].x*50,this.visitedRooms[i].y*50, 'UDLR');
           }
           else if (this.visitedRooms[i].upDoor && this.visitedRooms[i].downDoor && this.visitedRooms[i].leftDoor)//UDL
           {
              var room = this.game.add.sprite(this.visitedRooms[i].x*50,this.visitedRooms[i].y*50, 'UDL');
           }
           else if (this.visitedRooms[i].upDoor && this.visitedRooms[i].downDoor && this.visitedRooms[i].rightDoor)//UDR
           {
              var room = this.game.add.sprite(this.visitedRooms[i].x*50,this.visitedRooms[i].y*50, 'UDR');
           }
           else if (this.visitedRooms[i].upDoor && this.visitedRooms[i].leftDoor && this.visitedRooms[i].rightDoor)//ULR
           {
              var room = this.game.add.sprite(this.visitedRooms[i].x*50,this.visitedRooms[i].y*50, 'ULR');
           }
           else if (this.visitedRooms[i].upDoor && this.visitedRooms[i].downDoor)//UD
           {
              var room = this.game.add.sprite(this.visitedRooms[i].x*50,this.visitedRooms[i].y*50, 'UD')
           }
           else if (this.visitedRooms[i].upDoor && this.visitedRooms[i].leftDoor)//UL
           {
              var room = this.game.add.sprite(this.visitedRooms[i].x*50,this.visitedRooms[i].y*50, 'UL');
           }
           else if (this.visitedRooms[i].upDoor && this.visitedRooms[i].rightDoor)//UR
           {
              var room = this.game.add.sprite(this.visitedRooms[i].x*50,this.visitedRooms[i].y*50, 'UR');
           }

           else if (this.visitedRooms[i].downDoor && this.visitedRooms[i].leftDoor && this.visitedRooms[i].rightDoor)//DLR
           {
              var room = this.game.add.sprite(this.visitedRooms[i].x*50,this.visitedRooms[i].y*50, 'DLR');
           }
           else if (this.visitedRooms[i].downDoor && this.visitedRooms[i].leftDoor)//DL
           {
              var room = this.game.add.sprite(this.visitedRooms[i].x*50,this.visitedRooms[i].y*50, 'DL');
           }
           else if (this.visitedRooms[i].downDoor && this.visitedRooms[i].rightDoor)//DR
           {
              var room = this.game.add.sprite(this.visitedRooms[i].x*50,this.visitedRooms[i].y*50, 'DR');
           }
           else if (this.visitedRooms[i].leftDoor && this.visitedRooms[i].rightDoor)//LR
           {
              var room = this.game.add.sprite(this.visitedRooms[i].x*50,this.visitedRooms[i].y*50, 'LR');
           }
           else if (this.visitedRooms[i].upDoor)//U
           {
               var roomChar='U'
               if(this.visitedRooms[i].boss){
                 roomChar='BU';
               }
               else if(this.visitedRooms[i].chest){
                 roomChar='CU';
               }
               else if(this.visitedRooms[i].shop){
                 roomChar='SU';
               }
              var room = this.game.add.sprite(this.visitedRooms[i].x*50,this.visitedRooms[i].y*50, roomChar);
           }
           else if (this.visitedRooms[i].downDoor)//D
           {
               var roomChar='D'
               if(this.visitedRooms[i].boss){
                 roomChar='BD';
               }
               else if(this.visitedRooms[i].chest){
                 roomChar='CD';
               }
               else if(this.visitedRooms[i].shop){
                 roomChar='SD';
               }
              var room = this.game.add.sprite(this.visitedRooms[i].x*50,this.visitedRooms[i].y*50, roomChar);
           }
           else if (this.visitedRooms[i].leftDoor)//L
           {
               var roomChar='L'
               if(this.visitedRooms[i].boss){
                 roomChar='BL';
               }
               else if(this.visitedRooms[i].chest){
                 roomChar='CL';
               }
               else if(this.visitedRooms[i].shop){
                 roomChar='SL';
               }
              var room = this.game.add.sprite(this.visitedRooms[i].x*50,this.visitedRooms[i].y*50, roomChar);
           }
           else if (this.visitedRooms[i].rightDoor)//R
           {
               var roomChar='R'
               if(this.visitedRooms[i].boss){
                 roomChar='BR';
               }
               else if(this.visitedRooms[i].chest){
                 roomChar='CR';
               }
               else if(this.visitedRooms[i].shop){
                 roomChar='SR';
               }
              var room = this.game.add.sprite(this.visitedRooms[i].x*50,this.visitedRooms[i].y*50, roomChar);
           }
       }
}
PlayScene.update = function() {
};
function Room(){
  this.x;
  this.y;
  this.upDoor;
  this.rightDoor;
  this.downDoor;
  this.leftDoor;
  this.visited;
  this.boss;
  this.chest;
  this.shop;
}



module.exports = PlayScene;
