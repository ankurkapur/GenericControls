/**
 * @author akapur
 * Configuration Parameters
 * viewModel:testViewModel,
 * titleConfig:{title:'Heat Map',component:{xtype:'custom component'}}, component is optional
 * xAxisConfig:{axisRef:'revenue',axisLabel:'revenue',component:{},labelComponent:{}}, similar to above optional component
 * yAxisConfig:{axisRef:'margin',axisLabel:'margin',component:{},labelComponent:{}}, similar to above optional component
 * valueConfig:{seriesRef:'count',seriesLabel:'count',component:{}}, optional component
 * colorConfig:{axisRef:'oppBand',seriesRef:'opportunity',axisLabel:'opportunity',seriesLabel:'opportunity',labelComponent:{}} optional label component
 * colors:[] optional
 */
Ext.define('charts.view.HeatMap',{
	extend:'Ext.Container',
	alias:'widget.vistaarheatmap',
	requires:['charts.model.ViewModel'],
	layout:'fit',
	title:'Heat Map',//Default title for Heat Map
	LegendPosition:'right',
	xAxisConfig:{},//contains axis label, axis mapping in data model and optional comparator
	yAxisConfig:{},//same as xAxis config
	colorAxisConfig:{},//container color axis display label optional comparator
	colors:['#fca78d','#fcc2b1','#fae3d9','#e6f5ed','#c3e0d2','#90d4b3'], //list of colors mapping to the bands in the color axis
	cellSeries:{},//contains mapping to the series in the view model to be plotted in the cells also optional series label
	toolTipSeries:[],//array of series values to be plotted in the tooltip from the view model
	constructor:function(config){
		//Invoke parent constructor
		this.callParent([config]);
		
		/********************************************************************************************************
		 *  Private Variables
		 ********************************************************************************************************/
		var xAxisBands = [];
		var yAxisBands = [];
		var colorBands = [];
		var me = this;
		var heatMapContainer = null;
		/********************************************************************************************************
		 *  Private Methods
		 ********************************************************************************************************/
		//Create heat map container based on the xAxis Bands specified
		function createEmptyHeatMapContainer(){		
													if(heatMapContainer != null){
														me.remove(heatMapContainer);
													};
													heatMapContainer = Ext.widget('container',{
															layout: {
																type: 'table',
																columns: xAxisBands.length + 3,
																align:'stretch'
															},
															flex:1
													});
													me.add(heatMapContainer);
												};
		
		//default comparator for band values
		function isNumeric(n) {
			  return !isNaN(parseFloat(n)) && isFinite(n);
			}
		
		function defaultComparator(a,b){
			try {
				if (isNumeric(a) && isNumeric(b)) {
					return parseFloat(a) > parseFloat(b);
				}
				else {
					return a > b;
				}
			}catch(e){return a > b}
		}
		
		// get the band values
		function getBands(){
			if (!me.xAxisConfig.hasOwnProperty('comparator')) {
				xAxisBands = me.getViewModel().getColumnValues(me.xAxisConfig.axisRef,defaultComparator);
			}else{
				if (typeof(me.xAxisConfig.comparator) == 'function') {
					xAxisBands = me.getViewModel().getColumnValues(me.xAxisConfig.axisRef, me.xAxisConfig.comparator);
				}else{
					Ext.Error.raise({
									msg: 'Incorrect comparator specified. expected function',
									errorCode: 101 // use 101 for configuration errors
									});
				}
			}
			if (!me.yAxisConfig.hasOwnProperty('comparator')) {
				yAxisBands = me.getViewModel().getColumnValues(me.yAxisConfig.axisRef,defaultComparator);
			}else{
				if (typeof(me.yAxisConfig.comparator) == 'function') {
					yAxisBands = me.getViewModel().getColumnValues(me.yAxisConfig.axisRef, me.yAxisConfig.comparator);
				}else{
					Ext.Error.raise({
									msg: 'Incorrect comparator specified. expected function',
									errorCode: 101 // use 101 for configuration errors
									});
				}
			}
			if (!me.colorConfig.hasOwnProperty('comparator')) {
				colorBands = me.getViewModel().getColumnValues(me.colorConfig.axisRef,defaultComparator);
			}else{
				if (typeof(me.colorConfig.comparator) == 'function') {
					colorBands = me.getViewModel().getColumnValues(me.colorConfig.axisRef, me.colorConfig.comparator);
				}else{
					Ext.Error.raise({
									msg: 'Incorrect comparator specified. expected function',
									errorCode: 101 // use 101 for configuration errors
									});
				}
			}
		}
		
		// Add components specified in the view model
		function addComponents(){
			
			var legendAdded = false;
			
			//Add Legend
			if (me.LegendPosition == 'left') {
				heatMapContainer.add(getLegend());
			}	
			
			//Add Title
			heatMapContainer.add(getTitleComp());
			
			//Add Legend
			if (me.LegendPosition == 'right') {
				heatMapContainer.add(getLegend());
			}else if(me.LegendPosition != 'left'){
				var component = getDummyComp();
				component.rowspan = yAxisBands.length + 3;
				heatMapContainer.add(component);
			}	
			
			//Add y Axis Label
			heatMapContainer.add(getYAxisComp());
			
			//populate yAxis labels and values grid 
			for (var yCounter = yAxisBands.length - 1; yCounter >= 0; yCounter--) {
				heatMapContainer.add(getYAxisLabelComponent(yAxisBands[yCounter]));
				for (counter = 0; counter < xAxisBands.length; counter++) {
					var intersectionConfig = {};
					intersectionConfig[me.xAxisConfig.axisRef] = xAxisBands[counter];
					intersectionConfig[me.yAxisConfig.axisRef] = yAxisBands[yCounter];
					heatMapContainer.add(getValueComponent(me.getViewModel().getValueForIntersection(
																										intersectionConfig,
																										[me.valueConfig.seriesRef]
																									)[me.valueConfig.seriesRef],
																									counter,yCounter
															)
										);
				}
				if(!legendAdded){
					//Add legend
						
					legendAdded = true;
				}
			}
			
			//Add XAxis Labels
			heatMapContainer.add(getDummyComp());
			heatMapContainer.add(getDummyComp());
			for(var xCounter=0;xCounter<xAxisBands.length;xCounter++){
				heatMapContainer.add(getXAxisLabelComponent(xAxisBands[xCounter]));
			}
			
			
			//Add XAxis Label
			heatMapContainer.add(getDummyComp());
			heatMapContainer.add(getDummyComp());
			heatMapContainer.add(getXAxisComp());
			
			// Add Legend
			if(me.LegendPosition == 'bottom'){
				heatMapContainer.add(getLegend());
			}
			
		};
		
		//get legend component
		function getLegend(){
			
			if (me.LegendPosition == 'right' || me.LegendPosition == 'left') {
				var legendTable = Ext.widget({
					xtype: 'container',
					itemId: 'legend',
					layout: {
						type: 'table',
						columns: 2
					},
					rowspan: yAxisBands.length + 3,
					type: 'legend'
				});
			}else{
				var legendTable = Ext.widget({
					xtype: 'container',
					itemId: 'legend',
					layout: {
						type: 'column',
						align:'stretch'
					},
					colspan:xAxisBands.length + 2,
					type: 'legend',
					flex:1
				});
			}
			
			//Add Legend Title
			if(me.LegendPosition == 'right' || me.LegendPosition == 'left'){
				legendTable.add({xtype:'label',text:me.colorConfig.axisLabel,colspan:2,type:'legendlabel'});
			}
			for(var counter=0;counter<colorBands.length;counter++){
				var colorIndicator = Ext.widget('component',{
									html:'<div style="border-radius:2px;width:10px;height:10px;background-color:' + me.colors[counter] +  '"></div>',
									flex:1
									});
				legendTable.add(colorIndicator);
				legendTable.add({xtype:'label',text:colorBands[counter],flex:4});	
			}
			return legendTable;
		}
		
		//get Title component
		function getTitleComp(){
			var component = {xtype:'label',text:me.hasOwnProperty('titleConfig')?me.titleConfig.title:me.title};
			if(me.titleConfig.hasOwnProperty('component')){
				component = me.titleConfig.component;
				component.value =me.hasOwnProperty('titleConfig')?me.titleConfig.title:me.title;
			}
			component.colspan = xAxisBands.length + 2;
			component.type ='title';
			return Ext.widget(component);
			
		}
		
		//get dummy place holder
		function getDummyComp(){
			return Ext.widget({
					xtype: 'label',
					text: '',
					type:'dummy'
				});
		}
		
		//get y Axis Label component
		function getYAxisComp(){
			var component = {xtype:'label',text:me.yAxisConfig.hasOwnProperty('axisLabel')?me.yAxisConfig.axisLabel:''};
			if(me.yAxisConfig.hasOwnProperty('labelcomponent')){
				component = me.yAxisConfig.labelcomponent;
				component.value =me.yAxisConfig.hasOwnProperty('axisLabel')?me.yAxisConfig.axisLabel:'';
			}
			component.width =5;
			component.rowspan =yAxisBands.length;
			component.type ='YLabel';
			return Ext.widget(component);
		}
		
		//get the y axis component
		function getYAxisLabelComponent(yAxisValue){
			var component = {xtype:'label',text:yAxisValue};
			if(me.yAxisConfig.hasOwnProperty('component')){
				component = me.yAxisConfig.component;
				component.value =yAxisValue;
			}
			component.type='YBand';
			return Ext.widget(component);
		};
		
		//get x Axis Label component
		function getXAxisComp(){
			var component = {xtype:'label',text:me.xAxisConfig.hasOwnProperty('axisLabel')?me.xAxisConfig.axisLabel:''};
			if(me.xAxisConfig.hasOwnProperty('labelcomponent')){
				component = me.xAxisConfig.labelcomponent;
				component.value =me.xAxisConfig.hasOwnProperty('axisLabel')?me.xAxisConfig.axisLabel:'';
			}
			component.colspan =xAxisBands.length;
			component.type ='XLabel';
			return Ext.widget(component);
		}
		
		//get the x axis component
		function getXAxisLabelComponent(xAxisValue){
			var component = {xtype:'label',text:xAxisValue};
			if(me.xAxisConfig.hasOwnProperty('component')){
				component = me.xAxisConfig.component;
				component.value =xAxisValue;
				
			}
			component.type = 'XBand';
			return Ext.widget(component);
		};
		
		//get value component
		function getValueComponent(value,xIdx,yIdx){
			var component = {xtype:'label',text:value};
			if(me.valueConfig.hasOwnProperty('component')){
				component = me.valueConfig.component;
				component.value =value;
			}
			component.xIndex=xIdx,
			component.yIndex=yIdx,
			component.type='Value'
			return Ext.widget(component);
		};
		
		//Attach listeners
		function attachListeners(){
				me.down('label').getEl().on('mouseup',function(){this.resetLayout()},me);
		};
		
		//get color value for a given band
		function getColorValueForBand(colorBand){
			for(var counter=0;counter<colorBands.length;counter++){
				if(colorBands[counter] == colorBand){
					return me.colors[counter];
				}
			}
		}
		
		//Apply css classes
		function applyClasses(){
			
			heatMapContainer.getEl().down('table').addCls('heatmaptable');
			for (var itrItem = 0; itrItem < heatMapContainer.items.getCount(); itrItem++) {
				var item = heatMapContainer.items.get(itrItem);
				
				try{
					switch(item.type){
						case 'Value':
										var intersectionConfig = {};
											intersectionConfig[me.xAxisConfig.axisRef] = xAxisBands[item.xIndex];
											intersectionConfig[me.yAxisConfig.axisRef] = yAxisBands[item.yIndex];
										var colorBand = me.getViewModel().getValueForIntersection(intersectionConfig,[me.colorConfig.axisRef])[me.colorConfig.axisRef]
										var colorValue = getColorValueForBand(colorBand);
										
										item.getEl().up('td').setStyle({'background-color':colorValue});
										
										item.getEl().up('td').addCls('valuecell');
										
										if(item.xIndex == xAxisBands.length-1 && item.yIndex == yAxisBands.length-1){
											item.getEl().up('td').addCls('toprightcell');
										}else if(item.xIndex==0 && item.yIndex == yAxisBands.length-1){
											item.getEl().up('td').addCls('topleftcell');
										}else if(item.xIndex==xAxisBands.length-1 && item.yIndex == 0){
											item.getEl().up('td').addCls('bottomrightcell');
										}else if(item.xIndex==0 && item.yIndex == 0){
											item.getEl().up('td').addCls('bottomleftcell');
										}else if(item.yIndex == yAxisBands.length-1){
											item.getEl().up('td').addCls('topcell');
										}else if(item.xIndex == xAxisBands.length-1){
											item.getEl().up('td').addCls('rightcell');
										}else if(item.xIndex==0){
											item.getEl().up('td').addCls('leftcell');
										}else if(item.yIndex==0){
											item.getEl().up('td').addCls('bottomcell');
										}else{
											item.getEl().up('td').addCls('middlecell');
										}
									break;
						case 'title':
										item.getEl().up('td').addCls('titlecell');
									break;
						case 'YLabel':
										item.getEl().up('td').addCls('ylabel');
										item.getEl().addCls('ylabelLbl');
									break;
						case 'YBand':
										item.getEl().up('td').addCls('yband');
									break;
						case 'XBand':
										item.getEl().up('td').addCls('xband');
									break;
						case 'XLabel':
										item.getEl().up('td').addCls('xlabel');
									break;
						case 'legend':
										item.getEl().up('td').addCls('legend');
									break;
					}
				}catch(e){console.log(e)}
			}
			
			for (var itrItem = 0; itrItem < heatMapContainer.down('container#legend').items.getCount(); itrItem++) {
				var item = heatMapContainer.down('container#legend').items.get(itrItem);
				switch(item.type){
					case 'legendlabel':
									item.getEl().up('td').addCls('legendlabel');
									break;
				}
			}
		}
		
		//Add events
		function addEvents(){
			for (var itrItem = 0; itrItem < heatMapContainer.items.getCount(); itrItem++) {
				var item = heatMapContainer.items.get(itrItem);
				switch (item.type) {
					case 'Value':					
								item.getEl().up('td').on('mouseup','onDataCellClick',me,[item.xIndex,item.yIndex]);
					break;
				}
			}
		}
		
		//Data Cell Click Event
		this.onDataCellClick = function(event,element,options){
			this.fireEvent('dataCellClick',options[0],options[1]);
		}
		
		/********************************************************************************************************
		 *  Priviledged Methods
		 ********************************************************************************************************/
		//update the layout when view model is updated
		this.resetLayout = function(){
			xAxisBands = ['1','2'];
			createEmptyHeatMapContainer();
			addComponents();
			attachListeners();
		};
		
		/********************************************************************************************************
		 *  Initialization
		 ********************************************************************************************************/
		getBands();
		createEmptyHeatMapContainer();
		addComponents();
		
		/********************************************************************************************************
		 *  attach listeners
		 ********************************************************************************************************/
		this.on('boxReady',function(){
		});
		this.on('afterLayout',function(){
			applyClasses();
			addEvents();
		});
	}
	
});
