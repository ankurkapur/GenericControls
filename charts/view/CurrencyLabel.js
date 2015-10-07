/**
 * @author akapur
 * Configuration Parameters
 * format:[count of decimal,dot separator,comma separator,currency suffix]
 */
Ext.define('charts.view.CurrencyLabel',{
	extend:'Ext.form.Label',
	alias:'widget.currencylabel',
	constructor:function(config){
		this.callParent([config]);
		this.setText("");
		var finalValue = "" + this.value;
		var individualValues = finalValue.split(" - ");
		finalValue = "";
		
		for (var counter in individualValues) {
			if (this.hasOwnProperty('format')) {
				var args = [];
				args.push(individualValues[counter]);
				[].push.apply(args,this.format);
				finalValue = finalValue + this.formatMoney.apply(this,args) + " - ";
			}
			else {
				finalValue = finalValue + this.formatMoney(individualValues[counter], 0, ".", ",") + " - ";
			}
		}
		finalValue = finalValue.substring(0,finalValue.length-3);
		this.setText(finalValue);
	},
	formatMoney:function(n,c, d, t,sf){
    	c = isNaN(c = Math.abs(c)) ? 2 : c, 
    	d = d == undefined ? "." : d, 
    	t = t == undefined ? "," : t,
		sf = sf == undefined ? "":sf, 
    	s = n < 0 ? "-" : "", 
    	i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
    	j = (j = i.length) > 3 ? j % 3 : 0;
   		return  s + sf + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 	}
});