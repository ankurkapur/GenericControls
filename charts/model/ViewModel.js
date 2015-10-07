/**
 * @author akapur
 */
Ext.define('charts.model.ViewModel',{
	extend:'Ext.app.ViewModel',
	constructor:function(config){
		this.callParent([config]);		
		//write validations to check if the data is in the right format etc. Also this will be place holder to extend this further if need be
	},
	getColumnValues:function(columnName,comparator){
		var uniqueValues = {};
		var columnValues = [];
		var currentData = this.getData().rows;
		for(var counter=0;counter<currentData.length;counter++){			
			if(!uniqueValues.hasOwnProperty(currentData[counter][columnName])){
				columnValues.push(currentData[counter][columnName]);
				uniqueValues[currentData[counter][columnName]] = true;
			}
		}
		
		if (typeof(comparator) === "function") {
			columnValues.sort(comparator);
		}
		
		return columnValues;
	},
	displayColumnValues:function(columnName){
		var columnValues = this.getColumnValues(columnName);
		for(var counter=0;counter<columnValues.length;counter++){
			console.log(columnValues[counter]);
		}
	},
	getValueForIntersection:function(intersectionPoints,seriesRequested){
	var found = true;
	var seriesValues = {};
	var dataCounter=0;
	
	for (dataCounter = 0; dataCounter < this.getData().rows.length; dataCounter++) {
		found = true;
		for (var key in intersectionPoints) {
					
					if (!(this.getData().rows[dataCounter][key] == intersectionPoints[key])) {
					
						found = false;
						break;
					}
		}
		if(found == true){
			for(var seriesCounter= 0; seriesCounter<seriesRequested.length;seriesCounter++){
				seriesValues[seriesRequested[seriesCounter]] = "" + this.getData().rows[dataCounter][seriesRequested[seriesCounter]]
			}
			break;
		}
	}
	return seriesValues;
	}
});
