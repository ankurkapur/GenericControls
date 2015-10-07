/**
 * @author akapur
 */
Ext.define('examples.heatmap.BasicHeatMap',{
	extend:'Ext.container.Viewport',
	alias:'widget.basicHeatMap',	
	requires:['charts.view.HeatMap','charts.view.CurrencyLabel'],
	layout:{type:'hbox',pack:'center'},
	constructor:function(config){
		this.callParent([config]);
		var testViewModel = Ext.create('charts.model.ViewModel',{
				data:{
				rows: [
						{revenue: 20000,margin: '0.5 - 0.6',opportunity: 100,count: 20,oppBand: '0 - 100'}, 
						{revenue: 10000,margin: '0.5 - 0.6',opportunity: 150,count: 10,oppBand: '100 - 200'}, 
						{revenue: 30000,margin: '0.5 - 0.6',opportunity: 200,count: 2,oppBand: '200 - 300'}, 
						{revenue: 40000,margin: '0.5 - 0.6',opportunity: 10,count: 5,oppBand: '300 - 400'}, 
						{revenue: 20000,margin: '0.3 - 0.5',opportunity: 150,count: 1,oppBand: '100 - 200'},
						{revenue: 10000,margin: '0.3 - 0.5',opportunity: 150,count: 20,oppBand: '100 - 200'},
						{revenue: 30000,margin: '0.3 - 0.5',opportunity: 150,count: 6,oppBand: '200 - 300'},
						{revenue: 40000,margin: '0.3 - 0.5',opportunity: 150,count: 9,oppBand: '400 - 500'}
						]
				}
		});
		//testViewModel.displayColumnValues('revenue');
		var heatMapComponent = Ext.widget('vistaarheatmap',{
			viewModel:testViewModel,
			title:'My Heat Map',
			width:600,
			height:300,
			titleConfig: {
				title: 'Region Opp,Customer Opp',
				component: {
					xtype: 'combobox',
					queryMode: 'local',
    				displayField: 'name',
    				valueField: 'name',
					listeners:{
						boxReady:function(){
								var me = this;
								var dataObj = [];
								var valueOptions = this.value.split(',');
								for(var counter=0;counter<valueOptions.length;counter++){
									dataObj.push({name:valueOptions[counter]});
								}
								var tempStore = Ext.create('Ext.data.Store', {
																			    fields: ['name'],
																			    data : dataObj
																			});
								this.setStore(tempStore);
								this.setValue(this.value.split(',')[0]);
								this.updateLayout();
								 
							},
							change:function(me, newValue, oldValue, eOpts ){
								if (!me.hasOwnProperty('init')) {
									me.init = true;
								}
								else {
									Ext.Msg.alert('Change', 'New Value : ' + newValue);
								}
							}
					}
				}
			},
			xAxisConfig:{axisRef:'revenue',axisLabel:'revenue',component:{xtype:'currencylabel',format:[2,,",","$"]}},
			LegendPosition:'right',
			yAxisConfig:{axisRef:'margin',axisLabel:'margin',comparator:function(a,b){return b > a}},
			valueConfig:{seriesRef:'count',seriesLabel:'count'},
			colorConfig:{axisRef:'oppBand',seriesRef:'opportunity',axisLabel:'opportunity',seriesLabel:'opportunity',comparatorddd:function(a,b){return b > a}},
			listeners:{
				dataCellClick:function(xIdx,yIdx){
					console.log('You just clicked cell ' + xIdx + ", " + yIdx);
				}
			}
		});
		this.add({xtype:'tbspacer',flex:1});
		this.add(heatMapComponent);
		this.add({xtype:'tbspacer',flex:1});
	}
	
});
