function NexusCarousel(node,config){
	this.node=node;
	this.$node=$(node);
	this.config=$.extend({},{
		respondMouse:true,
		respondTouch:true,
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
	return this.$elements=this.$node.find('.wrapper .item');
};
NexusCarousel.prototype.init=function(){
	this.$elements=this.getElements();
	var $wrapper=this.$node.find('.viewport>.wrapper'),
		_class=this;


	this.$elements.click(function(e){
		if(_class.__isTouch)
			e.preventDefault();
	});

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
			if(!_class.__isTouch)
				_class['scroll'+(e.type=='mouseenter'?'Start':'Stop')]();
		});

	if(this.config.autoScroll)
		this.__doScroll();

	if(this.config.controls){
		this.$node.find(this.config.nextSelector).on('click',function(){
			_class.next();
		});
		this.$node.find(this.config.prevSelector).on('click',function(){
			_class.prev();
		});
	}

	if(this.config.respondTouch)
		this.initTouch();
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
NexusCarousel.prototype.__scrollTimeOut=false;
NexusCarousel.prototype.__doScroll=function(direction,duration){
	if(!this.scrolling && !this.config.autoScroll && !this.__isTouch)
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
		speed=(!!duration || duration===0)?duration:((elWidth*elNum-scrL)*this.config.duration/elWidth);

	if(_class.__scrollTimeOut)
		clearTimeout(_class.__scrollTimeOut);

	var setTOut=function(){
		if(!_class.__isTouch && $(window).width()>768)
			_class.__scrollTimeOut=setTimeout(function(){
				_class.__doScroll();
			},_class.config.delay);
		else
			_class.__scrollTimeOut=false;
	};
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
			setTOut();
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
		},speed,'linear',setTOut);
	};

	return this;
};
NexusCarousel.prototype.__isTouch=false;
NexusCarousel.prototype.initTouch=function(){
	var self=this,
		$viewport=self.$node.find('.viewport'),
		$wrapper=$viewport.find('>.wrapper'),
		elWidth=this.getElements().eq(0).outerWidth(true),
		start_pos_x=0,
		get_event=function(event){
			if(!!event.originalEvent && !!event.originalEvent.touches && event.originalEvent.touches.length>0){
				return event.originalEvent.touches[0];
			}else if(!!event.originalEvent && !!event.originalEvent.changedTouches && event.originalEvent.changedTouches.length>0){
				return event.originalEvent.changedTouches[0];
			}

			return false;
		};

	if(!this.__touchPos)
		this.__touchPos={x:0,y:0};

	$viewport.on('touchstart touchend',function(e){
		e.stopPropagation();

		self.__isTouch=e.type=='touchstart';
		e=get_event(e);

		self.__touchPos={
			x:e.clientX||0,
			y:e.clientY||0
		};

		if(self.__isTouch){
			start_pos_x=(e.clientX||0);
			return;
		}

		var $viewport=self.$node.find('.viewport'),
			scrLeft=$viewport.scrollLeft(),
			elWidth=self.getElements().eq(0).width(),
			distance=scrLeft%elWidth,
			dragValue=start_pos_x-(e.clientX||0);

		$viewport.animate({
			scrollLeft:(dragValue>0)?((distance>elWidth/4)?(scrLeft+elWidth-distance):(scrLeft-distance)):
				((dragValue<0 && Math.abs(dragValue)>elWidth/4)?(scrLeft-distance):(scrLeft+elWidth-distance))
		},300);
	}).on('touchmove',function(e){
		e=get_event(e);

		var $viewport=self.$node.find('.viewport'),
			dragValue=self.__touchPos.x-(e.clientX||0),
			scrLeft=$viewport.scrollLeft(),
			newScrLeft=scrLeft+dragValue;

		if(newScrLeft<0){//direction: right
			$viewport.scrollLeft(elWidth);
			self.getElements().last().clone().prependTo($wrapper);
			self.$elements.last().remove();
			newScrLeft+=elWidth;
		}else if(newScrLeft+$(window).width()>$wrapper.width()){//left
			$viewport.scrollLeft($wrapper.width()-elWidth);
			self.getElements().first().clone().appendTo($wrapper);
			self.$elements.first().remove();
			newScrLeft-=elWidth;
		}

		$viewport.scrollLeft(newScrLeft);


		self.__touchPos={
			x:e.clientX||0,
			y:e.clientY||0
		};
	});

	return this;
};
