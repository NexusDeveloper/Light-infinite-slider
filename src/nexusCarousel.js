function NexusCarousel(node,config){
	this.node=node;
	this.$node=$(node);
	this.config=$.extend({},{
		respondMouse:true,
		duration:2000,
		delay:0,
		direction:'right',
		autoScroll:false,
		controls:false,
		nextSelector:'',
		prevSelector:''
	},!!config?config:{});

	for(var i in this.config){
		if(!this.config.hasOwnProperty(i) || this.$node.attr('data-'+i)===undefined)
			continue;

		var type=typeof this.config[i],
			value=this.$node.attr('data-'+i);

		if(type=='boolean')
			value=value=='true'?true:(value=='false'?false:!!value);
		else if(type=='object')
			try{
				value=JSON.parse(value);
			} catch(e){
				continue;
			}
		else if(type=='function')
			value=new Function(value);
		else if(type!='string')
			value=+value.replace(/\D+?/g,'');

		this.config[i]=value;
	}

	node.__NexusCarousel=this;
	this.init();
};
NexusCarousel.prototype.getElements=function(){
	return this.$node.find('.wrapper .item');
};
NexusCarousel.prototype.init=function(){
	this.$elements=this.getElements();

	var $wrapper=this.$node.find('.viewport>.wrapper');
	$wrapper.css({
		height:function(){
				var v=0;
				this.$elements.each(function(){
					var h=$(this).outerHeight(true);
					if(v<h)
						v=h;
				});

				return v;
			}.call(this),
		width:this.$elements.size()*this.$elements.eq(0).width()
	});

	if(this.config.respondMouse)
		$wrapper.on('mouseenter mouseleave',function(e){
			$(this).parents('.nexus-carousel').get(0).__NexusCarousel['scroll'+(e.type=='mouseenter'?'Start':'Stop')]();
		});

	if(this.config.autoScroll)
		this.__doScroll();

	if(this.config.controls){
		var _class=this;
		this.$node.find(this.config.nextSelector).on('click',function(){
			_class.next();
		});
		this.$node.find(this.config.prevSelector).on('click',function(){
			_class.prev();
		});
	}
};
NexusCarousel.prototype.scrolling=false;
NexusCarousel.prototype.scrollStart=function(){
	if(!!this.scrolling)
		return this;

	this.scrolling=true;
	this.__doScroll();

	return this;
};
NexusCarousel.prototype.scrollStop=function(){
	if(!this.scrolling)
		return this;

	this.$node.find('.viewport').stop(true);
	this.scrolling=false;

	return this;
};
NexusCarousel.prototype.next=function(){
	var state=this.scrolling;
	this.scrolling=true;
	this.__doScroll();
	this.scrolling=state;

	return this;
};
NexusCarousel.prototype.prev=function(){
	var state=this.scrolling;
	this.scrolling=true;
	this.__doScroll('left');
	this.scrolling=state;

	return this;
};
NexusCarousel.prototype.__doScroll=function(direction,duration){
	if(!this.scrolling && !this.config.autoScroll)
		return this;

	direction=(['left','right']).indexOf(direction)==-1?this.config.direction:direction;
	direction=(direction!='left');

	var _class=this,
		$elements=this.getElements(),
		$vPort=this.$node.find('.viewport'),
		$wrap=$elements.parents('.wrapper'),
		scrL=$vPort.scrollLeft(),
		elWidth=$elements.eq(0).outerWidth(true),
		elNum=((elWidth-scrL<elWidth/2)?2:1),//How many elems do need to scroll
		speed=!!duration?duration:((elWidth*elNum-scrL)*this.config.duration/elWidth);

	if($vPort.get(0).__scrollTimeOut)
		clearTimeout($vPort.get(0).__scrollTimeOut);

	if(direction){//ltr
		$vPort.stop(true).animate({
			scrollLeft:elWidth*elNum
		},speed,'linear',function(){
			for(var i=0;i<elNum;i++){
				var $el=$elements.eq(i);
				$el.clone().appendTo($wrap);
				$el.remove();
			}

			$vPort.scrollLeft(0);
			$vPort.get(0).__scrollTimeOut=setTimeout(function(){
				_class.__doScroll();
			},_class.config.delay);
		});
	}else{//rtl
		$vPort.stop(true).animate({
			scrollLeft:elWidth*elNum
		},0,function(){
			for(var i=0;i<elNum;i++){
				var $el=$elements.eq($elements.length-1-i);
				$el.clone().prependTo($wrap);
				$el.remove();
			}
		}).animate({
			scrollLeft:0
		},speed,'linear',function(){
			$vPort.get(0).__scrollTimeOut=setTimeout(function(){
				_class.__doScroll();
			},_class.config.delay);
		});
	};

	return this;
};
