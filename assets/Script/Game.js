var config = require("Config");

var speed = config.speed;

cc.Class({
    extends: cc.Component,
    properties: {
        map:{
            default:null,
            type:cc.TiledMap
        },
        scoreText:{
            default:null,
            type:cc.Label
        }
        
    },

    createMonster:function(url,monster){
        var self = this;
        cc.loader.loadRes(url,function(err,perfab){
            monster = cc.instantiate(perfab);
            cc.log("monster==============",monster);
            monster.parent = self.map.node;
            var pos = self.barriers.getPositionAt(cc.p(10,6));
            monster.setPosition(pos);
            //待优化
            self.blinky = monster;
        });
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this.score = 0;
        this.player = this.map.node.getChildByName('player');
        var self = this;
        this.direction = config.stop;
        cc.eventManager.addListener({
            event:cc.EventListener.KEYBOARD,
            onKeyPressed:function(keyCode,event){
                var newTile = cc.p(self.playerTile.x,self.playerTile.y);
                cc.log("keyCode!",keyCode);
                switch(keyCode){
                    case cc.KEY.w:
                        cc.log("keyCode! up==============");
                        self.direction = config.up;
                        break;
                    case cc.KEY.s:
                        self.direction = config.down;
                        break;    
                    case cc.KEY.a:
                        self.direction = config.left;
                        break;      
                    case cc.KEY.d:
                        self.direction = config.right;
                        break;  
                    default:
                        return;
                }
            }
        },self.node);
    },

    start () {
        this.loadMap();
        this.blinky = this.createMonster('Blinky',this.blinky);
        // cc.log("blinky==============",blinky);
    },

    //移动到新的位置
    tryMoveToNewTile:function(newTile){
        var mapSize = this.tiledMap.getMapSize();
        if(newTile.x < 0 || newTile.x >= mapSize.width)return false;
        if(newTile.y < 0 || newTile.x >= mapSize.height)return false;

        if(this.barriers.getTileGIDAt(newTile)){
            cc.log("This way is Blocked!");
            return false;
        }
        this.tryCatchStar(newTile);
        this.playerTile = newTile;
        return true;
    },

    //尝试移除星星
    tryCatchStar:function(newTile){
        var GID = this.beans.getTileGIDAt(newTile);
        var prop = this.tiledMap.getPropertiesForGID(GID);
        cc.log('prop:'+prop);
        if(prop != null && prop.isBean){
            this.beans.removeTileAt(newTile);

            //增加金币
            this.score += 1;
            this.scoreText.string = 'Score:' + this.score.toString();
        }
    },

    //加载地图文件时调用
    loadMap:function(){
        //初始化地图位置
        this.node.setPosition(cc.visibleRect.bottomLeft);
        //地图
        this.tiledMap  =this.map.node.getComponent(cc.TiledMap);
        //障碍物图层和星星图层
        this.barriers = this.tiledMap.getLayer('barriers');
        this.beans = this.tiledMap.getLayer('beans');
        this.playerTile = cc.p(2,10);
        //更新player位置
        this.updatePlayerPos();
    },

    getTilePos:function(posInPixel){
        var mapSize = this.map.node.getContentSize();
        var tileSize = this.tiledMap.getTileSize();
        var x = Math.floor(posInPixel.x / tileSize.width);
        var y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height) -1;

        cc.log("posInPixel",posInPixel.x);
        cc.log("mapSize",mapSize.height);
        cc.log("y",y);
        return cc.p(x, y);
    },

    updatePlayerPos: function() {
        var pos = this.barriers.getPositionAt(this.playerTile);
        this.player.setPosition(pos);
    },

    update (dt) {
        this.move(this.direction,this.player);

        this.move(this.direction,this.blinky);
    },

    move:function(direction,player){
        switch(direction){
            case config.up:
                var p = this.getTilePos(cc.p(player.x,player.y + speed));
                if(this.tryChangeDirection(cc.p(p.x,p.y))){
                    player.y += speed;
                }
                else{
                    var p = this.getTilePos(cc.p(player.x ,player.y));
                    this.stopPlayer(cc.p(p.x,p.y));
                }
                break;
            case config.down:
                var p = this.getTilePos(cc.p(player.x,player.y - speed));
                if(this.tryChangeDirection(cc.p(p.x,p.y + 1)))
                {
                    player.y -= speed;
                }
                else
                {
                    var p = this.getTilePos(cc.p(player.x ,player.y));
                    this.stopPlayer(cc.p(p.x,p.y+1));
                }
                break;
            case config.left:
                var p = this.getTilePos(cc.p(player.x - speed,player.y));
                if(this.tryChangeDirection(cc.p(p.x,p.y)))
                {
                    cc.log('left==============pred',player.x);
                    player.x = player.x - speed;
                }
                else
                {
                    var p = this.getTilePos(cc.p(player.x ,player.y));
                    this.stopPlayer(cc.p(p.x,p.y));
                }
                break;
            case config.right:
                var p = this.getTilePos(cc.p(player.x + speed,player.y));
                if(this.tryChangeDirection(cc.p(p.x+1,p.y)))
                {
                    player.x += speed;
                }
                else
                {
                    var p = this.getTilePos(cc.p(player.x ,player.y));
                    this.stopPlayer(cc.p(p.x+1,p.y));
                }
                break;
            default:
                
        }
    },

    //停止
    stopPlayer:function(title){
        this.direction = config.stop;
        this.playerTile = title;
        this.updatePlayerPos();
    },

    /**
     * 根据按键尝试改变方向
     */
    tryChangeDirection:function (newTile) {
        var mapSize = this.tiledMap.getMapSize();
        if(newTile.x < 0 || newTile.x >= mapSize.width)return false;
        if(newTile.y < 0 || newTile.x >= mapSize.height)return false;

        if(this.barriers.getTileGIDAt(newTile)){
            cc.log("This way is Blocked!=== x",newTile.x);
            cc.log("This way is Blocked!=== y",newTile.y);
            return false;
        }
        this.tryCatchStar(newTile);
        return true;
    },




});
