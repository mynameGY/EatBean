// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

var map = cc.Class({
    extends: cc.Component,
    
    name:'map',
    
    properties: {
        upBtn : { default: null,  type: cc.Button},  
        rightBtn : { default: null,  type: cc.Button},  
        downBtn : { default: null,  type: cc.Button},  
        leftBtn : { default: null,  type: cc.Button},  
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.player = this.node.getChildByName('player');
        var playerTile = cc.p(0,0);
        var self = this;
        this.node.x = -470;
        this.node.y = -324;
        cc.log("onLoad");
        // cc.eventManager.addListener({
        //     event:cc.EventListener.KEYBOARD,
        //     onKeyPressed:function(keyCode,event){
        //         cc.log("keyCode");
        //         var newTile = cc.p(self.playerTile.x,self.playerTile.y);
        //         switch(keyCode){
        //             case cc.KEY.w:
        //                 newTile.y -= 1;
        //                 cc.log("cc.KEY.up");
        //                 break;
        //             case cc.KEY.s:
        //                 newTile.y += 1;
        //                 break;    
        //             case cc.KEY.a:
        //                 newTile.x -= 1;
        //                 break;      
        //             case cc.KEY.d:
        //                 newTile.x += 1;
        //                 break;  
        //             default:
        //                 return; 
        //         }

        //         self.tryMoveToNewTile(newTile);
        //     }
        // },self.node);
        
        this.upBtn.node.on('click', this.btnUp, this);  
        this.rightBtn.node.on('click', this.btnRight, this);  
        this.downBtn.node.on('click', this.btnDown, this);  
        this.leftBtn.node.on('click', this.btnLeft, this); 
    },

    //按键响应  
    btnUp:function(){  
        var newTile = cc.p(this.playerTile.x,this.playerTile.y);
        newTile.y -= 1;
        this.tryMoveToNewTile(newTile);
    },  
    btnRight:function(){  
        var newTile = cc.p(this.playerTile.x,this.playerTile.y);
        newTile.x += 1;
        this.tryMoveToNewTile(newTile);
    },  
    btnDown:function(next){  
        var newTile = cc.p(this.playerTile.x,this.playerTile.y);
        newTile.y += 1;
        this.tryMoveToNewTile(newTile);
    },  
    btnLeft:function(next){  
        var newTile = cc.p(this.playerTile.x,this.playerTile.y);
        newTile.x -= 1;
        this.tryMoveToNewTile(newTile);
    },  

    start () {
        this.loadMap();
        cc.log("loadMap");
    },

    // update (dt) {},

    //移动到新的位置
    tryMoveToNewTile:function(newTile){
        var mapSize = this.tiledMap.getMapSize();
        if(newTile.x < 0 || newTile.x >= mapSize.width)return;
        if(newTile.y < 0 || newTile.x >= mapSize.height)return;

        if(this.barriers.getTileGIDAt(newTile)){
            cc.log("This way is Blocked!");
            return false;
        }

        this.tryCatchStar(newTile);

        this.playerTile = newTile;
        this.updatePlayerPos();

        if(cc.pointEqualToPoint(this.playerTile,this.endTile)){
            cc.log('succeed');
        }
    },

    //尝试移除星星
    tryCatchStar:function(newTile){
        var GID = this.stars.getTileGIDAt(newTile);
        var prop = this.tileMap.getPropertiesForGID(GID);
        if(prop.isStar){
            this.stars.removeTileAt(newTile);
        }
    },

    //加载地图文件时调用
    loadMap:function(){
        
        //初始化地图位置
        // this.node.setPosition(cc.visibleRect.bottomLeft);
        //地图
        this.tiledMap  =this.node.getComponent(cc.TiledMap);
        //players层对象
        var players = this.tiledMap.getObjectGroup('players');
        //startPoint和endPoint对象
        var startPoint = players.getObject('startPoint');
        var endPoint = players.getObject('endPoint');
        //像素坐标
        var startPos = cc.p(startPoint.x, startPoint.y);
        var endPos = cc.p(endPoint.x, endPoint.y);

        //障碍物图层和星星图层
        this.barriers = this.tiledMap.getLayer('barriers');
        this.stars = this.tiledMap.getLayer('stars');

        //出生Tile和结束Tile
        this.playerTile = this.startTile = this.getTilePos(startPos);
        this.endTile = this.getTilePos(endPos);

        //更新player位置
        this.updatePlayerPos();
    },

    getTilePos:function(posInPixel){
        var mapSize = this.node.getContentSize();
        var tileSize = this.tiledMap.getTileSize();
        var x = Math.floor(posInPixel.x / tileSize.width);
        var y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);
        return cc.p(x, y);
    },


    updatePlayerPos: function() {
        var pos = this.barriers.getPositionAt(this.playerTile);
        // this.player.setPosition(pos);
        this.player.x = pos.x;
        this.player.y = pos.y;
    },
});
