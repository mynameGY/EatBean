// var up = 'up';
// var down = 'down';
// var left = 'left';
// var right = 'right';

var speed = 2;

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

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this.score = 0;
        this.player = this.map.node.getChildByName('player');
        var self = this;
        this.direction = 'stop';
        cc.eventManager.addListener({
            event:cc.EventListener.KEYBOARD,
            onKeyPressed:function(keyCode,event){
                var newTile = cc.p(self.playerTile.x,self.playerTile.y);
                cc.log("keyCode!",keyCode);
                switch(keyCode){
                    case cc.KEY.w:
                        // newTile.y -= 1;
                        cc.log("keyCode! up==============");
                        self.direction = 'up';
                        break;
                    case cc.KEY.s:
                        // newTile.y += 1;
                        self.direction = 'down';
                        break;    
                    case cc.KEY.a:
                        // newTile.x -= 1;
                        self.direction = 'left';
                        break;      
                    case cc.KEY.d:
                        // newTile.x += 1;
                        self.direction = 'right';
                        break;  
                    default:
                        return;
                }

                // self.tryMoveToNewTile(newTile);
            }
        },self.node);
    },

    start () {
        this.loadMap();
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
        // this.updatePlayerPos();
        // if(cc.pointEqualToPoint(this.playerTile,this.endTile)){
        //     cc.log('succeed');
        // }
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
        var y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);
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
        cc.log('this.direction',this.direction);
        switch(this.direction){
            case 'up':
                if(this.tryMoveToNewTile(this.getTilePos(cc.p(this.player.x,this.player.y + speed)))){
                    this.player.y += speed;
                }
            case 'down':
                if(this.tryMoveToNewTile(this.getTilePos(cc.p(this.player.x,this.player.y - speed)))){
                    this.player.y -= speed;
                }
            case 'left':
                var p = this.getTilePos(cc.p(this.player.x - speed,this.player.y));
                if(this.tryMoveToNewTile(cc.p(2,10))){
                    cc.log('left==============');
                    this.player.x -= speed;
                }
            case 'right':
                if(this.tryMoveToNewTile(this.getTilePos(cc.p(this.player.x + speed,this.player.y)))){
                    this.player.x += speed;
                }
            default:
        }

    },

    /**
     * 根据按键尝试改变方向
     */
    tryChangeDirection:function () {
        
    },


});
